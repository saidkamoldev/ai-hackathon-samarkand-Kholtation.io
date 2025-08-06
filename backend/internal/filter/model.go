package filter

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FoodLog ovqat kundaligi modeli
type FoodLog struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	PlanID       uuid.UUID `json:"plan_id" gorm:"type:uuid;not null"`
	FoodName     string    `json:"food_name" gorm:"not null"`
	Quantity     float64   `json:"quantity" gorm:"not null"`
	Unit         string    `json:"unit" gorm:"not null"` // gram, piece, cup, etc.
	Calories     float64   `json:"calories" gorm:"not null"`
	Protein      float64   `json:"protein" gorm:"not null"`
	Fat          float64   `json:"fat" gorm:"not null"`
	Carbohydrate float64   `json:"carbohydrate" gorm:"not null"`
	Water        float64   `json:"water" gorm:"default:0"`
	MealType     string    `json:"meal_type" gorm:"not null"` // breakfast, lunch, dinner, snack
	LoggedAt     time.Time `json:"logged_at" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BeforeCreate GORM hook
func (f *FoodLog) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

// AnalyzeFoodRequest ovqat tahlili uchun request
type AnalyzeFoodRequest struct {
	UserID   uuid.UUID `json:"user_id" binding:"required"`
	PlanID   uuid.UUID `json:"plan_id" binding:"required"`
	FoodText string    `json:"food_text" binding:"required"` // "2 ta tuxum va bitta kofe ichdim"
	MealType string    `json:"meal_type" binding:"required,oneof=breakfast lunch dinner snack"`
	LoggedAt time.Time `json:"logged_at"`
}

// LogFoodRequest ovqat kiritish uchun request
type LogFoodRequest struct {
	UserID       uuid.UUID `json:"user_id" binding:"required"`
	PlanID       uuid.UUID `json:"plan_id" binding:"required"`
	FoodName     string    `json:"food_name" binding:"required"`
	Quantity     float64   `json:"quantity" binding:"required,min=0.1"`
	Unit         string    `json:"unit" binding:"required"`
	Calories     float64   `json:"calories" binding:"required,min=0"`
	Protein      float64   `json:"protein" binding:"required,min=0"`
	Fat          float64   `json:"fat" binding:"required,min=0"`
	Carbohydrate float64   `json:"carbohydrate" binding:"required,min=0"`
	Water        float64   `json:"water" binding:"min=0"`
	MealType     string    `json:"meal_type" binding:"required,oneof=breakfast lunch dinner snack"`
	LoggedAt     time.Time `json:"logged_at"`
}

// FoodLogResponse API response uchun
type FoodLogResponse struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	PlanID       uuid.UUID `json:"plan_id"`
	FoodName     string    `json:"food_name"`
	Quantity     float64   `json:"quantity"`
	Unit         string    `json:"unit"`
	Calories     float64   `json:"calories"`
	Protein      float64   `json:"protein"`
	Fat          float64   `json:"fat"`
	Carbohydrate float64   `json:"carbohydrate"`
	Water        float64   `json:"water"`
	MealType     string    `json:"meal_type"`
	LoggedAt     time.Time `json:"logged_at"`
	CreatedAt    time.Time `json:"created_at"`
}

// DailySummary kunlik hisobot
type DailySummary struct {
	Date            time.Time `json:"date"`
	TotalCalories   float64   `json:"total_calories"`
	TotalProtein    float64   `json:"total_protein"`
	TotalFat        float64   `json:"total_fat"`
	TotalCarbohydrate float64 `json:"total_carbohydrate"`
	TotalWater      float64   `json:"total_water"`
	MealBreakdown   map[string]float64 `json:"meal_breakdown"` // meal_type -> calories
	FoodCount       int       `json:"food_count"`
}

// NutritionInfo oziq-ovqat ma'lumotlari
type NutritionInfo struct {
	FoodName     string  `json:"food_name"`
	Quantity     float64 `json:"quantity"`
	Unit         string  `json:"unit"`
	Calories     float64 `json:"calories"`
	Protein      float64 `json:"protein"`
	Fat          float64 `json:"fat"`
	Carbohydrate float64 `json:"carbohydrate"`
	Water        float64 `json:"water"`
	Confidence   float64 `json:"confidence"` // AI aniqlash ishonchliligi (0-1)
} 