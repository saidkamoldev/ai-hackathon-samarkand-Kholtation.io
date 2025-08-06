"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

declare global {
  interface Window {
    google: any
  }
}

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [age, setAge] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [sex, setSex] = useState("")
  const [activateType, setActivateType] = useState("")
  const [goalsType, setGoalsType] = useState("")
  const { signup, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Google OAuth script yuklash
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "385946821322-nspg1qermigb5i3et90r49lu8dnrdgmk.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        })
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          { theme: "outline", size: "large", width: "100%" }
        )
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true)
    try {
      await loginWithGoogle(response.credential)
      toast({
        title: t("success"),
        description: "Account created successfully with Google!",
      })
      // Kichik kechikish bilan push qilish (state sync uchun)
      setTimeout(() => {
        router.push("/dashboard")
      }, 200)
    } catch (error) {
      toast({
        title: t("error"),
        description: "Google signup failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: t("aiAnalyzingTitle") || "AI analiz qilmoqda",
      description: t("aiAnalyzingDesc") || "Ma'lumotlaringiz asosida AI hisob-kitob qilmoqda, kutib turing...",
      duration: false, // notification o'chmaydi
    });
    try {
      await signup(name, email, password, Number(age), Number(height), Number(weight), sex, activateType, goalsType);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: t("error"),
        description: t("signupFailed") || "Ro'yxatdan o'tishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-slide-up shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">{t("signup")}</CardTitle>
            <CardDescription>{t("signupDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="google-signup-button"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">{t("orContinueWith")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("fullNamePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Yangi inputlar */}
              <div className="space-y-2">
                <Label htmlFor="age">{t("age")}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder={t("agePlaceholder")}
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/^0+(?!$)/, ""))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t("height")}</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={t("heightPlaceholder")}
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/^0+(?!$)/, ""))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">{t("weight")}</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={t("weightPlaceholder")}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/^0+(?!$)/, ""))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">{t("sex")}</Label>
                <Input
                  id="sex"
                  type="text"
                  placeholder={t("sexPlaceholder")}
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activateType">{t("activityLevel")}</Label>
                <Select value={activateType} onValueChange={setActivateType} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t("activityLevelPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_activity">{t("noActivity")}</SelectItem>
                    <SelectItem value="light_activity">{t("lightActivity")}</SelectItem>
                    <SelectItem value="moderate_activity">{t("moderateActivity")}</SelectItem>
                    <SelectItem value="high_activity">{t("highActivity")}</SelectItem>
                    <SelectItem value="athlete">{t("athlete")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalsType">{t("goals")}</Label>
                <Select value={goalsType} onValueChange={setGoalsType} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t("goalsPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">{t("weightLoss")}</SelectItem>
                    <SelectItem value="muscle_gain">{t("muscleGain")}</SelectItem>
                    <SelectItem value="health_improvement">{t("healthImprovement")}</SelectItem>
                    <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t("aiAnalyzingTitle")}
                  </>
                ) : (
                  t("signup")
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t("alreadyHaveAccount")} </span>
              <Link href="/login" className="text-green-600 hover:underline">
                {t("login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
