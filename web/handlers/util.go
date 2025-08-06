package handlers

import "regexp"

// Gemini javobidan faqat birinchi JSON blokni ajratib oluvchi yordamchi funksiya
func ExtractJSONBlock(s string) string {
	re := regexp.MustCompile(`(?s)\{.*?\}`)
	match := re.FindString(s)
	return match
} 