package foodlog

import "time"

type FoodLog struct {
    ID         uint      `gorm:"primaryKey"`
    UserID     uint
    Date       time.Time
    FoodName   string
    Amount     float64    // porsiya yoki gramm
    Calories   float64
    Protein    float64
    Fat        float64
    Carbs      float64
} 