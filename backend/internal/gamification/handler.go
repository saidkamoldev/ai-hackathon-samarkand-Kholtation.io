package gamification

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

// GetUserStats @Summary Foydalanuvchi statistikasi
// @Description Foydalanuvchi gamifikatsiya statistikasini olish
// @Tags gamification
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Success 200 {object} UserStats
// @Failure 404 {object} map[string]interface{}
// @Router /gamification/{user_id} [get]
func (h *Handler) GetUserStats(c *gin.Context) {
	userID := c.Param("user_id")

	var gamification Gamification
	if err := h.db.Where("user_id = ?", userID).First(&gamification).Error; err != nil {
		// Agar gamifikatsiya yo'q bo'lsa, yangi yaratish
		gamification = Gamification{
			UserID:     uuid.MustParse(userID),
			Level:      1,
			Experience: 0,
			Streak:     0,
			TotalDays:  0,
			LastLogin:  time.Now(),
		}
		h.db.Create(&gamification)
	} else {
		// Streak yangilash
		gamification.UpdateStreak()
		h.db.Save(&gamification)
	}

	// Yutuqlarni olish
	var achievements []Achievement
	h.db.Where("user_id = ?", userID).Order("earned_at desc").Limit(5).Find(&achievements)

	stats := UserStats{
		UserID:             gamification.UserID,
		Level:              gamification.Level,
		Experience:         gamification.Experience,
		ExperienceToNext:   gamification.GetExperienceToNext(),
		Streak:             gamification.Streak,
		TotalDays:          gamification.TotalDays,
		CaloriesGoal:       gamification.CaloriesGoal,
		WaterGoal:          gamification.WaterGoal,
		ProteinGoal:        gamification.ProteinGoal,
		TotalAchievements:  len(achievements),
		RecentAchievements: achievements,
		LastLogin:          gamification.LastLogin,
	}

	c.JSON(http.StatusOK, stats)
}

// AddAchievement @Summary Yutuq qo'shish
// @Description Foydalanuvchiga yangi yutuq qo'shish
// @Tags gamification
// @Accept json
// @Produce json
// @Param achievement body Achievement true "Yutuq ma'lumotlari"
// @Success 200 {object} Achievement
// @Failure 400 {object} map[string]interface{}
// @Router /gamification/achievements [post]
func (h *Handler) AddAchievement(c *gin.Context) {
	var achievement Achievement
	if err := c.ShouldBindJSON(&achievement); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	achievement.EarnedAt = time.Now()

	if err := h.db.Create(&achievement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Yutuq qo'shishda xatolik"})
		return
	}

	// Foydalanuvchi tajribasini oshirish
	var gamification Gamification
	err := h.db.Where("user_id = ?", achievement.UserID).First(&gamification).Error
	if err == nil {
		gamification.AddExperience(100) // Har bir yutuq uchun 100 XP
		h.db.Save(&gamification)
	}

	c.JSON(http.StatusOK, achievement)
}

// UpdateProgress @Summary Progress yangilash
// @Description Foydalanuvchi progressini yangilash
// @Tags gamification
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Param progress body map[string]interface{} true "Progress ma'lumotlari"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /gamification/{user_id}/progress [put]
func (h *Handler) UpdateProgress(c *gin.Context) {
	userID := c.Param("user_id")

	var progressData map[string]interface{}
	if err := c.ShouldBindJSON(&progressData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var gamification Gamification
	if err := h.db.Where("user_id = ?", userID).First(&gamification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gamifikatsiya topilmadi"})
		return
	}

	// Progress yangilash
	if caloriesGoal, ok := progressData["calories_goal"].(float64); ok {
		gamification.CaloriesGoal = int(caloriesGoal)
	}
	if waterGoal, ok := progressData["water_goal"].(float64); ok {
		gamification.WaterGoal = int(waterGoal)
	}
	if proteinGoal, ok := progressData["protein_goal"].(float64); ok {
		gamification.ProteinGoal = int(proteinGoal)
	}

	// Tajriba qo'shish
	if exp, ok := progressData["experience"].(float64); ok {
		gamification.AddExperience(int(exp))
	}

	if err := h.db.Save(&gamification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Progress yangilashda xatolik"})
		return
	}

	// Yangi yutuqlarni tekshirish
	newAchievements := gamification.CheckAchievements()
	for _, achievement := range newAchievements {
		h.db.Create(&achievement)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Progress muvaffaqiyatli yangilandi",
		"new_achievements": newAchievements,
	})
}

// GetLeaderboard @Summary Liderlar jadvali
// @Description Eng yaxshi foydalanuvchilar ro'yxati
// @Tags gamification
// @Accept json
// @Produce json
// @Param limit query int false "Natija soni (default: 10)"
// @Success 200 {array} map[string]interface{}
// @Router /gamification/leaderboard [get]
func (h *Handler) GetLeaderboard(c *gin.Context) {
	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	var leaderboard []map[string]interface{}

	// Eng yuqori darajadagi foydalanuvchilar
	h.db.Table("gamifications").
		Select("user_id, level, experience, streak, total_days").
		Order("level desc, experience desc").
		Limit(limit).
		Scan(&leaderboard)

	c.JSON(http.StatusOK, leaderboard)
}

// GetAchievements @Summary Yutuqlar ro'yxati
// @Description Foydalanuvchi yutuqlarini olish
// @Tags gamification
// @Accept json
// @Produce json
// @Param user_id path string true "Foydalanuvchi ID"
// @Success 200 {array} Achievement
// @Router /gamification/{user_id}/achievements [get]
func (h *Handler) GetAchievements(c *gin.Context) {
	userID := c.Param("user_id")

	var achievements []Achievement
	h.db.Where("user_id = ?", userID).Order("earned_at desc").Find(&achievements)

	c.JSON(http.StatusOK, achievements)
}
