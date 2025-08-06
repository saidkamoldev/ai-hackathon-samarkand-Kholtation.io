"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import {
  Activity,
  Heart,
  Target,
  Users,
  Shield,
  Brain,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const features = [
    {
      icon: Heart,
      title: t("healthTracking"),
      description: t("healthTrackingDesc"),
    },
    {
      icon: Target,
      title: t("smartGoals"),
      description: t("smartGoalsDesc"),
    },
    {
      icon: Activity,
      title: t("activityMonitoring"),
      description: t("activityMonitoringDesc"),
    },
    {
      icon: Brain,
      title: t("aiNutrition"),
      description: t("aiNutritionDesc"),
    },
    {
      icon: Shield,
      title: t("dataSecurity"),
      description: t("dataSecurityDesc"),
    },
    {
      icon: Users,
      title: t("expertSupport"),
      description: t("expertSupportDesc"),
    },
  ]

  const stats = [
    { number: "1M+", label: t("mealsTracked") },
    { number: "95%", label: t("goalAchievement") },
    { number: "24/7", label: t("aiSupport") },
  ]

  const testimonials = [
    {
      name: t("testimonial1Name"),
      role: t("testimonial1Role"),
      content: t("testimonial1Content"),
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: t("testimonial3Name"),
      role: t("testimonial3Role"),
      content: t("testimonial3Content"),
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: t("testimonial4Name"),
      role: t("testimonial4Role"),
      content: t("testimonial4Content"),
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  const howItWorks = [
    {
      step: "1",
      title: t("signUp"),
      description: t("signUpDesc"),
    },
    {
      step: "2",
      title: t("setGoals"),
      description: t("setGoalsDesc"),
    },
    {
      step: "3",
      title: t("trackProgress"),
      description: t("trackProgressDesc"),
    },
    {
      step: "4",
      title: t("achieveResults"),
      description: t("achieveResultsDesc"),
    },
  ]

  const faqs = [
    {
      question: t("faqQuestion1"),
      answer: t("faqAnswer1"),
    },
    {
      question: t("faqQuestion2"),
      answer: t("faqAnswer2"),
    },
    {
      question: t("faqQuestion3"),
      answer: t("faqAnswer3"),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
                {t("aiPoweredHealthPlatform")}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">{t("heroSubtitle")}</p>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  <Link href={user ? "/dashboard" : "/signup"}>
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-transparent">
                  <Play className="mr-2 h-5 w-5" />
                  {t("watchDemo")}
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-3xl opacity-20"></div>
                <Image
                  src="/images/Transparrent-02.png"
                  alt="Health Dashboard"
                  width={500}
                  height={600}
                  className="relative rounded-3xl shadow-2xl"
                />
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div className="text-sm font-semibold mt-1">{t("heartRate")}</div>
                  <div className="text-xs text-gray-500">72 BPM</div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg animate-pulse">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="text-sm font-semibold mt-1">{t("progress")}</div>
                  <div className="text-xs text-gray-500">+15% this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-96 w-96 rounded-full bg-green-200/30 blur-3xl"></div>
          </div>
          <div className="absolute right-1/4 top-1/4">
            <div className="h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 sm:py-32 bg-gray-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">{t("powerfulFeaturesBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("featuresSectionTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("featuresSectionSubtitle")}</p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="animate-slide-up border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-1/4">
            <div className="h-64 w-64 rounded-full bg-green-200/20 blur-3xl"></div>
          </div>
          <div className="absolute right-1/4 bottom-1/4">
            <div className="h-96 w-96 rounded-full bg-blue-200/20 blur-3xl"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-80 w-80 rounded-full bg-purple-200/15 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 relative bg-gradient-to-br from-green-50/70 via-blue-50/50 to-white/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">{t("simpleProcessBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("howYoginWorksTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("howYoginWorksSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-1/4">
            <div className="h-72 w-72 rounded-full bg-green-200/25 blur-3xl"></div>
          </div>
          <div className="absolute right-1/4 bottom-1/4">
            <div className="h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-64 w-64 rounded-full bg-teal-200/15 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t("userReviewsBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("whatUsersSayTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("whatUsersSaySubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="animate-slide-up shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name} • {testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">❓ FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("faqTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("faqSubtitle")}</p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="animate-slide-up shadow-lg" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">{t("productShowcaseBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("productShowcaseTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("productShowcaseSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-slide-in-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("smartDashboardTitle")}</h3>
              <p className="text-gray-600 mb-6">{t("smartDashboardDescription")}</p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  {t("realTimeMetrics")}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  {t("personalizedRecommendations")}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  {t("progressVisualization")}
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  {t("goalAchievementTracking")}
                </li>
              </ul>
            </div>
            <div className="animate-slide-in-right">
              <Image
                src="/images/image.png"
                alt="Dashboard Screenshot"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-slide-in-left lg:order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("aiFoodAnalysisTitle")}</h3>
              <p className="text-gray-600 mb-6">{t("aiFoodAnalysisDescription")}</p>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t("aiPoweredAnalysis")}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t("aiAnalysisExample")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right lg:order-1">
              <Image
                src="/images/image3.png"
                alt="AI Food Analysis"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("activityTrackingTitle")}</h3>
              <p className="text-gray-600 mb-6">{t("activityTrackingDescription")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">12,847</div>
                  <div className="text-sm text-gray-600">{t("stepsToday")}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">72</div>
                  <div className="text-sm text-gray-600">{t("avgHeartRate")}</div>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <Image
                src="/images/image4.png"
                alt="Activity Tracking"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Health Benefits Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-100">{t("healthBenefitsBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t("transformHealthJourneyTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{t("transformHealthJourneySubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "🏃‍♂️",
                title: t("improvedFitness"),
                description: t("improvedFitnessDesc"),
                stat: "40%",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: "⚖️",
                title: t("weightManagement"),
                description: t("weightManagementDesc"),
                stat: "8kg",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: "🧠",
                title: t("betterMentalHealth"),
                description: t("betterMentalHealthDesc"),
                stat: "85%",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: "💤",
                title: t("qualitySleep"),
                description: t("qualitySleepDesc"),
                stat: "2 weeks",
                color: "from-indigo-500 to-blue-500",
              },
              {
                icon: "🍎",
                title: t("nutritionAwareness"),
                description: t("nutritionAwarenessDesc"),
                stat: "90%",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: "💪",
                title: t("strengthBuilding"),
                description: t("strengthBuildingDesc"),
                stat: "15%",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="animate-slide-up border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <div
                    className={`text-3xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent mb-2`}
                  >
                    {benefit.stat}
                  </div>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Image
              src="/images/image5.png"
              alt="Health Benefits Infographic"
              width={800}
              height={400}
              className="mx-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">{t("aiTechnologyBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("aiTechnologyTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("aiTechnologySubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="animate-slide-up shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("nlpTitle")}</h3>
                <p className="text-gray-600 mb-4">{t("nlpDescription")}</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-left">
                  <div className="text-gray-500 mb-1">{t("input")}</div>
                  <div className="italic">
                    {t("aiExampleInput")}
                  </div>
                  <div className="text-gray-500 mt-2 mb-1">{t("aiOutput")}</div>
                  <div className="text-green-600">{t("aiExampleOutput")}</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-slide-up shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: "100ms" }}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("personalizedRecsTitle")}</h3>
                <p className="text-gray-600 mb-4">{t("personalizedRecsDescription")}</p>
                <div className="space-y-2">
                  <div className="bg-green-50 rounded-lg p-2 text-sm">
                    <span className="text-green-600 font-medium">💡 Tip:</span> {t("proteinTip")}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-sm">
                    <span className="text-blue-600 font-medium">🎯 Goal:</span> {t("cardioGoal")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-slide-up shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("predictiveAnalyticsTitle")}</h3>
                <p className="text-gray-600 mb-4">{t("predictiveAnalyticsDescription")}</p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                  <div className="text-sm text-purple-700 font-medium mb-1">{t("prediction")}</div>
                  <div className="text-sm text-gray-600">{t("weightGoalPrediction")}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* <div className="text-center">
            <Image
              src="/placeholder.svg?height=300&width=1000"
              alt="AI Technology Diagram"
              width={1000}
              height={300}
              className="mx-auto rounded-2xl shadow-2xl"
            />
          </div> */}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">{t("successStoriesBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t("successStoriesTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("successStoriesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 mb-16 justify-items-center">
            {[
              {
                name: t("successStorySaidkamolName"),
                age: t("successStorySaidkamolAge"),
                location: "",
                achievement: t("successStorySaidkamolAchievement"),
                image: "/placeholder.svg?height=300&width=300",
                story: t("successStorySaidkamolStory"),
                beforeAfter: {
                  before: t("successStorySaidkamolBefore"),
                  after: t("successStorySaidkamolAfter"),
                },
                metrics: [
                  { label: t("successStorySaidkamolWeightLabel"), value: t("successStorySaidkamolWeight"), color: "text-blue-500" },
                  { label: t("successStorySaidkamolMuscleLabel"), value: t("successStorySaidkamolMuscle"), color: "text-green-500" },
                  { label: t("successStorySaidkamolEnergyLabel"), value: t("successStorySaidkamolEnergy"), color: "text-purple-500" },
                                ],
              },
            ].map((story, index) => (
              <Card
                key={index}
                className="animate-slide-up shadow-xl hover:shadow-2xl transition-all duration-300 max-w-2xl w-full"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Image
                      src={story.image || "/placeholder.svg"}
                      alt={story.name}
                      width={80}
                      height={80}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                      <p className="text-gray-600">
                        {story.age} years old, {story.location}
                      </p>
                      <Badge className="mt-1 bg-green-100 text-green-800">{story.achievement}</Badge>
                    </div>
                  </div>

                  <blockquote className="text-gray-700 italic mb-6 border-l-4 border-green-500 pl-4">
                    "{story.story}"
                  </blockquote>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-red-500 font-medium">{t("before")}</span>
                        <p className="text-gray-600">{story.beforeAfter.before}</p>
                      </div>
                      <div>
                        <span className="text-green-500 font-medium">{t("after")}</span>
                        <p className="text-gray-600">{story.beforeAfter.after}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {story.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                        <div className="text-xs text-gray-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="bg-transparent">
              {t("viewMoreSuccessStories")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">{t("whyChooseYoginBadge")}</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t("yoginVsTraditionalTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{t("yoginVsTraditionalSubtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("traditionalMethods")}</h3>
                    <div className="space-y-4">
                      {[
                        t("manualCalorieCounting"),
                        t("genericDietPlans"),
                        t("noPersonalization"),
                        t("timeConsumingTracking"),
                        t("limitedInsights"),
                        t("noAiAssistance"),
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-3">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center justify-center mb-4">
                      <Image src="/images/yogin-logo.png" alt="Yogin" width={24} height={24} className="rounded mr-2" />
                      <h3 className="text-lg font-semibold text-green-600">{t("yoginAiPlatform")}</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        t("aiPoweredFoodAnalysis"),
                        t("personalizedRecommendations"),
                        t("smartGoalSetting"),
                        t("effortlessTracking"),
                        t("deepHealthInsights"),
                        t("aiAssistance"),
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("resultsComparison")}</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">{t("goalAchievementRate")}</div>
                        <div className="text-2xl font-bold text-red-500">45%</div>
                        <div className="text-xs text-gray-500">{t("traditional")}</div>
                      </div>
                      <div className="text-4xl">🆚</div>
                      <div>
                        <div className="text-sm text-gray-600 mb-2">{t("goalAchievementRate")}</div>
                        <div className="text-2xl font-bold text-green-500">95%</div>
                        <div className="text-xs text-gray-500">{t("withYogin")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      {/*
      <section className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
              {t("trustedPartnersBadge")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t("certifiedByExpertsTitle")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{t("certifiedByExpertsSubtitle")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { name: t("healthMinistry"), logo: "/placeholder.svg?height=80&width=120" },
              { name: t("nutritionSociety"), logo: "/placeholder.svg?height=80&width=120" },
              { name: t("fitnessAssociation"), logo: "/placeholder.svg?height=80&width=120" },
              { name: t("medicalBoard"), logo: "/placeholder.svg?height=80&width=120" },
            ].map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Image
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  width={120}
                  height={80}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: t("fdaApproved"),
                description: t("fdaApprovedDesc"),
              },
              {
                icon: Shield,
                title: t("hipaaCompliant"),
                description: t("hipaaCompliantDesc"),
              },
              {
                icon: Users,
                title: t("expertReviewed"),
                description: t("expertReviewedDesc"),
              },
            ].map((cert, index) => (
              <Card
                key={index}
                className="animate-slide-up text-center shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <cert.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{cert.title}</h3>
                  <p className="text-gray-600">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Enhanced CTA Section */}
      <section className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20">{t("joinHealthRevolutionBadge")}</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{t("transformHealthTitle")}</h2>
            <p className="mt-6 text-xl text-white/90 leading-relaxed">{t("transformHealthSubtitle")}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="px-8 py-4 text-lg font-semibold">
                <Link href={user ? "/dashboard" : "/signup"}>
                  {t("getStarted")} - {t("itsFree")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center text-white/80 text-sm">
                <Shield className="h-4 w-4 mr-2" />
                {t("noCreditCard")}
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                {t("availableLanguages")}
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t("aiSupport247")}
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                {t("certifiedByExperts")}
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/images/yogin-logo.png" alt="Yogin" width={32} height={32} className="rounded-lg" />
                <span className="text-2xl font-bold text-green-400">Yogin</span>
              </div>
              <p className="text-gray-400 mb-4">{t("footerDescription")}</p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  {t("privacyPolicy")}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  {t("termsOfService")}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("features")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("healthTracking")}</li>
                <li>{t("aiNutrition")}</li>
                <li>{t("goalSetting")}</li>
                <li>{t("expertSupport")}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("support")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("helpCenter")}</li>
                <li>{t("contactUs")}</li>
                <li>{t("community")}</li>
                <li>{t("apiDocs")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Holtation.io. All rights reserved.</p>
            <div className="mt-2 text-sm">
              Aloqa uchun: <a href="tel:+998915047659" className="text-green-400 hover:underline">+998 91 504 76 59</a> | Telegram: <a href="https://t.me/saidkamoldev" className="text-green-400 hover:underline" target="_blank">@saidkamoldev</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
