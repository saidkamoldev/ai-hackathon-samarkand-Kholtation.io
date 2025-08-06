package plan

import "time"

type Plan struct {
    ID         uint      `gorm:"primaryKey"`
    UserID     uint
    Date       time.Time
    Calories   float64
    Protein    float64
    Fat        float64
    Carbs      float64
    Water      float64
    Goal       string
} 