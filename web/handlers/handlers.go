package handlers

import (
	"context"
	"fmt"
	"healthPilot/store"
	"healthPilot/store/models" // models paketining to'g'ri yo'li
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"bytes"
	"encoding/json"
	"io/ioutil"

	// "regexp"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"
	"gorm.io/datatypes" // Важно: импортируйте этот пакет
	"gorm.io/gorm"
)

// --- Request/Response Body Structs ---

// GoogleLoginRequest Google ID Tokenni qabul qilish uchun model
type GoogleLoginRequest struct {
	IDToken string `json:"idToken" binding:"required"`
}

// SignUpRequest foydalanuvchi ro'yxatdan o'tishda keladigan ma'lumotlar modeli
type SignUpRequest struct {
	Email        string         `json:"email" binding:"required,email"`
	Password     string         `json:"password" binding:"required,min=6"`
	Name         string         `json:"name" binding:"required"`
	Age          uint           `json:"age" binding:"omitempty"`
	Weight       float64        `json:"weight" binding:"omitempty"`
	Height       float64        `json:"height" binding:"omitempty"`
	Sex          string         `json:"sex" binding:"omitempty"`
	Allergy      bool           `json:"allergy"`
	AllergyType  datatypes.JSON `json:"allergy_type,omitempty"` // Правильный тип
	ActivateType string         `json:"activate_type,omitempty"`
	GoalsType    string         `json:"goals_type,omitempty"`
}

// UpdateUserRequest - foydalanuvchi profilini yangilashda keladigan ma'lumotlar modeli
// Muhim: JSON formatiga mos kelishi uchun nested struct'lar ishlatiladi.
type UpdateUserRequest struct {
	Name     *string              `json:"name,omitempty"`
	Age      *uint                `json:"age,omitempty"`
	Password *string              `json:"password,omitempty"` // Parolni yangilash uchun maydon
	Health   *UpdateHealthRequest `json:"health,omitempty"`
	Goals    *UpdateGoalsRequest  `json:"goals,omitempty"`
}

// UpdateHealthRequest Health struct'idagi yangilanadigan maydonlar modeli
type UpdateHealthRequest struct {
	Weight   *float64               `json:"weight,omitempty"`
	Height   *float64               `json:"height,omitempty"`
	Sex      *string                `json:"sex,omitempty"`
	Allergy  *UpdateAllergyRequest  `json:"allergy,omitempty"`  // Nested Allergy
	Activate *UpdateActivateRequest `json:"activate,omitempty"` // Nested Activate
}

// UpdateGoalsRequest Goals struct'idagi yangilanadigan maydonlar modeli
type UpdateGoalsRequest struct {
	GoalsType *string `json:"goals_type,omitempty"`
}

// UpdateAllergyRequest Allergy struct'idagi yangilanadigan maydonlar modeli
type UpdateAllergyRequest struct {
	Allergy     *bool           `json:"allergy,omitempty"`
	AllergyType *datatypes.JSON `json:"allergy_type,omitempty"` // Правильный тип: *datatypes.JSON
}

// UpdateActivateRequest Activate struct'idagi yangilanadigan maydonlar modeli
type UpdateActivateRequest struct {
	ActivateType *string `json:"activate_type,omitempty"`
}

// Gemini API uchun so‘rov va javob strukturasi
type GeminiNutritionRequest struct {
	Age      uint    `json:"age"`
	Sex      string  `json:"sex"`
	Weight   float64 `json:"weight"`
	Height   float64 `json:"height"`
	Activity string  `json:"activity"`
	Goal     string  `json:"goal"`
}

type GeminiNutritionResponse struct {
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	Water    float64 `json:"water"`
}

// Challenge yaratish uchun so‘rov modeli
// Masalan: name, type, description, start_date, end_date, reward_points
// start_date va end_date: RFC3339 format ("2024-06-01T00:00:00Z")
type CreateChallengeRequest struct {
	Name         string    `json:"name" binding:"required"`
	Type         string    `json:"type" binding:"required"`
	Description  string    `json:"description"`
	StartDate    time.Time `json:"start_date" binding:"required"`
	EndDate      time.Time `json:"end_date" binding:"required"`
	RewardPoints int       `json:"reward_points" binding:"required"`
}

type JoinChallengeRequest struct {
	ChallengeID uint `json:"challenge_id" binding:"required"`
}

type UpdateUserChallengeRequest struct {
	Progress      float64 `json:"progress"`
	Status        string  `json:"status"` // "active", "completed", "failed"
	Result        string  `json:"result"`
	AwardedPoints int     `json:"awarded_points"`
}

// --- Handler Struct for Dependency Injection ---

type Handlers struct {
	Store             *store.Store
	GoogleWebClientID string
	JWTSecretKey      []byte
	GeminiAPIKey      string
	mutex             *sync.Mutex // Goroutine uchun mutex
}

func NewHandlers(s *store.Store) *Handlers {
    webClientID := os.Getenv("GOOGLE_WEB_CLIENT_ID")
    if webClientID == "" {
        log.Fatal("GOOGLE_WEB_CLIENT_ID environment variable not set. This is required for Google OAuth.")
    }

    jwtSecret := os.Getenv("JWT_SECRET_KEY")
    if jwtSecret == "" {
        log.Fatal("JWT_SECRET_KEY environment variable not set. This is required for JWT generation.")
    }

    // Получаем все 10 ключей из переменных окружения
    var geminiAPIKeys []string
    for i := 1; i <= 10; i++ {
        key := os.Getenv(fmt.Sprintf("GEMINI_API_KEY%d", i))
        if key != "" {
            geminiAPIKeys = append(geminiAPIKeys, key)
        }
    }

    if len(geminiAPIKeys) == 0 {
        log.Fatal("At least one GEMINI_API_KEY_1 environment variable must be set. This is required for Gemini API.")
    }

    return &Handlers{
        Store:             s,
        GoogleWebClientID: webClientID,
        JWTSecretKey:      []byte(jwtSecret),
        GeminiAPIKeys:     geminiAPIKeys,
        keyIndex:          0,
        mutex:             &sync.Mutex{},
    }
}

