package plan

import (
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

// Create @Summary Ovqatlanish rejasi yaratish
// @Description Foydalanuvchi uchun kunlik ovqatlanish rejasi yaratish
// @Tags plans
// @Accept json
// @Produce json
// @Param plan body CreatePlanRequest true "Reja ma'lumotlari"
// @Success 201 {object} PlanResponse
// @Failure 400 {object} map[string]interface{}
// @Router /plans [post]
func (h *Handler) Create(c *gin.Context) {
	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan := Plan{
		UserID:       req.UserID,
		Date:         req.Date,
		CalorieGoal:  req.CalorieGoal,
		ProteinGoal:  req.ProteinGoal,
		FatGoal:      req.FatGoal,
		CarbGoal:     req.CarbGoal,
		WaterGoal:    req.WaterGoal,
	}

	if err := h.db.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Reja yaratishda xatolik"})
		return
	}

	response := plan.CalculateProgress()
	c.JSON(http.StatusCreated, response)
}

// GetByUserID @Summary Foydalanuvchi rejalarini olish
// @Description Foydalanuvchi ID bo'yicha rejalarni olish
// @Tags plans
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Success 200 {array} PlanResponse
// @Failure 404 {object} map[string]interface{}
// @Router /plans/{user_id} [get]
func (h *Handler) GetByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	
	var plans []Plan
	if err := h.db.Where("user_id = ?", userID).Find(&plans).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rejalar topilmadi"})
		return
	}

	var responses []PlanResponse
	for _, plan := range plans {
		responses = append(responses, plan.CalculateProgress())
	}

	c.JSON(http.StatusOK, responses)
}

// Update @Summary Rejani yangilash
// @Description Ovqatlanish rejasini yangilash
// @Tags plans
// @Accept json
// @Produce json
// @Param id path string true "Reja ID"
// @Param plan body UpdatePlanRequest true "Yangilanish ma'lumotlari"
// @Success 200 {object} PlanResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /plans/{id} [put]
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	
	var req UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var plan Plan
	if err := h.db.Where("id = ?", id).First(&plan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reja topilmadi"})
		return
	}

	// Faqat berilgan maydonlarni yangilash
	if req.CalorieConsumed != nil {
		plan.CalorieConsumed = *req.CalorieConsumed
	}
	if req.ProteinConsumed != nil {
		plan.ProteinConsumed = *req.ProteinConsumed
	}
	if req.FatConsumed != nil {
		plan.FatConsumed = *req.FatConsumed
	}
	if req.CarbConsumed != nil {
		plan.CarbConsumed = *req.CarbConsumed
	}
	if req.WaterConsumed != nil {
		plan.WaterConsumed = *req.WaterConsumed
	}

	if err := h.db.Save(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Yangilashda xatolik"})
		return
	}

	response := plan.CalculateProgress()
	c.JSON(http.StatusOK, response)
}

// GetTodayPlan @Summary Bugungi rejani olish
// @Description Foydalanuvchi uchun bugungi rejani olish
// @Tags plans
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Success 200 {object} PlanResponse
// @Failure 404 {object} map[string]interface{}
// @Router /plans/{user_id}/today [get]
func (h *Handler) GetTodayPlan(c *gin.Context) {
	userID := c.Param("user_id")
	today := time.Now().Truncate(24 * time.Hour)
	
	var plan Plan
	if err := h.db.Where("user_id = ? AND date >= ? AND date < ?", 
		userID, today, today.Add(24*time.Hour)).First(&plan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bugungi reja topilmadi"})
		return
	}

	response := plan.CalculateProgress()
	c.JSON(http.StatusOK, response)
} 