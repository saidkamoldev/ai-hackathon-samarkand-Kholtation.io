package plan

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Plan ovqatlanish rejasi modeli
type Plan struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Date         time.Time `json:"date" gorm:"not null"`
	CalorieGoal  float64   `json:"calorie_goal" gorm:"not null"` // kunlik kaloriya maqsadi
	ProteinGoal  float64   `json:"protein_goal" gorm:"not null"` // kunlik oqsil maqsadi (g)
	FatGoal      float64   `json:"fat_goal" gorm:"not null"`     // kunlik yog' maqsadi (g)
	CarbGoal     float64   `json:"carb_goal" gorm:"not null"`    // kunlik uglevod maqsadi (g)
	WaterGoal    float64   `json:"water_goal" gorm:"not null"`   // kunlik suv maqsadi (litr)
	CalorieConsumed float64 `json:"calorie_consumed" gorm:"default:0"` // iste'mol qilingan kaloriya
	ProteinConsumed float64 `json:"protein_consumed" gorm:"default:0"` // iste'mol qilingan oqsil
	FatConsumed     float64 `json:"fat_consumed" gorm:"default:0"`     // iste'mol qilingan yog'
	CarbConsumed    float64 `json:"carb_consumed" gorm:"default:0"`    // iste'mol qilingan uglevod
	WaterConsumed   float64 `json:"water_consumed" gorm:"default:0"`   // iste'mol qilingan suv
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BeforeCreate GORM hook
func (p *Plan) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// CreatePlanRequest yangi reja yaratish uchun
type CreatePlanRequest struct {
	UserID       uuid.UUID `json:"user_id" binding:"required"`
	Date         time.Time `json:"date" binding:"required"`
	CalorieGoal  float64   `json:"calorie_goal" binding:"required,min=1000,max=5000"`
	ProteinGoal  float64   `json:"protein_goal" binding:"required,min=20,max=300"`
	FatGoal      float64   `json:"fat_goal" binding:"required,min=20,max=200"`
	CarbGoal     float64   `json:"carb_goal" binding:"required,min=50,max=500"`
	WaterGoal    float64   `json:"water_goal" binding:"required,min=1,max=10"`
}

// UpdatePlanRequest rejani yangilash uchun
type UpdatePlanRequest struct {
	CalorieConsumed *float64 `json:"calorie_consumed"`
	ProteinConsumed *float64 `json:"protein_consumed"`
	FatConsumed     *float64 `json:"fat_consumed"`
	CarbConsumed    *float64 `json:"carb_consumed"`
	WaterConsumed   *float64 `json:"water_consumed"`
}

// PlanResponse API response uchun
type PlanResponse struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Date         time.Time `json:"date"`
	CalorieGoal  float64   `json:"calorie_goal"`
	ProteinGoal  float64   `json:"protein_goal"`
	FatGoal      float64   `json:"fat_goal"`
	CarbGoal     float64   `json:"carb_goal"`
	WaterGoal    float64   `json:"water_goal"`
	CalorieConsumed float64 `json:"calorie_consumed"`
	ProteinConsumed float64 `json:"protein_consumed"`
	FatConsumed     float64 `json:"fat_consumed"`
	CarbConsumed    float64 `json:"carb_consumed"`
	WaterConsumed   float64 `json:"water_consumed"`
	CalorieProgress float64 `json:"calorie_progress"` // foizda
	ProteinProgress float64 `json:"protein_progress"`
	FatProgress     float64 `json:"fat_progress"`
	CarbProgress    float64 `json:"carb_progress"`
	WaterProgress   float64 `json:"water_progress"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CalculateProgress progress hisoblash
func (p *Plan) CalculateProgress() PlanResponse {
	response := PlanResponse{
		ID:              p.ID,
		UserID:          p.UserID,
		Date:            p.Date,
		CalorieGoal:     p.CalorieGoal,
		ProteinGoal:     p.ProteinGoal,
		FatGoal:         p.FatGoal,
		CarbGoal:        p.CarbGoal,
		WaterGoal:       p.WaterGoal,
		CalorieConsumed: p.CalorieConsumed,
		ProteinConsumed: p.ProteinConsumed,
		FatConsumed:     p.FatConsumed,
		CarbConsumed:    p.CarbConsumed,
		WaterConsumed:   p.WaterConsumed,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}

	// Progress hisoblash
	if p.CalorieGoal > 0 {
		response.CalorieProgress = (p.CalorieConsumed / p.CalorieGoal) * 100
	}
	if p.ProteinGoal > 0 {
		response.ProteinProgress = (p.ProteinConsumed / p.ProteinGoal) * 100
	}
	if p.FatGoal > 0 {
		response.FatProgress = (p.FatConsumed / p.FatGoal) * 100
	}
	if p.CarbGoal > 0 {
		response.CarbProgress = (p.CarbConsumed / p.CarbGoal) * 100
	}
	if p.WaterGoal > 0 {
		response.WaterProgress = (p.WaterConsumed / p.WaterGoal) * 100
	}

	return response
} 