func (h *Handlers) GetGeminiKey() string {
    h.mutex.Lock()
    defer h.mutex.Unlock()

    key := h.GeminiAPIKeys[h.keyIndex]
    h.keyIndex = (h.keyIndex + 1) % len(h.GeminiAPIKeys)

    return key
}

// --- Actual Handler Functions (Methods of Handlers struct) ---

// @Summary Foydalanuvchini Google orqali tizimga kiritish yoki ro'yxatdan o'tkazish
// @Description Google ID Token yordamida foydalanuvchini autentifikatsiya qiladi. Agar foydalanuvchi mavjud bo'lmasa, uni yangi hisob sifatida ro'yxatdan o'tkazadi.
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body GoogleLoginRequest true "Google ID Token"
// @Success 200 {object} map[string]interface{} "Muvaffaqiyatli kirish/ro'yxatdan o'tish (token va foydalanuvchi ma'lumotlari bilan)"
// @Failure 400 {object} map[string]string "Invalid input: ID Token missing or malformed"
// @Failure 401 {object} map[string]string "Invalid Google ID token"
// @Failure 500 {object} map[string]string "Server xatosi (DB ulanishi yoki foydalanuvchi yaratishda)"
// @Router /auth/google [post]
// @Example request
//
//	{
//	  "IDToken": "ya.valid.google.id.token"
//	}
//
// @Example response
//
//	{
//	  "token": "jwt_token_here",
//	  "user": { ... }
//	}
func (h *Handlers) GoogleLoginHandler(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	payload, err := idtoken.Validate(context.Background(), req.IDToken, h.GoogleWebClientID)
	if err != nil {
		log.Printf("Google ID Token validation failed: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google ID token"})
		return
	}

	email := fmt.Sprintf("%v", payload.Claims["email"])
	name := fmt.Sprintf("%v", payload.Claims["name"])
	googleUserID := fmt.Sprintf("%v", payload.Claims["sub"])

	var user models.User
	result := h.Store.DB.Where("email = ?", email).First(&user)

	if result.Error == gorm.ErrRecordNotFound {
		log.Printf("New user detected via Google: %s. Creating new account.", email)
		user = models.User{
			Email:    email,
			Name:     name,
			GoogleID: strPtr(googleUserID),
		}
		createResult := h.Store.DB.Create(&user)
		if createResult.Error != nil {
			log.Printf("Failed to create new user from Google login: %v\n", createResult.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
			return
		}
	} else if result.Error != nil {
		log.Printf("Database error during Google login: %v\n", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	} else {
		log.Printf("Existing user logged in via Google: %s. Updating info (if any).", email)
		if user.GoogleID == nil || *user.GoogleID == "" {
			user.GoogleID = strPtr(googleUserID)
			h.Store.DB.Save(&user)
		}
		if user.Name != name {
			user.Name = name
			h.Store.DB.Save(&user)
		}
	}

	// --- Agar foydalanuvchida to'liq ma'lumotlar bo'lsa, target yaratish ---
	log.Printf("Checking target creation for user %d: age=%d, weight=%.1f, height=%.1f, sex=%s, activity=%s, goal=%s",
		user.ID, user.Age, user.Health.Weight, user.Health.Height, user.Health.Sex, user.Health.Activate.ActivateType, user.Goals.GoalsType)

	if user.Age > 0 && user.Health.Weight > 0 && user.Health.Height > 0 && user.Health.Sex != "" && user.Health.Activate.ActivateType != "" && user.Goals.GoalsType != "" {
		// Bugungi kun uchun target mavjudligini tekshirish
		var existingTarget models.UserDailyTarget
		today := time.Now().Format("2006-01-02")
		targetResult := h.Store.DB.Where("user_id = ? AND date = ?", user.ID, today).First(&existingTarget)

		if targetResult.Error == gorm.ErrRecordNotFound {
			// Target yo'q, yangi target yaratish
			log.Printf("Creating daily target for user %d on %s", user.ID, today)
			req := GeminiNutritionRequest{
				Age:      user.Age,
				Sex:      user.Health.Sex,
				Weight:   user.Health.Weight,
				Height:   user.Health.Height,
				Activity: user.Health.Activate.ActivateType,
				Goal:     user.Goals.GoalsType,
			}
			if target, err := h.getGeminiNutritionTarget(req); err == nil {
				h.Store.DB.Create(&models.UserDailyTarget{
					UserID:   user.ID,
					Date:     today,
					Calories: target.Calories,
					Protein:  target.Protein,
					Carbs:    target.Carbs,
					Fat:      target.Fat,
					Water:    target.Water,
				})
				log.Printf("Daily target created successfully for user %d", user.ID)
			} else {
				log.Printf("Failed to create daily target for user %d: %v", user.ID, err)
			}
		} else if targetResult.Error != nil {
			log.Printf("Error checking existing target for user %d: %v", user.ID, targetResult.Error)
		} else {
			log.Printf("Daily target already exists for user %d on %s", user.ID, today)
		}
	} else {
		log.Printf("User %d missing required data for target creation: age=%d, weight=%.1f, height=%.1f, sex=%s, activity=%s, goal=%s",
			user.ID, user.Age, user.Health.Weight, user.Health.Height, user.Health.Sex, user.Health.Activate.ActivateType, user.Goals.GoalsType)
	}

	token, err := h.generateJWT(user)
	if err != nil {
		log.Printf("Failed to generate JWT token for Google login: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

// @Summary Foydalanuvchini email va parol orqali ro'yxatdan o'tkazish
// @Description Yangi foydalanuvchini email, parol va boshqa ma'lumotlar bilan ro'yxatdan o'tkazadi.
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body SignUpRequest true "Ro'yxatdan o'tish ma'lumotlari"
// @Success 201 {object} map[string]interface{} "Foydalanuvchi muvaffaqiyatli yaratildi"
// @Failure 400 {object} map[string]string "Invalid input data"
// @Failure 409 {object} map[string]string "User with this email already exists"
// @Failure 500 {object} map[string]string "Server xatosi"
// @Router /signup [post]
// @Example request
//
//	{
//	  "email": "test@example.com",
//	  "password": "password123",
//	  "name": "Test User",
//	  "age": 25,
//	  "weight": 70,
//	  "height": 175,
//	  "sex": "Male",
//	  "allergy": false,
//	  "allergy_type": [],
//	  "activate_type": "moderate_activity",
//	  "goals_type": "weight_loss"
//	}
//
// @Example response
//
//	{
//	  "message": "User created successfully",
//	  "user": { ... },
//	  "token": "jwt_token_here"
//	}
func (h *Handlers) SignUpHandler(c *gin.Context) {
	var req SignUpRequest

	log.Printf("Signup request: %+v", req)

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data: " + err.Error()})
		return
	}

	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Если AllergyType из запроса пуст или nil, убедимся, что мы передаем пустой JSON-массив
	var allergyTypeJSON datatypes.JSON
	if req.AllergyType != nil {
		allergyTypeJSON = req.AllergyType
	} else {
		allergyTypeJSON = datatypes.JSON("[]") // Представляем пустой массив как "[]" в JSON
	}

	user := models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Name:     req.Name,
		Age:      req.Age,
		// GoogleID: nil, // Устанавливаем в nil для регистраций не через Google
		Health: models.Health{
			Weight: req.Weight,
			Height: req.Height,
			Sex:    req.Sex,
			Allergy: models.Allergy{
				Allergy:     req.Allergy,
				AllergyType: allergyTypeJSON, // Используем подготовленный JSON
			},
			Activate: models.Activate{
				ActivateType: req.ActivateType,
			},
		},
		Goals: models.Goals{
			GoalsType: req.GoalsType,
		},
	}

	if err := h.Store.DB.Create(&user).Error; err != nil {
		// Улучшенное распознавание ошибок уникальных ограничений
		if err.Error() == `ERROR: duplicate key value violates unique constraint "uni_users_email" (SQLSTATE 23505)` ||
			err.Error() == `ERROR: duplicate key value violates unique constraint "idx_users_google_id" (SQLSTATE 23505)` {
			c.JSON(http.StatusConflict, gin.H{"error": "User with this email or Google ID already exists"})
			return
		}
		log.Printf("Failed to create user in DB: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// --- Goroutine orqali Gemini API target hisoblash ---
	// Bu HTTP javobini bloklamaydi va foydalanuvchi tezroq javob oladi
	go h.calculateAndSaveTarget(user)

	token, err := h.generateJWT(user)
	if err != nil {
		log.Printf("Failed to generate JWT token for signup: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": user, "token": token})
}

// calculateAndSaveTarget - goroutine orqali target hisoblash va saqlash
func (h *Handlers) calculateAndSaveTarget(user models.User) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if user.Age > 0 && user.Health.Weight > 0 && user.Health.Height > 0 && user.Health.Sex != "" && user.Health.Activate.ActivateType != "" && user.Goals.GoalsType != "" {
		req := GeminiNutritionRequest{
			Age:      user.Age,
			Sex:      user.Health.Sex,
			Weight:   user.Health.Weight,
			Height:   user.Health.Height,
			Activity: user.Health.Activate.ActivateType,
			Goal:     user.Goals.GoalsType,
		}
		if target, err := h.getGeminiNutritionTarget(req); err == nil {
			h.Store.DB.Create(&models.UserDailyTarget{
				UserID:   user.ID,
				Date:     time.Now().Format("2006-01-02"),
				Calories: target.Calories,
				Protein:  target.Protein,
				Carbs:    target.Carbs,
				Fat:      target.Fat,
				Water:    target.Water,
			})
		} else {
			// Xatolikni log qilish
			log.Printf("Failed to get Gemini nutrition target for user %d: %v", user.ID, err)
		}
	}
}

// @Summary Foydalanuvchini email va parol orqali tizimga kiritish
// @Description Ro'yxatdan o'tgan foydalanuvchini email va parol bilan autentifikatsiya qiladi.
// @Tags Auth
// @Accept json
// @Produce json
// @Param input body models.Login true "Kirish ma'lumotlari (Email va Parol)"
// @Success 200 {object} map[string]interface{} "Tizimga muvaffaqiyatli kirildi (token va foydalanuvchi ma'lumotlari bilan)"
// @Failure 400 {object} map[string]string "Invalid input data"
// @Failure 401 {object} map[string]string "Invalid email or password"
// @Failure 403 {object} map[string]string "This account does not have a password. Please log in with Google or set a password via profile update."
// @Failure 500 {object} map[string]string "Server xatosi"
// @Router /login [post]
// @Example request
//
//	{
//	  "email": "test@example.com",
//	  "password": "password123"
//	}
//
// @Example response
//
//	{
//	  "token": "jwt_token_here",
//	  "user": { ... }
//	}
func (h *Handlers) LoginHandler(c *gin.Context) {
	var input models.Login // models.Login struct'i sizning models.go faylingizda ekanligini tekshiring

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data: " + err.Error()})
		return
	}

	var user models.User
	if err := h.Store.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		log.Printf("Database error during login: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if user.Password == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "This account does not have a password. Please log in with Google or set a password via profile update."})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := h.generateJWT(user)
	if err != nil {
		log.Printf("Failed to generate JWT token for login: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate JWT token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

func (h *Handlers) generateJWT(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.JWTSecretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}
	return tokenString, nil
}

// Gemini API ga so‘rov yuborish va natijani qaytarish
func (h *Handlers) getGeminiNutritionTarget(req GeminiNutritionRequest) (GeminiNutritionResponse, error) {
	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + h.GeminiAPIKey
	prompt := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{
						"text": fmt.Sprintf(
							"Foydalanuvchi uchun quyidagi ma'lumotlar: yosh: %d, jins: %s, bo'yi: %.1f sm, vazni: %.1f kg, activity: %s, maqsad: %s. Shu ma'lumotlarga asoslanib, unga kunlik iste'mol qilishi kerak bo'lgan kaloriyalar, oqsil (g), uglevod (g), yog' (g) va suv (ml) miqdorini JSON ko'rinishida qaytar: {\\\"calories\\\":..., \\\"protein\\\":..., \\\"carbs\\\":..., \\\"fat\\\":..., \\\"water\\\":...}",
							req.Age, req.Sex, req.Height, req.Weight, req.Activity, req.Goal,
						),
					},
				},
			},
		},
	}
	body, _ := json.Marshal(prompt)
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Gemini API so'rov xatoligi: %v", err)
		return GeminiNutritionResponse{}, err
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	log.Printf("Gemini API javobi: %s", string(respBody))
	// Gemini javobidan faqat JSON qismni ajratib olish (model javobi text bo'lishi mumkin)
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(respBody, &geminiResp); err != nil {
		log.Printf("Gemini javobini JSONga ajratishda xato: %v", err)
		return GeminiNutritionResponse{}, err
	}
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		log.Printf("Gemini javobida natija yo'q")
		return GeminiNutritionResponse{}, fmt.Errorf("Gemini javobida natija yo'q")
	}
	// Textdan faqat JSON blokini ajratib olish
	text := geminiResp.Candidates[0].Content.Parts[0].Text
	log.Printf("Gemini text: %s", text)
	jsonBlock := ExtractJSONBlock(text)
	if jsonBlock == "" {
		log.Printf("Gemini javobidan JSON blok topilmadi")
		return GeminiNutritionResponse{}, fmt.Errorf("Gemini javobidan JSON blok topilmadi")
	}
	var result GeminiNutritionResponse
	if err := json.Unmarshal([]byte(jsonBlock), &result); err != nil {
		log.Printf("Gemini natijasini JSONga ajratishda xato: %v", err)
		return GeminiNutritionResponse{}, err
	}
	log.Printf("Gemini natijasi: %+v", result)
	return result, nil
}

