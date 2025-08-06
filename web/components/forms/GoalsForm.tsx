"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"

export function GoalsForm() {
  const [goal, setGoal] = useState({
    title: "",
    description: "",
    category: "",
    targetDate: "",
    targetValue: "",
  })
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: t("success"),
        description: "Health goal created successfully!",
      })
      setGoal({
        title: "",
        description: "",
        category: "",
        targetDate: "",
        targetValue: "",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to create goal",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal Title</Label>
        <Input
          id="goal-title"
          placeholder="e.g., Lose 5kg"
          value={goal.title}
          onChange={(e) => setGoal({ ...goal, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-category">Category</Label>
        <Select value={goal.category} onValueChange={(value) => setGoal({ ...goal, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight">Weight Management</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="nutrition">Nutrition</SelectItem>
            <SelectItem value="wellness">General Wellness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-description">Description</Label>
        <Textarea
          id="goal-description"
          placeholder="Describe your goal in detail..."
          value={goal.description}
          onChange={(e) => setGoal({ ...goal, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target-value">Target Value</Label>
          <Input
            id="target-value"
            placeholder="e.g., 5kg, 10000 steps"
            value={goal.targetValue}
            onChange={(e) => setGoal({ ...goal, targetValue: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-date">Target Date</Label>
          <Input
            id="target-date"
            type="date"
            value={goal.targetDate}
            onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          {t("cancel")}
        </Button>
        <Button type="submit">Create Goal</Button>
      </div>
    </form>
  )
}
