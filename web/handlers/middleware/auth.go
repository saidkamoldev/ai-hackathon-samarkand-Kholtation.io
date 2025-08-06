package middleware

import (
    "fmt"
    "net/http"
    // "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware JWT tokenini tekshiruvchi middleware.
// Bu funksiya gin.HandlerFunc turidagi funksiyani qaytaradi.
func AuthMiddleware(jwtSecretKey []byte) gin.HandlerFunc { // <-- O'zgarish shu yerda
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" || len(tokenString) < 7 || tokenString[:7] != "Bearer " {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required or malformed"})
            c.Abort()
            return
        }

        tokenString = tokenString[7:] // "Bearer " qismini olib tashlash

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            // Algoritm to'g'riligini tekshirish
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return jwtSecretKey, nil // <-- jwtSecretKey ni ishlatish
        })

        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
            c.Abort()
            return
        }

        // Token muddati o'tganligini tekshirish
        exp, ok := claims["exp"].(float64)
        if !ok || int64(exp) < time.Now().Unix() {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
            c.Abort()
            return
        }

        // Foydalanuvchi ID'sini contextga qo'shish
        userID, ok := claims["user_id"].(float64) // JWT claims'da raqamlar odatda float64 bo'ladi
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
            c.Abort()
            return
        }
        c.Set("user_id", uint(userID)) // uint ga o'tkazish
        c.Next() // Keyingi handlerga o'tish
    }
}