// Foydalanuvchining bugungi AI targetini olish uchun handler
// GET /users/:id/target
// @Summary Foydalanuvchining bugungi AI targetini olish
// @Description Foydalanuvchining bugungi kunlik AI (Gemini) targetini (kaloriya, oqsil, uglevod, yog', suv) qaytaradi.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Foydalanuvchi IDsi"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// @Success 200 {object} models.UserDailyTarget "Foydalanuvchining bugungi AI targeti"
// @Failure 404 {object} map[string]string "Target not found"
// @Router /users/{id}/target [get]
// @Example response
//
//	{
//	  "id": 1,
//	  "user_id": 1,
//	  "date": "2025-07-13",
//	  "calories": 3250,
//	  "protein": 155,
//	  "carbs": 406,
//	  "fat": 81,
//	  "water": 3700,
//	  "created_at": "2025-07-13T20:21:27.57795+05:00",
//	  "updated_at": "2025-07-13T20:21:27.57795+05:00"
//	}
func (h *Handlers) GetUserDailyTarget(c *gin.Context) {
	userID := c.Param("id")
	today := time.Now().Format("2006-01-02")
	var target models.UserDailyTarget
	err := h.Store.DB.Where("user_id = ? AND date = ?", userID, today).First(&target).Error
	if err == nil {
		c.JSON(http.StatusOK, target)
		return
	}

	// Target topilmadi, foydalanuvchi ma'lumotlarini tekshiramiz
	var user models.User
	if err := h.Store.DB.Preload("Health.Activate").Preload("Goals").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Foydalanuvchi ma'lumotlari to'liq bo'lsa, target yaratamiz
	if user.Age > 0 && user.Health.Weight > 0 && user.Health.Height > 0 && user.Health.Sex != "" && user.Health.Activate.ActivateType != "" && user.Goals.GoalsType != "" {
		req := GeminiNutritionRequest{
			Age:      user.Age,
			Sex:      user.Health.Sex,
			Weight:   user.Health.Weight,
			Height:   user.Health.Height,
			Activity: user.Health.Activate.ActivateType,
			Goal:     user.Goals.GoalsType,
		}
		if targetData, err := h.getGeminiNutritionTarget(req); err == nil {
			target = models.UserDailyTarget{
				UserID:   user.ID,
				Date:     today,
				Calories: targetData.Calories,
				Protein:  targetData.Protein,
				Carbs:    targetData.Carbs,
				Fat:      targetData.Fat,
				Water:    targetData.Water,
			}
			h.Store.DB.Create(&target)
			c.JSON(http.StatusOK, target)
			return
		}
	}

	// Target ham, foydalanuvchi ma'lumotlari ham to'liq emas
	c.JSON(http.StatusNotFound, gin.H{"error": "Target not found and user data incomplete"})
}

