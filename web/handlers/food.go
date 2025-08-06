package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"healthPilot/store/models"

	"github.com/gin-gonic/gin"
)

// UserFoodInputRequest - foydalanuvchi matnli inputi uchun request struct
// misol: {"description": "abedga 2 ta qovurilgan tuxum va bitta pomidor bitta bodirng yedim"}
type UserFoodInputRequest struct {
	Description string `json:"description" binding:"required"`
}

type GeminiFoodResponse struct {
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	Water    float64 `json:"water"`
}

// @Summary Foydalanuvchi ovqat inputi (matn) orqali kunlik statistikani AI yordamida hisoblash va qo'shish
// @Description Foydalanuvchi matnli ovqat tavsifini yuboradi. Gemini AI ovqatning kaloriya, oqsil, uglevod, yog', suv miqdorini hisoblab, kunlik statistikaga qo'shadi. Targetga yetgan bo'lsa, maxsus xabar qaytaradi.
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Foydalanuvchi IDsi"
// @Param input body UserFoodInputRequest true "Ovqat tavsifi (matn)"
// @Param Authorization header string true "Bearer JWT token. Misol: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// @Success 200 {object} map[string]interface{} "AI natijasi va yangilangan kunlik statistika"
// @Failure 400 {object} map[string]string "Xatolik yoki AI javob bermadi"
// @Router /users/{id}/food [post]
// @Example request
// {
//   "description": "abedga 2 ta qovurilgan tuxum va bitta pomidor yedim"
// }
// @Example response
// {
//   "stat": {
//     "id": 2,
//     "user_id": 7,
//     "date": "2025-07-15",
//     "calories": 21430,
//     "protein": 211,
//     "carbs": 314,
//     "fat": 2134,
//     "water": 4200,
//     "description": "...",
//     "created_at": "2025-07-15T18:38:36.49342+05:00",
//     "updated_at": "2025-07-15T18:42:58.896576+05:00"
//   },
//   "ai_result": {
//     "calories": 182,
//     "protein": 14,
//     "carbs": 6,
//     "fat": 11.2,
//     "water": 0
//   },
//   "completed": false,
//   "message": "Ovqat statistikasi muvaffaqiyatli qo‘shildi"
// }
func (h *Handlers) AddUserFoodStat(c *gin.Context) {
	userID := c.Param("id")
	var req UserFoodInputRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	// Gemini API ga so‘rov yuborish
	aiResp, err := h.getGeminiFoodStat(req.Description)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Iltimos, batafsilroq yozing yoki keyinroq harakat qiling."})
		return
	}

	// Statistika bazaga qo‘shiladi (yoki mavjud bo‘lsa update qilinadi)

	date := time.Now().Format("2006-01-02")
	var stat models.UserDailyFoodStat
	db := h.Store.DB
	err = db.Where("user_id = ? AND date = ?", userID, date).First(&stat).Error
	if err == nil {
		// Mavjud statistika bor, ustiga qo‘shamiz
		stat.Calories += aiResp.Calories
		stat.Protein += aiResp.Protein
		stat.Carbs += aiResp.Carbs
		stat.Fat += aiResp.Fat
		stat.Water += aiResp.Water
		stat.Description = strings.TrimSpace(stat.Description + "; " + req.Description)
		db.Save(&stat)
	} else {
		// Yangi statistika
		stat = models.UserDailyFoodStat{
			UserID:      parseUint(userID),
			Date:        date,
			Calories:    aiResp.Calories,
			Protein:     aiResp.Protein,
			Carbs:       aiResp.Carbs,
			Fat:         aiResp.Fat,
			Water:       aiResp.Water,
			Description: req.Description,
		}
		db.Create(&stat)
	}

	// UserDailyTarget bilan solishtirib, muvaffaqiyatli yakunlanganini tekshiramiz
	var target models.UserDailyTarget
	err = db.Where("user_id = ? AND date = ?", userID, date).First(&target).Error
	completed := false
	if err == nil {
		if stat.Calories >= target.Calories && stat.Protein >= target.Protein && stat.Carbs >= target.Carbs && stat.Fat >= target.Fat && stat.Water >= target.Water {
			completed = true
			// --- Challenge progressini avtomatik yangilash ---
			var userChallenges []models.UserChallenge
			db.Where("user_id = ? AND status = ?", userID, "active").Find(&userChallenges)
			for _, uc := range userChallenges {
				var challenge models.Challenge
				db.First(&challenge, uc.ChallengeID)
				if challenge.Type == "weekly_target" || challenge.Type == "monthly_target" || challenge.Type == "steps_5000" || challenge.Type == "steps_10000" {
					uc.Progress += 1
					if (uc.Progress >= 7 && (challenge.Type == "weekly_target" || challenge.Type == "steps_5000" || challenge.Type == "steps_10000")) || (uc.Progress >= 30 && challenge.Type == "monthly_target") {
						uc.Status = "completed"
						uc.AwardedPoints = challenge.RewardPoints
					}
					db.Save(&uc)
				}
			}
		}
	}

	// --- Sog'liq ballini yangilash ---
	var user models.User
	if err := db.First(&user, userID).Error; err == nil {
		// Foydalanuvchining mavjud sog'liq ballini olish
		currentScore := user.HealthScore
		
		// Yangi ovqat qo'shilganda ballni oshirish (masalan, +10 ball)
		newScore := currentScore + 10
		
		// Ballni 100 dan oshirmaslik
		if newScore > 100 {
			newScore = 100
		}
		
		// Foydalanuvchining sog'liq ballini yangilash
		user.HealthScore = newScore
		db.Save(&user)
	}

	msg := "Ovqat statistikasi muvaffaqiyatli qo'shildi"
	if completed {
		msg = "Kunlik regimni muvaffaqiyatli yakunladingiz"
	}

	c.JSON(http.StatusOK, gin.H{
		"stat":      stat,
		"ai_result": aiResp,
		"completed": completed,
		"message":   msg,
		"health_score": user.HealthScore,
	})
}

