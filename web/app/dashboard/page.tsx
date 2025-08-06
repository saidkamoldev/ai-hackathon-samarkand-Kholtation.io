"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Target,
  Activity,
  BookOpen,
  Plus,
  Apple,
  TrendingUp,
  TrendingDown,
  Award,
  FlameIcon as Fire,
  Droplets,
  Moon,
  Bell,
  Settings,
  Share2,
  Download,
  BarChart3,
  LineChart,
  Utensils,
  Dumbbell,
  Brain,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Trophy,
  Star,
  Camera,
  MessageCircle,
  ThumbsUp,
  Eye,
  Users,
  Loader2,
  Store,
} from "lucide-react"
import { FoodIntakeForm } from "@/components/forms/FoodIntakeForm"
import { ProfileUpdateForm } from "@/components/forms/ProfileUpdateForm"
// import { ActivitiesForm } from "@/components/forms/ActivitiesForm" // Backendda yo'q API
import { format } from "date-fns"

function isProfileComplete(user: any) {
  return (
    user &&
    user.age > 0 &&
    user.health &&
    user.health.weight > 0 &&
    user.health.height > 0 &&
    user.health.sex &&
    user.health.activate &&
    (user.health.activate.activate_type || user.health.activate.activateType) &&
    user.goals &&
    (user.goals.goals_type || user.goals.goalsType)
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  // --- API orqali target va status olish ---
  const [target, setTarget] = useState<any>(null)
  const [targetStatus, setTargetStatus] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const [foodList, setFoodList] = useState<any[]>([])
  const [healthScore, setHealthScore] = useState<number>(0)

  // --- Challenge state ---
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [challengeError, setChallengeError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState<number | null>(null)
  const [updateLoading, setUpdateLoading] = useState<number | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)

  // fetchData ni tashqariga chiqaraman
  const fetchData = async () => {
    setApiLoading(true)
    setApiError(null)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setApiError("No auth token found")
        return
      }
      // Target
      const resTarget = await fetch(`http://localhost:8080/users/${user.ID}/target`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resTarget.ok) {
        const targetData = await resTarget.json()
        setTarget(targetData)
      }
      // Target status
      const resStatus = await fetch(`http://localhost:8080/users/${user.ID}/target/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resStatus.ok) {
        const statusData = await resStatus.json()
        setTargetStatus(statusData)
      }
      // Bugungi ovqatlar ro'yxati
      const resFood = await fetch(`http://localhost:8080/users/${user.ID}/food`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resFood.ok) {
        const foodData = await resFood.json()
        setFoodList(foodData)
      } else {
        setFoodList([])
      }
      // Sog'liq ballini olish
      const resScore = await fetch(`http://localhost:8080/users/${user.ID}/health-score`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resScore.ok) {
        const scoreData = await resScore.json()
        setHealthScore(scoreData.score)
      } else {
        setHealthScore(0)
      }
    } catch (err: any) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  // --- Challenge API ---
  const fetchChallenges = async () => {
    setChallengeLoading(true)
    setChallengeError(null)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("http://localhost:8080/challenges", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setChallenges(Array.isArray(data) ? data : [])
      } else {
        setChallenges([])
      }
    } catch (err: any) {
      setChallengeError(err.message)
      setChallenges([])
    } finally {
      setChallengeLoading(false)
    }
  }
  const fetchUserChallenges = async () => {
    setChallengeLoading(true)
    setChallengeError(null)
    try {
      const token = localStorage.getItem("auth_token")
      if (!user?.ID) return
      const res = await fetch(`http://localhost:8080/challenges/${user.ID}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserChallenges(Array.isArray(data) ? data.filter((uc: any) => uc.user_id === user?.ID) : [])
      } else {
        setUserChallenges([])
      }
    } catch (err: any) {
      setChallengeError(err.message)
      setUserChallenges([])
    } finally {
      setChallengeLoading(false)
    }
  }
  const joinChallenge = async (challengeId: number) => {
    setJoinLoading(challengeId)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("http://localhost:8080/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ challenge_id: challengeId }),
      })
      if (res.ok) {
        await fetchUserChallenges()
      }
    } finally {
      setJoinLoading(null)
    }
  }
  const fetchParticipants = async (challengeId: number) => {
    setSelectedChallenge(challengeId)
    setChallengeLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`http://localhost:8080/challenges/${challengeId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setParticipants(data)
      }
    } finally {
      setChallengeLoading(false)
    }
  }

  const updateProgress = async (challengeId: number) => {
    setUpdateLoading(challengeId)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`http://localhost:8080/challenges/${challengeId}/update-progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        await fetchUserChallenges()
        await fetchParticipants(selectedChallenge)
      }
    } finally {
      setUpdateLoading(null)
    }
  }

  useEffect(() => {
    if (!user || !user.ID) return
    fetchData()
  }, [user, retryCount])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      router.push("/profile/update");
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.ID) {
      fetchChallenges()
      fetchUserChallenges()
    }
  }, [user])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return t("goodMorning")
    if (hour < 17) return t("goodAfternoon")
    return t("goodEvening")
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "on-track":
        return "bg-yellow-100 text-yellow-800"
      case "behind":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Avatar className="h-16 w-16 ring-4 ring-green-100">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-green-500 text-white text-xl font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 animate-fade-in">
                  {getGreeting()}, {user.name}! 👋
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  {/* Backendda level va points yo'q, shuning uchun comment */}
                  {/* Level {target?.level || t("notAvailable")}
                  • {target?.points || "0"} points •{" "} */}
                  {t("streakDays", { count: targetStatus?.streak || 0 })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="bg-white" asChild>
                <Link href="/partners">
                  <Store className="h-4 w-4 mr-2" />
                  Partnerlar
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <Bell className="h-4 w-4 mr-2" />
                {t("notifications")}
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <Settings className="h-4 w-4 mr-2" />
                {t("settings")}
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <Share2 className="h-4 w-4 mr-2" />
                {t("share")}
              </Button>
            </div>
          </div>
          
          {/* API Status */}
          {apiLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                <span className="text-blue-700">{t("loadingHealthData")}</span>
              </div>
            </div>
          )}
          
          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-700">{t("errorLoadingData")}: {apiError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            {
              label: t("calories"),
              value: target?.calories || 0,
              target: target?.calories ? `${target.calories} cal` : t("notAvailable"),
              icon: Fire,
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              label: t("protein"),
              value: target?.protein || 0,
              target: target?.protein ? `${target.protein}g` : t("notAvailable"),
              icon: Utensils,
              color: "text-green-500",
              bg: "bg-green-50",
            },
            {
              label: t("carbs"),
              value: target?.carbs || 0,
              target: target?.carbs ? `${target.carbs}g` : t("notAvailable"),
              icon: Apple,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
            },
            {
              label: t("fat"),
              value: target?.fat || 0,
              target: target?.fat ? `${target.fat}g` : t("notAvailable"),
              icon: Activity,
              color: "text-red-500",
              bg: "bg-red-50",
            },
            {
              label: t("water"),
              value: target?.water || 0,
              target: target?.water ? `${target.water}ml` : t("notAvailable"),
              icon: Droplets,
              color: "text-cyan-500",
              bg: "bg-cyan-50",
            },
            {
              label: t("bmi"),
              value: user?.health?.weight && user?.health?.height ? 
                ((user.health.weight / Math.pow(user.health.height / 100, 2)).toFixed(1)) : t("notAvailable"),
              target: null,
              icon: User,
              color: "text-indigo-500",
              bg: "bg-indigo-50",
            },
            {
              label: t("age"),
              value: user?.age || t("notAvailable"),
              target: null,
              icon: Moon,
              color: "text-purple-500",
              bg: "bg-purple-50",
            },
            {
              label: t("weight"),
              value: user?.health?.weight || t("notAvailable"),
              target: user?.health?.weight ? `${user.health.weight}kg` : null,
              icon: Trophy,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="animate-slide-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className={`${stat.bg} rounded-full p-2 w-fit mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                {stat.target && <div className="text-xs text-gray-400 mt-1">Target: {stat.target}</div>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>{t("overview")}</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center space-x-2">
              <Apple className="h-4 w-4" />
              <span>{t("nutrition")}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t("profile")}</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>{t("challenges")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Progress */}
              <div className="lg:col-span-2">
                <Card className="animate-slide-up shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      {t("todaysProgress")}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t("export")}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Backend API dan kelgan ma'lumotlar */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{t("calories")}</span>
                          <span className="text-sm text-gray-500">
                            {targetStatus?.stat?.calories || 0}/{target?.calories || 0} cal
                          </span>
                        </div>
                        <Progress value={target?.calories ? ((targetStatus?.stat?.calories || 0) / target.calories) * 100 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{t("protein")}</span>
                          <span className="text-sm text-gray-500">
                            {targetStatus?.stat?.protein || 0}/{target?.protein || 0}g
                          </span>
                        </div>
                        <Progress value={target?.protein ? ((targetStatus?.stat?.protein || 0) / target.protein) * 100 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{t("carbs")}</span>
                          <span className="text-sm text-gray-500">
                            {targetStatus?.stat?.carbs || 0}/{target?.carbs || 0}g
                          </span>
                        </div>
                        <Progress value={target?.carbs ? ((targetStatus?.stat?.carbs || 0) / target.carbs) * 100 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{t("fat")}</span>
                          <span className="text-sm text-gray-500">
                            {targetStatus?.stat?.fat || 0}/{target?.fat || 0}g
                          </span>
                        </div>
                        <Progress value={target?.fat ? ((targetStatus?.stat?.fat || 0) / target.fat) * 100 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{t("water")}</span>
                          <span className="text-sm text-gray-500">
                            {targetStatus?.stat?.water || 0}/{target?.water || 0}ml
                          </span>
                        </div>
                        <Progress value={target?.water ? ((targetStatus?.stat?.water || 0) / target.water) * 100 : 0} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Score */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    {t("healthScore")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-red-500 mb-2">
                      {healthScore}
                    </div>
                    <div className="text-gray-500">{t("overallScore")}</div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(targetStatus || {})
                      .filter(([key]) => key !== "overall" && key !== "stat" && key !== "streak")
                      .filter(([key, value]) => typeof value === 'number') // Only render numeric values
                      .map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{t(category)}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={score as number} className="w-16 h-2" />
                            <span className={`text-sm font-medium ${getHealthScoreColor(score as number)}`}>{score}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities & Achievements - Backendda yo'q API lar, shuning uchun comment */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              Recent Activities va Achievements qismlari backendda yo'q API lar bilan ishlayapti
            </div> */}
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Nutrition Overview */}
              <div className="lg:col-span-2">
                <Card className="animate-slide-up shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-green-500" />
                      {t("todaysNutrition")}
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          {t("logFood")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("logYourFood")}</DialogTitle>
                          <DialogDescription>
                            {t("describeFood")}
                          </DialogDescription>
                        </DialogHeader>
                        {/* Ovqat kiritish formasi */}
                        <FoodIntakeForm onFoodAdded={fetchData} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                          <Fire className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-orange-600">
                            {targetStatus?.stat?.calories || 0}
                          </div>
                          <div className="text-sm text-gray-600">{t("caloriesConsumed")}</div>
                          <Progress value={target?.calories ? ((targetStatus?.stat?.calories || 0) / target.calories) * 100 : 0} className="mt-2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {targetStatus?.stat?.protein || 0}g
                          </div>
                          <div className="text-xs text-gray-600">{t("protein")}</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-xl font-bold text-yellow-600">
                            {targetStatus?.stat?.carbs || 0}g
                          </div>
                          <div className="text-xs text-gray-600">{t("carbs")}</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {targetStatus?.stat?.fat || 0}g
                          </div>
                          <div className="text-xs text-gray-600">{t("fat")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bugungi ovqatlar ro'yxati */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">{t("todaysMeals")}</h3>
                      {foodList.length === 0 ? (
                        <div className="text-gray-500 text-sm">{t("noMealsLogged")}</div>
                      ) : (
                        <ul className="space-y-2">
                          {foodList.map((food, idx) => (
                            <li key={food.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                              <div>
                                <div className="font-medium">{food.description}</div>
                                <div className="text-xs text-gray-500">{format(new Date(food.created_at), "HH:mm")}</div>
                              </div>
                              <div className="flex space-x-2">
                                <span className="text-xs text-orange-600">{food.calories} cal</span>
                                <span className="text-xs text-blue-600">{food.protein}g</span>
                                <span className="text-xs text-yellow-600">{food.carbs}g</span>
                                <span className="text-xs text-purple-600">{food.fat}g</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Nutrition Tips */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    {t("nutritionTips")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: t("proteinPower"),
                        tip: t("proteinPowerTip"),
                        icon: "🥩",
                      },
                      {
                        title: t("hydrationFirst"),
                        tip: t("hydrationFirstTip"),
                        icon: "💧",
                      },
                      {
                        title: t("colorfulPlates"),
                        tip: t("colorfulPlatesTip"),
                        icon: "🌈",
                      },
                      {
                        title: t("timingMatters"),
                        tip: t("timingMattersTip"),
                        icon: "⏰",
                      },
                    ].map((tip, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{tip.icon}</div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.tip}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Profile Info */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    {t("profileInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("name")}:</span>
                      <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("email")}:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("age")}:</span>
                      <span>{user.age || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("height")}:</span>
                      <span>{user.health?.height || "N/A"} cm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("weight")}:</span>
                      <span>{user.health?.weight || "N/A"} kg</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("sex")}:</span>
                      <span>{user.health?.sex || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("activityLevel")}:</span>
                      <span>{user.health?.activate?.activate_type || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{t("goals")}:</span>
                      <span>{user.goals?.goals_type || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Stats */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    {t("healthStatistics")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {user?.health?.weight && user?.health?.height ? 
                          ((user.health.weight / Math.pow(user.health.height / 100, 2)).toFixed(1)) : t("notAvailable")}
                      </div>
                      <div className="text-sm text-gray-600">{t("bmi")}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {targetStatus?.streak || 0}
                      </div>
                      <div className="text-sm text-gray-600">{t("dayStreak")}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {targetStatus?.overall || 0}%
                      </div>
                      <div className="text-sm text-gray-600">{t("healthScore")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Update Form */}
            <Card className="animate-slide-up shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  {t("updateProfile")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileUpdateForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Challenge ro‘yxati */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {t("activeChallenges")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challengeLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                  ) : challengeError ? (
                    <div className="text-red-500">{challengeError}</div>
                  ) : (
                    <div className="space-y-4">
                      {challenges.length === 0 ? (
                        <div className="text-gray-500">{t("noChallenges")}</div>
                      ) : (
                        challenges.map((ch) => {
                          const joined = userChallenges.some((uc) => uc.challenge_id === ch.id)
                          return (
                            <div key={ch.id} className="p-4 bg-gradient-to-br from-yellow-50 to-green-50 rounded-lg border border-yellow-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <div className="font-semibold text-lg text-gray-900">{ch.name}</div>
                                <div className="text-xs text-gray-500 mb-1">{ch.description}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge className="bg-green-100 text-green-800">{ch.type}</Badge>
                                  <span>{format(new Date(ch.start_date), "yyyy-MM-dd")} - {format(new Date(ch.end_date), "yyyy-MM-dd")}</span>
                                  <Badge className="bg-blue-100 text-blue-800">+{ch.reward_points} {t("points")}</Badge>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {joined ? (
                                  <>
                                    <Button size="sm" variant="outline" disabled>
                                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> {t("joined")}
                                    </Button>
                                    <Button size="sm" onClick={() => updateProgress(ch.id)} disabled={!!updateLoading}>
                                      {updateLoading === ch.id ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                                      {t("updateProgress")}
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" onClick={() => joinChallenge(ch.id)} disabled={!!joinLoading}>
                                    {joinLoading === ch.id ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Users className="h-4 w-4 mr-1" />}
                                    {t("joinChallenge")}
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => fetchParticipants(ch.id)}>
                                  {t("participants")}
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Challenge qatnashchilari va natijalari */}
              <Card className="animate-slide-up shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    {t("participantsAndResults")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challengeLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-gray-400" /></div>
                  ) : participants.length === 0 ? (
                    <div className="text-gray-500">{t("noParticipants")}</div>
                  ) : (
                    <ul className="space-y-2">
                      {participants.map((p) => (
                        <li key={p.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-medium">{p.user_id === user.ID ? t("you") : p.user_name}</div>
                            <div className="text-xs text-gray-500">{t("progress")}: {p.result} | {t("status")}: {p.status}</div>
                          </div>
                          <div className="flex space-x-2">
                            <span className="text-xs text-green-600">+{p.awarded_points} {t("points")}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