// @Summary Foydalanuvchining kunlik target statusini olish
// @Description Foydalanuvchining bugungi ovqat statistikasi va AI targetini solishtirib, kunlik limit bajarilgan-bajarilmaganini (completed) va xabarini qaytaradi.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Foydalanuvchi IDsi"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// @Success 200 {object} map[string]interface{} "Kunlik target status va statistikasi"
// @Failure 404 {object} map[string]string "Statistika yoki target topilmadi"
// @Router /users/{id}/target/status [get]
// @Example response
//
//	{
//	  "completed": true,
//	  "message": "Kunlik regimni muvaffaqiyatli yakunladingiz",
//	  "stat": {
//	    "id": 2,
//	    "user_id": 7,
//	    "date": "2025-07-15",
//	    "calories": 21430,
//	    "protein": 211,
//	    "carbs": 314,
//	    "fat": 2134,
//	    "water": 4200,
//	    "description": "...",
//	    "created_at": "2025-07-15T18:38:36.49342+05:00",
//	    "updated_at": "2025-07-15T18:42:58.896576+05:00"
//	  },
//	  "target": {
//	    "id": 6,
//	    "user_id": 7,
//	    "date": "2025-07-15",
//	    "calories": 2900,
//	    "protein": 150,
//	    "carbs": 363,
//	    "fat": 78,
//	    "water": 3750,
//	    "created_at": "2025-07-15T18:39:29.130118+05:00",
//	    "updated_at": "2025-07-15T18:39:29.130118+05:00"
//	  }
//	}
func (h *Handlers) GetUserTargetStatus(c *gin.Context) {
	userID := c.Param("id")
	date := time.Now().Format("2006-01-02")

	var stat models.UserDailyFoodStat
	var target models.UserDailyTarget

	db := h.Store.DB
	err1 := db.Where("user_id = ? AND date = ?", userID, date).First(&stat).Error
	err2 := db.Where("user_id = ? AND date = ?", userID, date).First(&target).Error

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Statistika yoki target topilmadi"})
		return
	}

	completed := stat.Calories >= target.Calories &&
		stat.Protein >= target.Protein &&
		stat.Carbs >= target.Carbs &&
		stat.Fat >= target.Fat &&
		stat.Water >= target.Water

	msg := "Kunlik limit hali bajarilmadi"
	if completed {
		msg = "Kunlik regimni muvaffaqiyatli yakunladingiz"
	}

	c.JSON(http.StatusOK, gin.H{
		"completed": completed,
		"message":   msg,
		"stat":      stat,
		"target":    target,
	})
}

