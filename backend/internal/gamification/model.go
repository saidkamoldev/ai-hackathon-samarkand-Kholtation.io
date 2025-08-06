package gamification

import "time"

type Badge struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint
    Name        string
    Description string
    DateEarned  time.Time
}

type Progress struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint
    Date        time.Time
    Streak      int
    Points      int
} 