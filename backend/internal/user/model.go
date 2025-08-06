package user

type Gender string

const (
    Male   Gender = "male"
    Female Gender = "female"
)

type ActivityLevel string

const (
    Sedentary     ActivityLevel = "sedentary"
    Light         ActivityLevel = "light"
    Moderate      ActivityLevel = "moderate"
    Active        ActivityLevel = "active"
    VeryActive    ActivityLevel = "very_active"
)

type Goal string

const (
    GainMuscle    Goal = "gain_muscle"
    LoseWeight    Goal = "lose_weight"
    MaintainWeight Goal = "maintain_weight"
)

type User struct {
    ID           uint           `gorm:"primaryKey"`
    Name         string
    Email        string         `gorm:"unique"`
    PasswordHash string
    Age          int
    Height       float64        // sm
    Weight       float64        // kg
    Gender       Gender
    Activity     ActivityLevel
    Goal         Goal
    WaterGoal    float64        // kunlik suv (litr)
    ProteinGoal  float64        // kunlik oqsil (g)
    FatGoal      float64        // kunlik yog' (g)
    CarbGoal     float64        // kunlik uglevod (g)
    CalorieGoal  float64        // kunlik kaloriya (kcal)
} 