// @Summary Foydalanuvchi profilini yangilash
// @Description Foydalanuvchi profil ma'lumotlarini (ism, yosh, vazn, bo'y, jins, allergiya, faollik turi, maqsadlar, parol) yangilaydi.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Yangilanadigan foydalanuvchining ID'si"
// @Param user body UpdateUserRequest true "Yangilanadigan foydalanuvchi ma'lumotlari"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// @Success 200 {object} map[string]interface{} "Profil muvaffaqiyatli yangilandi (yangilangan foydalanuvchi ma'lumotlari bilan)"
// @Failure 400 {object} map[string]string "Invalid input data"
// @Failure 401 {object} map[string]string "Unauthorized: No token or invalid token"
// @Failure 403 {object} map[string]string "Forbidden: You are not authorized to update this profile"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Server xatosi"
// @Router /users/{id} [put]
// @Example request
//
//	{
//	  "name": "Yangi Ism",
//	  "age": 22,
//	  "password": "newpassword",
//	  "health": {
//	    "weight": 75,
//	    "height": 180,
//	    "sex": "Male",
//	    "allergy": { "allergy": false, "allergy_type": [] },
//	    "activate": { "activate_type": "high_activity" }
//	  },
//	  "goals": { "goals_type": "muscle_gain" }
//	}
//
// @Example response
//
//	{
//	  "message": "Profile updated successfully",
//	  "user": { ... }
//	}
func (h *Handlers) UpdateProfileHandler(c *gin.Context) {
	paramUserID := c.Param("id")
	userIDFromToken, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token. Unauthorized."})
		return
	}

	if fmt.Sprintf("%d", userIDFromToken) != paramUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this profile."})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data: " + err.Error()})
		return
	}

	var user models.User
	if err := h.Store.DB.First(&user, paramUserID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Printf("Database error fetching user for update: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// --- Прямое присваивание полей ---
	// Это предпочтительный способ обновления встроенных структур в GORM.
	// GORM автоматически отслеживает изменения и обновляет нужные столбцы.

	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Age != nil {
		user.Age = *req.Age
	}
	if req.Password != nil && *req.Password != "" {
		hashedPassword, err := hashPassword(*req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
			return
		}
		user.Password = hashedPassword
	}

	// Обновление Health
	if req.Health != nil {
		if req.Health.Weight != nil {
			user.Health.Weight = *req.Health.Weight
		}
		if req.Health.Height != nil {
			user.Health.Height = *req.Health.Height
		}
		if req.Health.Sex != nil {
			user.Health.Sex = *req.Health.Sex
		}

		// Обновление Allergy
		if req.Health.Allergy != nil {
			if req.Health.Allergy.Allergy != nil {
				user.Health.Allergy.Allergy = *req.Health.Allergy.Allergy
			}
			if req.Health.Allergy.AllergyType != nil {
				user.Health.Allergy.AllergyType = *req.Health.Allergy.AllergyType
			} else {
				// Если AllergyType явно передан как null или отсутствует в запросе,
				// устанавливаем его как пустой JSON массив в базе данных.
				// Это важно, чтобы не оставлять старые данные, если они должны быть удалены.
				user.Health.Allergy.AllergyType = datatypes.JSON("[]")
			}
		} else {
			// Если блок Allergy полностью отсутствует в запросе, это означает,
			// что мы не хотим обновлять поля Allergy.
			// Если вы хотите очистить все поля Allergy, когда блок Allergy отсутствует,
			// то раскомментируйте следующую строку:
			// user.Health.Allergy = models.Allergy{AllergyType: datatypes.JSON("[]")}
		}

		// Обновление Activate
		if req.Health.Activate != nil {
			if req.Health.Activate.ActivateType != nil {
				user.Health.Activate.ActivateType = *req.Health.Activate.ActivateType
			} else {
				// Если ActivateType явно передан как null или отсутствует, устанавливаем в пустую строку
				user.Health.Activate.ActivateType = ""
			}
		}
	}

	// Обновление Goals
	if req.Goals != nil {
		if req.Goals.GoalsType != nil {
			user.Goals.GoalsType = *req.Goals.GoalsType
		} else {
			// Если GoalsType явно передан как null или отсутствует, устанавливаем в пустую строку
			user.Goals.GoalsType = ""
		}
	}

	// --- Сохранение изменений в базу данных ---
	// GORM достаточно умен, чтобы понять, какие поля изменились
	// (включая поля во встроенных структурах) и сгенерировать правильный UPDATE SQL.
	if err := h.Store.DB.Save(&user).Error; err != nil {
		log.Printf("Failed to update user profile in DB: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Перезагрузка пользователя для возврата актуальных данных в ответе
	// Это важно, так как после Save() объект user может не содержать все актуальные данные
	// (например, дефолтные значения, сгенерированные БД).
	if err := h.Store.DB.First(&user, paramUserID).Error; err != nil {
		log.Printf("Failed to refetch user after update: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated user data"})
		return
	}

	// --- Gemini API orqali target yangilash ---
	if user.Age > 0 && user.Health.Weight > 0 && user.Health.Height > 0 && user.Health.Sex != "" && user.Health.Activate.ActivateType != "" && user.Goals.GoalsType != "" {
		req := GeminiNutritionRequest{
			Age:      user.Age,
			Sex:      user.Health.Sex,
			Weight:   user.Health.Weight,
			Height:   user.Health.Height,
			Activity: user.Health.Activate.ActivateType,
			Goal:     user.Goals.GoalsType,
		}
		if target, err := h.getGeminiNutritionTarget(req); err == nil {
			// Eski targetni o‘chirish (shu kunga)
			h.Store.DB.Where("user_id = ? AND date = ?", user.ID, time.Now().Format("2006-01-02")).Delete(&models.UserDailyTarget{})
			h.Store.DB.Create(&models.UserDailyTarget{
				UserID:   user.ID,
				Date:     time.Now().Format("2006-01-02"),
				Calories: target.Calories,
				Protein:  target.Protein,
				Carbs:    target.Carbs,
				Fat:      target.Fat,
				Water:    target.Water,
			})
		}
	}

	// --- Goroutine orqali target yangilash ---
	// Bu HTTP javobini bloklamaydi va foydalanuvchi tezroq javob oladi
	go h.updateAndSaveTarget(user)

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "user": user})
}

