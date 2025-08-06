"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Store,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  Gift,
  Coins,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Trophy,
  Award,
  Users,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Partner {
  id: number
  name: string
  description: string
  logo: string
  website: string
  phone: string
  email: string
  address: string
  discount_min: number
  discount_max: number
  points_cost: number
  is_active: boolean
  category: string
}

interface PartnerHistory {
  id: number
  partner: Partner
  points_spent: number
  discount_amount: number
  order_amount: number
  order_details: string
  status: string
  used_at: string
  created_at: string
}

export default function PartnersPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const [partners, setPartners] = useState<Partner[]>([])
  const [partnerHistory, setPartnerHistory] = useState<PartnerHistory[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [orderAmount, setOrderAmount] = useState("")
  const [orderDetails, setOrderDetails] = useState("")
  const [useDiscountLoading, setUseDiscountLoading] = useState(false)

  // Ma'lumotlarni yuklash
  const fetchData = async () => {
    setApiLoading(true)
    setApiError(null)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        setApiError("No auth token found")
        return
      }

      // Partner kompaniyalarni olish
      const resPartners = await fetch("http://localhost:8080/partners", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resPartners.ok) {
        const partnersData = await resPartners.json()
        setPartners(partnersData)
      }

      // Partner tarixini olish
      const resHistory = await fetch(`http://localhost:8080/users/${user.ID}/partner-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resHistory.ok) {
        const historyData = await resHistory.json()
        setPartnerHistory(historyData)
      }
    } catch (err: any) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  // Chegirma ishlatish
  const useDiscount = async () => {
    if (!selectedPartner || !orderAmount || !orderDetails) return

    setUseDiscountLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("http://localhost:8080/partners/use-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          partner_id: selectedPartner.id,
          order_amount: parseFloat(orderAmount),
          order_details: orderDetails,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Muvaffaqiyatli!",
          description: `${data.discount_amount}% chegirma qo'llanildi. ${data.points_spent} ball sarflandi.`,
        })
        setOrderAmount("")
        setOrderDetails("")
        setSelectedPartner(null)
        fetchData() // Ma'lumotlarni yangilash
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to use discount")
      }
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Failed to use discount",
        variant: "destructive",
      })
    } finally {
      setUseDiscountLoading(false)
    }
  }

  useEffect(() => {
    if (user && !loading) {
      fetchData()
    }
  }, [user, loading])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "meal_plan":
        return "bg-green-100 text-green-800"
      case "nutrition":
        return "bg-blue-100 text-blue-800"
      case "food_delivery":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meal_plan":
        return "🍽️"
      case "nutrition":
        return "🥗"
      case "food_delivery":
        return "🚚"
      default:
        return "🏢"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Partner Kompaniyalar
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                Ballaringiz bilan chegirmalardan foydalaning
              </p>
            </div>
          </div>

          {/* API Status */}
          {apiLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                <span className="text-blue-700">Ma'lumotlar yuklanmoqda...</span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-700">Xatolik: {apiError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Partner Kompaniyalar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {partners.map((partner) => (
            <Card key={partner.id} className="animate-slide-up shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={partner.logo} alt={partner.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-bold">
                        {partner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <Badge className={getCategoryColor(partner.category)}>
                        {getCategoryIcon(partner.category)} {partner.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{partner.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Chegirma: {partner.discount_min}% - {partner.discount_max}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      Narxi: {partner.points_cost} ball
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Phone className="h-3 w-3" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span>{partner.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{partner.address}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(partner.website, '_blank')}
                    className="flex-1"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Sayt
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        onClick={() => {
                          toast({
                            title: "Tez orada ishga tushadi!",
                            description: "Bu funksiya hozircha ishlab chiqilmoqda. Noqulayliklar uchun uzur so'raymiz!",
                          })
                        }}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Chegirma ishlatish
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tez orada ishga tushadi!</DialogTitle>
                        <DialogDescription>
                          Bu funksiya hozircha ishlab chiqilmoqda. Noqulayliklar uchun uzur so'raymiz!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="text-center py-8">
                        <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                          <div className="flex items-center justify-center space-x-2 text-yellow-700 mb-2">
                            <Info className="h-6 w-6" />
                            <span className="font-medium">Ishlab chiqilmoqda</span>
                          </div>
                          <p className="text-sm text-yellow-600">
                            Partner kompaniyalar bilan chegirma ishlatish funksiyasi tez orada ishga tushadi.
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedPartner(null)}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        >
                          Tushunarli
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partner foydalanish tarixi */}
        <Card className="animate-slide-up shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Foydalanish tarixi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnerHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Hali hech qanday partner xizmatidan foydalanmagan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {partnerHistory.map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={history.partner.logo} alt={history.partner.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                          {history.partner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{history.partner.name}</h4>
                        <p className="text-sm text-gray-600">{history.order_details}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(history.created_at).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600">
                          {history.discount_amount}% chegirma
                        </Badge>
                        <Badge variant="outline" className="text-yellow-600">
                          {history.points_spent} ball
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {history.order_amount.toLocaleString()} so'm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 