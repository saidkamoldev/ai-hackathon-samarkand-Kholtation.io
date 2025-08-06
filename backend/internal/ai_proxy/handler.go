package ai_proxy

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	aiServerURL string
}

func NewHandler() *Handler {
	return &Handler{
		aiServerURL: "http://localhost:8000",
	}
}

// AnalyzeFoodWithAI @Summary AI yordamida ovqat tahlili
// @Description AI server orqali ovqat matnini tahlil qilish
// @Tags ai
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "Ovqat tahlili so'rovi"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /ai/analyze [post]
func (h *Handler) AnalyzeFoodWithAI(c *gin.Context) {
	var requestBody map[string]interface{}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// AI server ga so'rov yuborish
	response, err := h.callAIServer("/api/analyze-food", requestBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI server bilan bog'lanishda xatolik"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetNutritionInfo @Summary Oziq-ovqat ma'lumotlari
// @Description AI server orqali oziq-ovqat ma'lumotlarini olish
// @Tags ai
// @Accept json
// @Produce json
// @Param food_name path string true "Ovqat nomi"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /ai/nutrition/{food_name} [get]
func (h *Handler) GetNutritionInfo(c *gin.Context) {
	foodName := c.Param("food_name")
	
	// AI server ga so'rov yuborish
	response, err := h.callAIServer("/api/nutrition/"+foodName, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI server bilan bog'lanishda xatolik"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetAIServerHealth @Summary AI server holati
// @Description AI server holatini tekshirish
// @Tags ai
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /ai/health [get]
func (h *Handler) GetAIServerHealth(c *gin.Context) {
	// AI server holatini tekshirish
	response, err := h.callAIServer("/health", nil)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "unhealthy",
			"error":  "AI server bilan bog'lanishda xatolik",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"ai_server": response,
	})
}

// callAIServer AI server ga so'rov yuborish
func (h *Handler) callAIServer(endpoint string, requestBody interface{}) (map[string]interface{}, error) {
	url := h.aiServerURL + endpoint
	
	var req *http.Request
	var err error
	
	if requestBody != nil {
		jsonData, err := json.Marshal(requestBody)
		if err != nil {
			return nil, err
		}
		
		req, err = http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, err
		}
	}
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return result, nil
} 