// updateAndSaveTarget - goroutine orqali target yangilash va saqlash
func (h *Handlers) updateAndSaveTarget(user models.User) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if user.Age > 0 && user.Health.Weight > 0 && user.Health.Height > 0 && user.Health.Sex != "" && user.Health.Activate.ActivateType != "" && user.Goals.GoalsType != "" {
		req := GeminiNutritionRequest{
			Age:      user.Age,
			Sex:      user.Health.Sex,
			Weight:   user.Health.Weight,
			Height:   user.Health.Height,
			Activity: user.Health.Activate.ActivateType,
			Goal:     user.Goals.GoalsType,
		}
		if target, err := h.getGeminiNutritionTarget(req); err == nil {
			// Eski targetni o'chirish (shu kunga)
			h.Store.DB.Where("user_id = ? AND date = ?", user.ID, time.Now().Format("2006-01-02")).Delete(&models.UserDailyTarget{})
			h.Store.DB.Create(&models.UserDailyTarget{
				UserID:   user.ID,
				Date:     time.Now().Format("2006-01-02"),
				Calories: target.Calories,
				Protein:  target.Protein,
				Carbs:    target.Carbs,
				Fat:      target.Fat,
				Water:    target.Water,
			})
		} else {
			// Xatolikni log qilish
			log.Printf("Failed to update Gemini nutrition target for user %d: %v", user.ID, err)
		}
	}
}

