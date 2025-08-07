package gamification

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Gamification gamifikatsiya modeli
type Gamification struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Level        int       `json:"level" gorm:"default:1"`
	Experience   int       `json:"experience" gorm:"default:0"`
	Streak       int       `json:"streak" gorm:"default:0"` // ketma-ket kunlar
	TotalDays    int       `json:"total_days" gorm:"default:0"`
	CaloriesGoal int       `json:"calories_goal" gorm:"default:0"` // kunlik kaloriya maqsadiga erishish
	WaterGoal    int       `json:"water_goal" gorm:"default:0"`    // kunlik suv maqsadiga erishish
	ProteinGoal  int       `json:"protein_goal" gorm:"default:0"`  // kunlik oqsil maqsadiga erishish
	LastLogin    time.Time `json:"last_login"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BeforeCreate GORM hook
func (g *Gamification) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}

// Achievement yutuqlar modeli
type Achievement struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Type        string    `json:"type" gorm:"not null"` // streak, calories, water, protein, level
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description" gorm:"not null"`
	Icon        string    `json:"icon" gorm:"not null"`
	Value       int       `json:"value" gorm:"not null"` // qanday qiymatga erishilgan
	EarnedAt    time.Time `json:"earned_at"`
	CreatedAt   time.Time `json:"created_at"`
}

// BeforeCreate GORM hook
func (a *Achievement) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// UserStats foydalanuvchi statistikasi
type UserStats struct {
	UserID             uuid.UUID     `json:"user_id"`
	Level              int           `json:"level"`
	Experience         int           `json:"experience"`
	ExperienceToNext   int           `json:"experience_to_next"` // keyingi darajaga qancha kerak
	Streak             int           `json:"streak"`
	TotalDays          int           `json:"total_days"`
	CaloriesGoal       int           `json:"calories_goal"`
	WaterGoal          int           `json:"water_goal"`
	ProteinGoal        int           `json:"protein_goal"`
	TotalAchievements  int           `json:"total_achievements"`
	RecentAchievements []Achievement `json:"recent_achievements"`
	LastLogin          time.Time     `json:"last_login"`
}

// AddExperience tajriba qo'shish
func (g *Gamification) AddExperience(exp int) {
	g.Experience += exp

	// Daraja hisoblash (har 1000 XP = 1 daraja)
	newLevel := (g.Experience / 1000) + 1
	if newLevel > g.Level {
		g.Level = newLevel
	}
}

// GetExperienceToNext keyingi darajaga qancha XP kerak
func (g *Gamification) GetExperienceToNext() int {
	nextLevelExp := g.Level * 1000
	return nextLevelExp - g.Experience
}

// UpdateStreak streak yangilash
func (g *Gamification) UpdateStreak() {
	now := time.Now()

	// Agar oxirgi login bugun bo'lmasa
	if g.LastLogin.Day() != now.Day() {
		// Agar kecha bo'lsa, streak davom etadi
		if g.LastLogin.Day() == now.AddDate(0, 0, -1).Day() {
			g.Streak++
		} else {
			// Streak uzildi
			g.Streak = 1
		}
	}

	g.LastLogin = now
	g.TotalDays++
}

// CheckAchievements yutuqlarni tekshirish
func (g *Gamification) CheckAchievements() []Achievement {
	var achievements []Achievement

	// Streak yutuqlari
	if g.Streak == 7 && !g.hasAchievement("streak_7") {
		achievements = append(achievements, Achievement{
			UserID:      g.UserID,
			Type:        "streak",
			Name:        "Haftalik Streak",
			Description: "7 kun ketma-ket ovqatlanish rejangizni bajaring",
			Icon:        "🔥",
			Value:       7,
			EarnedAt:    time.Now(),
		})
	}

	// Daraja yutuqlari
	if g.Level == 5 && !g.hasAchievement("level_5") {
		achievements = append(achievements, Achievement{
			UserID:      g.UserID,
			Type:        "level",
			Name:        "5-darajali",
			Description: "5-darajaga erishing",
			Icon:        "⭐",
			Value:       5,
			EarnedAt:    time.Now(),
		})
	}

	return achievements
}

// hasAchievement yutuq mavjudligini tekshirish (bu yerda soddalashtirilgan)
func (g *Gamification) hasAchievement(achievementType string) bool {
	// Haqiqiy implementatsiyada database dan tekshiriladi
	return false
}
