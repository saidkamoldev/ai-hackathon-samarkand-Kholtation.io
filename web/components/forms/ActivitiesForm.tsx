"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"

export function ActivitiesForm() {
  const [activity, setActivity] = useState({
    type: "",
    duration: "",
    intensity: "",
    notes: "",
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
        description: "Activity logged successfully!",
      })
      setActivity({
        type: "",
        duration: "",
        intensity: "",
        notes: "",
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: "Failed to log activity",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activity-type">Activity Type</Label>
        <Select value={activity.type} onValueChange={(value) => setActivity({ ...activity, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="walking">Walking</SelectItem>
            <SelectItem value="cycling">Cycling</SelectItem>
            <SelectItem value="swimming">Swimming</SelectItem>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="weightlifting">Weight Lifting</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="30"
            value={activity.duration}
            onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intensity">Intensity</Label>
          <Select value={activity.intensity} onValueChange={(value) => setActivity({ ...activity, intensity: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select intensity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          placeholder="Any additional notes..."
          value={activity.notes}
          onChange={(e) => setActivity({ ...activity, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          {t("cancel")}
        </Button>
        <Button type="submit">Log Activity</Button>
      </div>
    </form>
  )
}