// @Summary Foydalanuvchining bugungi ovqat yozuvlari ro'yxati
// @Description Foydalanuvchining bugungi barcha ovqat yozuvlarini (vaqti va matni bilan) qaytaradi
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Foydalanuvchi IDsi"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer ..."
// @Success 200 {array} models.UserDailyFoodStat
// @Failure 404 {object} map[string]string "Bugungi ovqat yozuvlari topilmadi"
// @Router /users/{id}/food [get]
func (h *Handlers) GetUserDailyFoodList(c *gin.Context) {
    userID := c.Param("id")
    today := time.Now().Format("2006-01-02")
    var foods []models.UserDailyFoodStat
    err := h.Store.DB.Where("user_id = ? AND date = ?", userID, today).Order("created_at asc").Find(&foods).Error
    if err != nil || len(foods) == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Bugungi ovqat yozuvlari topilmadi"})
        return
    }
    c.JSON(http.StatusOK, foods)
}

// @Summary Foydalanuvchining umumiy sog'liq balli
// @Description Foydalanuvchining har bir normani to'ldirgan kunlari uchun 5 balldan umumiy ball hisoblaydi
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Foydalanuvchi IDsi"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer ..."
// @Success 200 {object} map[string]int "Umumiy sog'liq balli"
// @Failure 404 {object} map[string]string "Ma'lumot topilmadi"
// @Router /users/{id}/health-score [get]
func (h *Handlers) GetUserHealthScore(c *gin.Context) {
    userID := c.Param("id")
    db := h.Store.DB
    
    // Foydalanuvchining sog'liq ballini users table'dan to'g'ridan-to'g'ri o'qish
    var user models.User
    if err := db.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"score": user.HealthScore})
}

// Challenge yaratish (admin yoki superuser uchun)
func (h *Handlers) CreateChallengeHandler(c *gin.Context) {
	var req CreateChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	challenge := models.Challenge{
		Name:         req.Name,
		Type:         req.Type,
		Description:  req.Description,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		RewardPoints: req.RewardPoints,
	}
	if err := h.Store.DB.Create(&challenge).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create challenge"})
		return
	}
	c.JSON(http.StatusOK, challenge)
}

// Barcha challenge’larni olish
func (h *Handlers) ListChallengesHandler(c *gin.Context) {
	var challenges []models.Challenge
	if err := h.Store.DB.Order("start_date desc").Find(&challenges).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch challenges"})
		return
	}
	c.JSON(http.StatusOK, challenges)
}

// Foydalanuvchi challenge’ga qo‘shiladi
type joinChallengeBody struct {
	ChallengeID uint `json:"challenge_id" binding:"required"`
}
func (h *Handlers) JoinChallengeHandler(c *gin.Context) {
	userID, exists := c.Get("user_id") // Changed from "userID" to "user_id"
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req joinChallengeBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userChallenge := models.UserChallenge{
		UserID:      userID.(uint),
		ChallengeID: req.ChallengeID,
		Status:      "active",
		Progress:    0,
	}
	if err := h.Store.DB.Create(&userChallenge).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to join challenge"})
		return
	}
	c.JSON(http.StatusOK, userChallenge)
}

// Foydalanuvchi challenge progressini yangilash (masalan, qadamlar yoki kunlar)
func (h *Handlers) UpdateUserChallengeHandler(c *gin.Context) {
	userID, exists := c.Get("user_id") // Changed from "userID" to "user_id"
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	challengeID := c.Param("challenge_id")
	var req UpdateUserChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var userChallenge models.UserChallenge
	if err := h.Store.DB.Where("user_id = ? AND challenge_id = ?", userID, challengeID).First(&userChallenge).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "UserChallenge not found"})
		return
	}
	userChallenge.Progress = req.Progress
	userChallenge.Status = req.Status
	userChallenge.Result = req.Result
	userChallenge.AwardedPoints = req.AwardedPoints
	if err := h.Store.DB.Save(&userChallenge).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user challenge"})
		return
	}
	c.JSON(http.StatusOK, userChallenge)
}

// Progress avtomatik hisoblash va yangilash
func (h *Handlers) UpdateChallengeProgressHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	challengeID := c.Param("challenge_id")
	
	// Foydalanuvchining challenge’ini topish
	var userChallenge models.UserChallenge
	if err := h.Store.DB.Where("user_id = ? AND challenge_id = ?", userID, challengeID).First(&userChallenge).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "UserChallenge not found"})
		return
	}
	
	// Challenge ma'lumotlarini olish
	var challenge models.Challenge
	if err := h.Store.DB.First(&challenge, challengeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Challenge not found"})
		return
	}
	
	// Bugungi sana
	today := time.Now().Format("2006-01-02")
	
	// Challenge turiga qarab progress hisoblash
	var newProgress float64 = userChallenge.Progress
	
	switch challenge.Type {
	case "weekly_target", "monthly_target":
		// Kunlik target bajarilganini tekshirish
		var targetStatus models.UserDailyTarget
		if err := h.Store.DB.Where("user_id = ? AND date = ?", userID, today).First(&targetStatus).Error; err == nil {
			// Target bajarilgan bo'lsa progress +1
			if targetStatus.Calories > 0 && targetStatus.Protein > 0 {
				newProgress = userChallenge.Progress + 1
			}
		}
		
	case "steps_5000", "steps_10000":
		// Qadamlar sonini tekshirish (bu yerda qadamlar soni API dan keladi)
		// Hozircha oddiy progress +1 qilamiz
		newProgress = userChallenge.Progress + 1
	}
	
	// Progress yangilash
	userChallenge.Progress = newProgress
	
	// Challenge tugagan bo'lsa statusni yangilash
	if newProgress >= 7 && (challenge.Type == "weekly_target" || challenge.Type == "steps_5000" || challenge.Type == "steps_10000") {
		userChallenge.Status = "completed"
		userChallenge.AwardedPoints = challenge.RewardPoints
	} else if newProgress >= 30 && challenge.Type == "monthly_target" {
		userChallenge.Status = "completed"
		userChallenge.AwardedPoints = challenge.RewardPoints
	}
	
	// Bazaga saqlash
	if err := h.Store.DB.Save(&userChallenge).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update progress"})
		return
	}
	
	c.JSON(http.StatusOK, userChallenge)
}