// Gemini AI orqali matndan ovqat statistikasi olish
func (h *Handlers) getGeminiFoodStat(description string) (GeminiFoodResponse, error) {
	geminiAPIKey := os.Getenv("GEMINI_API_KEY2")
	if geminiAPIKey == "" {
		log.Fatal("GEMINI_API_KEY environment variable not set. This is required for Gemini API.")
	}

	apiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiAPIKey
	prompt := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{
						"text": fmt.Sprintf(
							"Quyidagi matndan foydalanuvchi iste'mol qilgan ovqatlarning umumiy kaloriyasi, oqsil (g), uglevod (g), yog' (g) va suv (ml) miqdorini JSON ko'rinishida qaytar: {\\\"calories\\\":..., \\\"protein\\\":..., \\\"carbs\\\":..., \\\"fat\\\":..., \\\"water\\\":...}., agar ovqat haqida malumotlar yetarli bulamsa ham taxmianan javob beraver Matn: %s",
							description,
						),
					},
				},
			},
		},
	}
	body, _ := json.Marshal(prompt)
	resp, err := http.Post(apiURL, "application/json", strings.NewReader(string(body)))
	if err != nil {
		return GeminiFoodResponse{}, err
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	log.Printf("Gemini food API javobi: %s", string(respBody))
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(respBody, &geminiResp); err != nil {
		return GeminiFoodResponse{}, err
	}
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return GeminiFoodResponse{}, fmt.Errorf("Gemini javobida natija yo'q")
	}
	text := geminiResp.Candidates[0].Content.Parts[0].Text
	jsonBlock := ExtractJSONBlock(text)
	if jsonBlock == "" {
		return GeminiFoodResponse{}, fmt.Errorf("Gemini javobidan JSON blok topilmadi")
	}
	var result GeminiFoodResponse
	if err := json.Unmarshal([]byte(jsonBlock), &result); err != nil {
		return GeminiFoodResponse{}, err
	}
	return result, nil
}

// Stringdan uintga xavfsiz o‘tkazish
func parseUint(s string) uint {
	n, _ := fmt.Sscanf(s, "%d", new(uint))
	if n == 1 {
		var u uint
		fmt.Sscanf(s, "%d", &u)
		return u
	}
	return 0
}
