"use client"

import { ProfileUpdateForm } from "@/components/forms/ProfileUpdateForm"
import { Header } from "@/components/Header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ProfileUpdatePage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-slide-up shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t("completeProfile") || "Profilingizni to'liq to'ldiring"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileUpdateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 