// Challenge qatnashchilari va natijalari ro‘yxati (foydalanuvchi ismi va progress bilan)
type ChallengeParticipantResponse struct {
	ID            uint   `json:"id"`
	UserID        uint   `json:"user_id"`
	UserName      string `json:"user_name"`
	Progress      float64 `json:"progress"`
	Status        string `json:"status"`
	AwardedPoints int    `json:"awarded_points"`
	Result        string `json:"result"`
}

func (h *Handlers) ChallengeParticipantsHandler(c *gin.Context) {
	challengeID := c.Param("challenge_id")
	var participants []models.UserChallenge
	if err := h.Store.DB.Where("challenge_id = ?", challengeID).Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}
	// Har bir qatnashchi uchun user ismini va progressni olish
	var resp []ChallengeParticipantResponse
	for _, p := range participants {
		var user models.User
		h.Store.DB.First(&user, p.UserID)
		progressText := fmt.Sprintf("%v", p.Progress)
		// Agar challenge haftalik bo‘lsa, progressni "X/7 kun" ko‘rinishida chiqarish
		var challenge models.Challenge
		h.Store.DB.First(&challenge, p.ChallengeID)
		if challenge.Type == "weekly_target" || challenge.Type == "steps_5000" || challenge.Type == "steps_10000" {
			progressText = fmt.Sprintf("%.0f/7 kun", p.Progress)
		} else if challenge.Type == "monthly_target" {
			progressText = fmt.Sprintf("%.0f/30 kun", p.Progress)
		}
		resp = append(resp, ChallengeParticipantResponse{
			ID:            p.ID,
			UserID:        p.UserID,
			UserName:      user.Name,
			Progress:      p.Progress,
			Status:        p.Status,
			AwardedPoints: p.AwardedPoints,
			Result:        progressText,
		})
	}
	c.JSON(http.StatusOK, resp)
}

// Partner kompaniyalarni olish
func (h *Handlers) GetPartnerCompanies(c *gin.Context) {
	var partners []models.PartnerCompany
	if err := h.Store.DB.Where("is_active = ?", true).Find(&partners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner companies"})
		return
	}
	c.JSON(http.StatusOK, partners)
}

// Foydalanuvchining partner kompaniyadan foydalanishi
type UsePartnerDiscountRequest struct {
	PartnerID    uint    `json:"partner_id" binding:"required"`
	OrderAmount  float64 `json:"order_amount" binding:"required"`
	OrderDetails string  `json:"order_details"`
}

func (h *Handlers) UsePartnerDiscount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UsePartnerDiscountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Partner kompaniyani topish
	var partner models.PartnerCompany
	if err := h.Store.DB.First(&partner, req.PartnerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Partner company not found"})
		return
	}

	// Foydalanuvchining balllarini tekshirish
	var user models.User
	if err := h.Store.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.HealthScore < partner.PointsCost {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient points"})
		return
	}

	// Chegirma miqdorini hisoblash (ball asosida)
	discountAmount := partner.DiscountMin
	if user.HealthScore >= partner.PointsCost*2 {
		discountAmount = partner.DiscountMax
	} else if user.HealthScore >= int(float64(partner.PointsCost)*1.5) {
		discountAmount = (partner.DiscountMin + partner.DiscountMax) / 2
	}

	// Foydalanuvchining balllarini kamaytirish
	user.HealthScore -= partner.PointsCost
	if err := h.Store.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user points"})
		return
	}

	// Partner foydalanish tarixini saqlash
	now := time.Now()
	history := models.UserPartnerHistory{
		UserID:         userID.(uint),
		PartnerID:      req.PartnerID,
		PointsSpent:    partner.PointsCost,
		DiscountAmount: discountAmount,
		OrderAmount:    req.OrderAmount,
		OrderDetails:   req.OrderDetails,
		Status:         "completed",
		UsedAt:         &now,
	}

	if err := h.Store.DB.Create(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save usage history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Discount applied successfully",
		"discount_amount": discountAmount,
		"points_spent":   partner.PointsCost,
		"remaining_points": user.HealthScore,
		"partner":        partner,
	})
}

// Foydalanuvchining partner foydalanish tarixini olish
func (h *Handlers) GetUserPartnerHistory(c *gin.Context) {
	userID := c.Param("id")
	
	var history []models.UserPartnerHistory
	if err := h.Store.DB.Preload("Partner").Where("user_id = ?", userID).Order("created_at desc").Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch partner history"})
		return
	}
	
	c.JSON(http.StatusOK, history)
}

// stringdan pointer yasash uchun yordamchi funksiya
func strPtr(s string) *string { return &s }
