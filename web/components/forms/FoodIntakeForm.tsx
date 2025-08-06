"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"

export function FoodIntakeForm({ onFoodAdded }: { onFoodAdded?: () => void }) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !user?.ID) return // user.id emas, user.ID

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch(`http://localhost:8080/users/${user.ID}/food`, { // user.id emas, user.ID
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: t("success"),
          description: data.message || "Food intake logged successfully! AI analysis complete.",
        })
        setDescription("")
        if (onFoodAdded) onFoodAdded();
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to log food intake")
      }
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || "Failed to log food intake",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="food-description">Describe what you ate</Label>
        <Textarea
          id="food-description"
          placeholder="e.g., I had a chicken salad with mixed greens, tomatoes, and olive oil dressing for lunch"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setDescription("")}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading || !description.trim() || !user?.ID}> {/* user.id emas, user.ID */}
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Analyzing...
            </>
          ) : (
            "Log Food"
          )}
        </Button>
      </div>
    </form>
  )
}
