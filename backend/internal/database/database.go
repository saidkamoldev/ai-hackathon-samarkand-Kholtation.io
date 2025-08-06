package database

import (
	"fmt"
	"log"
	"os"

	"yogin-backend/internal/user"
	"yogin-backend/internal/plan"
	"yogin-backend/internal/gamification"
	"yogin-backend/internal/filter"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect database ulanish
func Connect() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("database ulanishda xatolik: %v", err)
	}

	DB = db
	log.Println("Database muvaffaqiyatli ulandi")
	return db, nil
}

// Migrate database migration
func Migrate(db *gorm.DB) error {
	log.Println("Database migration boshlandi...")

	// User model
	if err := db.AutoMigrate(&user.User{}); err != nil {
		return fmt.Errorf("user migration xatoligi: %v", err)
	}

	// Plan model
	if err := db.AutoMigrate(&plan.Plan{}); err != nil {
		return fmt.Errorf("plan migration xatoligi: %v", err)
	}

	// FoodLog model
	if err := db.AutoMigrate(&filter.FoodLog{}); err != nil {
		return fmt.Errorf("foodlog migration xatoligi: %v", err)
	}

	// Gamification model
	if err := db.AutoMigrate(&gamification.Gamification{}); err != nil {
		return fmt.Errorf("gamification migration xatoligi: %v", err)
	}

	log.Println("Database migration muvaffaqiyatli yakunlandi")
	return nil
} 