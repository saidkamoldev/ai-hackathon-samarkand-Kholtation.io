package user

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User foydalanuvchi modeli
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name         string    `json:"name" gorm:"not null"`
	Email        string    `json:"email" gorm:"unique;not null"`
	Password     string    `json:"-" gorm:"not null"`
	Age          int       `json:"age" gorm:"not null"`
	Height       float64   `json:"height" gorm:"not null"` // sm
	Weight       float64   `json:"weight" gorm:"not null"` // kg
	Gender       string    `json:"gender" gorm:"not null"` // male, female
	ActivityLevel string   `json:"activity_level" gorm:"not null"` // sedentary, lightly_active, moderately_active, very_active, extremely_active
	Goal         string    `json:"goal" gorm:"not null"` // weight_loss, weight_gain, weight_maintenance, muscle_gain
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// BeforeCreate GORM hook
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// UserResponse API response uchun
type UserResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Age          int       `json:"age"`
	Height       float64   `json:"height"`
	Weight       float64   `json:"weight"`
	Gender       string    `json:"gender"`
	ActivityLevel string   `json:"activity_level"`
	Goal         string    `json:"goal"`
	CreatedAt    time.Time `json:"created_at"`
}

// LoginRequest login uchun request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// CreateUserRequest yangi foydalanuvchi yaratish uchun
type CreateUserRequest struct {
	Name         string  `json:"name" binding:"required"`
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"required,min=6"`
	Age          int     `json:"age" binding:"required,min=13,max=120"`
	Height       float64 `json:"height" binding:"required,min=100,max=250"`
	Weight       float64 `json:"weight" binding:"required,min=30,max=300"`
	Gender       string  `json:"gender" binding:"required,oneof=male female"`
	ActivityLevel string `json:"activity_level" binding:"required,oneof=sedentary lightly_active moderately_active very_active extremely_active"`
	Goal         string  `json:"goal" binding:"required,oneof=weight_loss weight_gain weight_maintenance muscle_gain"`
}

// UpdateUserRequest foydalanuvchi ma'lumotlarini yangilash uchun
type UpdateUserRequest struct {
	Name         *string  `json:"name"`
	Age          *int     `json:"age"`
	Height       *float64 `json:"height"`
	Weight       *float64 `json:"weight"`
	Gender       *string  `json:"gender"`
	ActivityLevel *string `json:"activity_level"`
	Goal         *string  `json:"goal"`
} 