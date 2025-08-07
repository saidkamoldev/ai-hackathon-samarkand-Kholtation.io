package filter

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

// AnalyzeFood @Summary Ovqat tahlili
// @Description Ovqat matnini tahlil qilish va kaloriya hisoblash
// @Tags food
// @Accept json
// @Produce json
// @Param request body AnalyzeFoodRequest true "Ovqat tahlili so'rovi"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /food/analyze [post]
func (h *Handler) AnalyzeFood(c *gin.Context) {
	var req AnalyzeFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// AI server ga so'rov yuborish
	aiResponse, err := h.callAIServer(req.FoodText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI server bilan bog'lanishda xatolik"})
		return
	}

	// Rejani yangilash
	if err := h.updatePlan(req.UserID.String(), req.PlanID.String(), aiResponse); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Rejani yangilashda xatolik"})
		return
	}

	// Ovqat kundaligiga qo'shish
	foodLog := FoodLog{
		UserID:       req.UserID,
		PlanID:       req.PlanID,
		FoodName:     req.FoodText,
		Quantity:     1,
		Unit:         "serving",
		Calories:     (*aiResponse)["TotalCalories"].(float64),
		Protein:      (*aiResponse)["TotalProtein"].(float64),
		Fat:          (*aiResponse)["TotalFat"].(float64),
		Carbohydrate: (*aiResponse)["TotalCarbohydrate"].(float64),
		Water:        (*aiResponse)["TotalWater"].(float64),
		MealType:     req.MealType,
		LoggedAt:     req.LoggedAt,
	}

	if err := h.db.Create(&foodLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ovqat kundaligiga qo'shishda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Ovqat muvaffaqiyatli qo'shildi",
		"analysis": aiResponse,
		"food_log": foodLog,
	})
}

// LogFood @Summary Ovqat kiritish
// @Description Aniq ma'lumotlar bilan ovqat kiritish
// @Tags food
// @Accept json
// @Produce json
// @Param request body LogFoodRequest true "Ovqat ma'lumotlari"
// @Success 200 {object} FoodLogResponse
// @Failure 400 {object} map[string]interface{}
// @Router /food/log [post]
func (h *Handler) LogFood(c *gin.Context) {
	var req LogFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	foodLog := FoodLog{
		UserID:       req.UserID,
		PlanID:       req.PlanID,
		FoodName:     req.FoodName,
		Quantity:     req.Quantity,
		Unit:         req.Unit,
		Calories:     req.Calories,
		Protein:      req.Protein,
		Fat:          req.Fat,
		Carbohydrate: req.Carbohydrate,
		Water:        req.Water,
		MealType:     req.MealType,
		LoggedAt:     req.LoggedAt,
	}

	if err := h.db.Create(&foodLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ovqat kiritishda xatolik"})
		return
	}

	// Rejani yangilash
	if err := h.updatePlanFromFoodLog(req.UserID.String(), req.PlanID.String(), foodLog); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Rejani yangilashda xatolik"})
		return
	}

	response := FoodLogResponse{
		ID:           foodLog.ID,
		UserID:       foodLog.UserID,
		PlanID:       foodLog.PlanID,
		FoodName:     foodLog.FoodName,
		Quantity:     foodLog.Quantity,
		Unit:         foodLog.Unit,
		Calories:     foodLog.Calories,
		Protein:      foodLog.Protein,
		Fat:          foodLog.Fat,
		Carbohydrate: foodLog.Carbohydrate,
		Water:        foodLog.Water,
		MealType:     foodLog.MealType,
		LoggedAt:     foodLog.LoggedAt,
		CreatedAt:    foodLog.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// GetDailySummary @Summary Kunlik hisobot
// @Description Foydalanuvchi uchun kunlik ovqat hisoboti
// @Tags food
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Param date query string false "Sana (YYYY-MM-DD)"
// @Success 200 {object} DailySummary
// @Failure 404 {object} map[string]interface{}
// @Router /food/summary/{user_id} [get]
func (h *Handler) GetDailySummary(c *gin.Context) {
	userID := c.Param("user_id")
	dateStr := c.Query("date")

	var targetDate time.Time
	if dateStr == "" {
		targetDate = time.Now().Truncate(24 * time.Hour)
	} else {
		var err error
		targetDate, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri sana format"})
			return
		}
	}

	var foodLogs []FoodLog
	if err := h.db.Where("user_id = ? AND logged_at >= ? AND logged_at < ?",
		userID, targetDate, targetDate.Add(24*time.Hour)).Find(&foodLogs).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ovqat kundaligi topilmadi"})
		return
	}

	summary := DailySummary{
		Date:          targetDate,
		MealBreakdown: make(map[string]float64),
		FoodCount:     len(foodLogs),
	}

	for _, log := range foodLogs {
		summary.TotalCalories += log.Calories
		summary.TotalProtein += log.Protein
		summary.TotalFat += log.Fat
		summary.TotalCarbohydrate += log.Carbohydrate
		summary.TotalWater += log.Water

		// Ovqat turi bo'yicha kaloriyalar
		summary.MealBreakdown[log.MealType] += log.Calories
	}

	c.JSON(http.StatusOK, summary)
}

// callAIServer AI server ga so'rov yuborish
func (h *Handler) callAIServer(foodText string) (*map[string]interface{}, error) {
	aiServerURL := "http://localhost:8000/api/analyze-food"

	requestBody := map[string]string{
		"food_text": foodText,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(aiServerURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

// updatePlan rejani yangilash
func (h *Handler) updatePlan(userID, planID string, aiResponse *map[string]interface{}) error {
	// Bu yerda plan yangilash logikasi
	return nil
}

// updatePlanFromFoodLog ovqat kundaligidan rejani yangilash
func (h *Handler) updatePlanFromFoodLog(userID, planID string, foodLog FoodLog) error {
	// Bu yerda plan yangilash logikasi
	return nil
}
