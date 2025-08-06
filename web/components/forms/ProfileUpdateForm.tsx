"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export function ProfileUpdateForm() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age ? String(user.age) : "",
    weight: user?.health?.weight ? String(user.health.weight) : "",
    height: user?.health?.height ? String(user.health.height) : "",
    sex: user?.health?.sex || "",
    allergy: user?.health?.allergy?.allergy || false,
    allergyType: user?.health?.allergy?.allergy_type || [],
    activateType: user?.health?.activate?.activate_type || "",
    goalsType: user?.goals?.goals_type || "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.ID) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      // Prepare request data
      const requestData: any = {}
      
      if (formData.name !== user.name) requestData.name = formData.name
      if (formData.age !== String(user.age)) requestData.age = Number(formData.age)
      if (formData.password) requestData.password = formData.password
      
      // Health data
      const healthData: any = {}
      if (formData.weight !== String(user.health?.weight)) healthData.weight = Number(formData.weight)
      if (formData.height !== String(user.health?.height)) healthData.height = Number(formData.height)
      if (formData.sex !== user.health?.sex) healthData.sex = formData.sex
      
      // Allergy data
      if (formData.allergy !== user.health?.allergy?.allergy || 
          JSON.stringify(formData.allergyType) !== JSON.stringify(user.health?.allergy?.allergy_type)) {
        healthData.allergy = {
          allergy: formData.allergy,
          allergy_type: formData.allergyType
        }
      }
      
      // Activity data
      if (formData.activateType !== user.health?.activate?.activate_type) {
        healthData.activate = {
          activate_type: formData.activateType
        }
      }
      
      if (Object.keys(healthData).length > 0) {
        requestData.health = healthData
      }
      
      // Goals data
      if (formData.goalsType !== user.goals?.goals_type) {
        requestData.goals = {
          goals_type: formData.goalsType
        }
      }

      const response = await fetch(`http://localhost:8080/users/${user.ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: t("success"),
          description: t("profileUpdatedSuccessfully") || "Profile updated successfully! Your daily targets have been recalculated.",
        })
        
        // User ma'lumotlarini AuthContext va localStorage orqali yangilash
        setUser(data.user)
        localStorage.setItem("user_data", JSON.stringify(data.user))
        setTimeout(() => {
          router.push("/dashboard")
        }, 200)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || t("failedToUpdateProfile") || "Failed to update profile")
      }
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedToUpdateProfile") || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("basicInformation") || "Basic Information"}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t("yourName") || "Your name"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">{t("age")}</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value.replace(/^0+(?!$)/, ""))}
              placeholder={t("yourAge") || "Your age"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("newPassword") || "New Password (optional)"}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder={t("leaveEmptyToKeepCurrent") || "Leave empty to keep current password"}
          />
        </div>
      </div>

      {/* Health Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("healthInformation") || "Health Information"}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">{t("weight")} (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value.replace(/^0+(?!$)/, ""))}
              placeholder={t("weightInKg") || "Weight in kg"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">{t("height")} (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value.replace(/^0+(?!$)/, ""))}
              placeholder={t("heightInCm") || "Height in cm"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sex">{t("sex")}</Label>
            <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectSex") || "Select sex"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">{t("male") || "Male"}</SelectItem>
                <SelectItem value="Female">{t("female") || "Female"}</SelectItem>
                <SelectItem value="Other">{t("other") || "Other"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity">{t("activityLevel") || "Activity Level"}</Label>
          <Select value={formData.activateType} onValueChange={(value) => handleInputChange("activateType", value)}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectActivityLevel") || "Select activity level"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_activity">{t("noActivity") || "No Activity"}</SelectItem>
              <SelectItem value="light_activity">{t("lightActivity") || "Light Activity"}</SelectItem>
              <SelectItem value="moderate_activity">{t("moderateActivity") || "Moderate Activity"}</SelectItem>
              <SelectItem value="high_activity">{t("highActivity") || "High Activity"}</SelectItem>
              <SelectItem value="athlete">{t("athlete") || "Athlete"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals">{t("healthGoals") || "Health Goals"}</Label>
          <Select value={formData.goalsType} onValueChange={(value) => handleInputChange("goalsType", value)}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectYourGoal") || "Select your goal"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight_loss">{t("weightLoss") || "Weight Loss"}</SelectItem>
              <SelectItem value="muscle_gain">{t("muscleGain") || "Muscle Gain"}</SelectItem>
              <SelectItem value="health_improvement">{t("healthImprovement") || "Health Improvement"}</SelectItem>
              <SelectItem value="maintenance">{t("maintenance") || "Maintenance"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allergy"
            checked={formData.allergy}
            onCheckedChange={(checked) => handleInputChange("allergy", checked)}
          />
          <Label htmlFor="allergy">{t("iHaveAllergies") || "I have allergies"}</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {t("updating") || "Updating..."}
            </>
          ) : (
            t("updateProfile") || "Update Profile"
          )}
        </Button>
      </div>
    </form>
  )
} 