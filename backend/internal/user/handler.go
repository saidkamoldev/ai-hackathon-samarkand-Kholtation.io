package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

// Create @Summary Foydalanuvchi yaratish
// @Description Yangi foydalanuvchi ro'yxatdan o'tkazish
// @Tags users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "Foydalanuvchi ma'lumotlari"
// @Success 201 {object} UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /users [post]
func (h *Handler) Create(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parolni hash qilish
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Parol hash qilishda xatolik"})
		return
	}

	user := User{
		Name:          req.Name,
		Email:         req.Email,
		Password:      string(hashedPassword),
		Age:           req.Age,
		Height:        req.Height,
		Weight:        req.Weight,
		Gender:        req.Gender,
		ActivityLevel: req.ActivityLevel,
		Goal:          req.Goal,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Foydalanuvchi yaratishda xatolik"})
		return
	}

	response := UserResponse{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		Age:           user.Age,
		Height:        user.Height,
		Weight:        user.Weight,
		Gender:        user.Gender,
		ActivityLevel: user.ActivityLevel,
		Goal:          user.Goal,
		CreatedAt:     user.CreatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetByID @Summary Foydalanuvchi ma'lumotlarini olish
// @Description ID bo'yicha foydalanuvchi ma'lumotlarini olish
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "Foydalanuvchi ID"
// @Success 200 {object} UserResponse
// @Failure 404 {object} map[string]interface{}
// @Router /users/{id} [get]
func (h *Handler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var user User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
		return
	}

	response := UserResponse{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		Age:           user.Age,
		Height:        user.Height,
		Weight:        user.Weight,
		Gender:        user.Gender,
		ActivityLevel: user.ActivityLevel,
		Goal:          user.Goal,
		CreatedAt:     user.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// Update @Summary Foydalanuvchi ma'lumotlarini yangilash
// @Description Foydalanuvchi ma'lumotlarini yangilash
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "Foydalanuvchi ID"
// @Param user body UpdateUserRequest true "Yangilanish ma'lumotlari"
// @Success 200 {object} UserResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /users/{id} [put]
func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
		return
	}

	// Faqat berilgan maydonlarni yangilash
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Age != nil {
		user.Age = *req.Age
	}
	if req.Height != nil {
		user.Height = *req.Height
	}
	if req.Weight != nil {
		user.Weight = *req.Weight
	}
	if req.Gender != nil {
		user.Gender = *req.Gender
	}
	if req.ActivityLevel != nil {
		user.ActivityLevel = *req.ActivityLevel
	}
	if req.Goal != nil {
		user.Goal = *req.Goal
	}

	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Yangilashda xatolik"})
		return
	}

	response := UserResponse{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		Age:           user.Age,
		Height:        user.Height,
		Weight:        user.Weight,
		Gender:        user.Gender,
		ActivityLevel: user.ActivityLevel,
		Goal:          user.Goal,
		CreatedAt:     user.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// Login @Summary Foydalanuvchi kirish
// @Description Email va parol bilan tizimga kirish
// @Tags users
// @Accept json
// @Produce json
// @Param credentials body LoginRequest true "Kirish ma'lumotlari"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Noto'g'ri email yoki parol"})
		return
	}

	// Parolni tekshirish
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Noto'g'ri email yoki parol"})
		return
	}

	// JWT token yaratish (bu yerda soddalashtirilgan)
	token := "jwt-token-here" // Haqiqiy implementatsiyada JWT yaratiladi

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": UserResponse{
			ID:            user.ID,
			Name:          user.Name,
			Email:         user.Email,
			Age:           user.Age,
			Height:        user.Height,
			Weight:        user.Weight,
			Gender:        user.Gender,
			ActivityLevel: user.ActivityLevel,
			Goal:          user.Goal,
			CreatedAt:     user.CreatedAt,
		},
	})
}
