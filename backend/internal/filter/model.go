package filter

type Filter struct {
    ID          uint   `gorm:"primaryKey"`
    UserID      uint
    Type        string // allergen, diet, etc.
    Value       string
} 