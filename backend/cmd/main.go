package main

import (
	"log"
	"os"

	"yogin-backend/internal/server"
	"yogin-backend/internal/database"
	"yogin-backend/internal/user"
	"yogin-backend/internal/plan"
	"yogin-backend/internal/gamification"
	"yogin-backend/internal/filter"
	"yogin-backend/internal/ai_proxy"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title Yogin.uz API
// @version 1.0
// @description Shaxsiy ovqatlanish va sog'lom hayot tarzi platformasi
// @host localhost:8080
// @BasePath /api
func main() {
	// Environment variables yuklash
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Database ulanish
	db, err := database.Connect()
	if err != nil {
		log.Fatal("Database ulanishda xatolik:", err)
	}

	// Auto migration
	if err := database.Migrate(db); err != nil {
		log.Fatal("Migration xatoligi:", err)
	}

	// Gin router
	r := gin.Default()

	// CORS sozlamalari
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API guruhlari
	api := r.Group("/api")
	{
		// User endpoints
		userHandler := user.NewHandler(db)
		api.POST("/users", userHandler.Create)
		api.GET("/users/:id", userHandler.GetByID)
		api.PUT("/users/:id", userHandler.Update)
		api.POST("/users/login", userHandler.Login)

		// Plan endpoints
		planHandler := plan.NewHandler(db)
		api.POST("/plans", planHandler.Create)
		api.GET("/plans/:user_id", planHandler.GetByUserID)
		api.PUT("/plans/:id", planHandler.Update)

		// Food analysis endpoints
		foodHandler := filter.NewHandler(db)
		api.POST("/food/analyze", foodHandler.AnalyzeFood)
		api.POST("/food/log", foodHandler.LogFood)

		// Gamification endpoints
		gamificationHandler := gamification.NewHandler(db)
		api.GET("/gamification/:user_id", gamificationHandler.GetUserStats)
		api.POST("/gamification/achievements", gamificationHandler.AddAchievement)

		// AI Proxy endpoints
		aiHandler := ai_proxy.NewHandler()
		api.POST("/ai/analyze", aiHandler.AnalyzeFoodWithAI)
	}

	// Swagger
	server.SetupSwagger(r)

	// Server ishga tushirish
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server %s portda ishga tushdi", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server ishga tushirishda xatolik:", err)
	}
}
