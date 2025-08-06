"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { X, Plus } from "lucide-react"

export function AllergiesForm() {
  const [allergies, setAllergies] = useState(["Nuts", "Dairy"])
  const [newAllergy, setNewAllergy] = useState("")
  const { toast } = useToast()
  const { t } = useLanguage()

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter((allergy) => allergy !== allergyToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("success"),
        description: "Allergies updated successfully!",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to update allergies",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Allergies</Label>
        <div className="flex flex-wrap gap-2">
          {allergies.map((allergy, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {allergy}
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-allergy">Add New Allergy</Label>
        <div className="flex gap-2">
          <Input
            id="new-allergy"
            placeholder="e.g., Shellfish"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
          />
          <Button type="button" onClick={addAllergy} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          {t("cancel")}
        </Button>
        <Button type="submit">{t("save")}</Button>
      </div>
    </form>
  )
}
