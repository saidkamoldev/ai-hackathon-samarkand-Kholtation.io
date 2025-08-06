"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "uz" | "ru"

interface Translations {
  [key: string]: {
    en: string
    uz: string
    ru: string
  }
}

const translations: Translations = {
  // Navigation
  home: { en: "Home", uz: "Bosh sahifa", ru: "Главная" },
  login: { en: "Login", uz: "Kirish", ru: "Войти" },
  signup: { en: "Sign Up", uz: "Ro'yxatdan o'tish", ru: "Регистрация" },
  dashboard: { en: "Dashboard", uz: "Boshqaruv paneli", ru: "Панель управления" },

  // Hero section
  heroTitle: {
    en: "Your Health, Our Mission",
    uz: "Sizning sog'ligingiz, bizning vazifamiz",
    ru: "Ваше здоровье, наша миссия",
  },
  heroSubtitle: {
    en: "Track your health. Eat better. Live stronger.",
    uz: "Sog'ligingizni kuzating. Yaxshi ovqatlaning. Kuchliroq yashang.",
    ru: "Следите за здоровьем. Питайтесь лучше. Живите сильнее.",
  },
  getStarted: { en: "Get Started", uz: "Boshlash", ru: "Начать" },
  watchDemo: { en: "Watch Demo", uz: "Demo ko'rish", ru: "Смотреть демо" },

  // Stats
  activeUsers: { en: "Active Users", uz: "Faol foydalanuvchilar", ru: "Активные пользователи" },
  mealsTracked: { en: "Meals Tracked", uz: "Kuzatilgan ovqatlar", ru: "Отслеженные приемы пищи" },
  goalAchievement: { en: "Goal Achievement", uz: "Maqsadga erishish", ru: "Достижение целей" },
  aiSupport: { en: "AI Support", uz: "AI yordam", ru: "ИИ поддержка" },

  // Features section
  powerfulFeatures: { en: "Powerful Features", uz: "Kuchli imkoniyatlar", ru: "Мощные возможности" },
  featuresTitle: {
    en: "Everything you need for better health",
    uz: "Yaxshi sog'liq uchun kerak bo'lgan hamma narsa",
    ru: "Все необходимое для лучшего здоровья",
  },
  featuresSubtitle: {
    en: "Comprehensive health tracking and management tools powered by artificial intelligence",
    uz: "Sun'iy intellekt bilan ta'minlangan keng qamrovli sog'liqni kuzatish va boshqarish vositalari",
    ru: "Комплексные инструменты отслеживания и управления здоровьем на базе искусственного интеллекта",
  },

  // Feature items
  healthTracking: { en: "Health Tracking", uz: "Sog'liqni kuzatish", ru: "Отслеживание здоровья" },
  healthTrackingDesc: {
    en: "Monitor your daily health metrics with AI-powered insights",
    uz: "AI yordamida kunlik sog'liq ko'rsatkichlaringizni kuzating",
    ru: "Отслеживайте ежедневные показатели здоровья с помощью ИИ",
  },
  smartGoals: { en: "Smart Goals", uz: "Aqlli maqsadlar", ru: "Умные цели" },
  smartGoalsDesc: {
    en: "Set and achieve personalized health goals with expert guidance",
    uz: "Mutaxassis yo'l-yo'riqlari bilan shaxsiy sog'liq maqsadlarini belgilang",
    ru: "Ставьте персональные цели здоровья с экспертным руководством",
  },
  activityMonitoring: { en: "Activity Monitoring", uz: "Faoliyatni kuzatish", ru: "Мониторинг активности" },
  activityMonitoringDesc: {
    en: "Track workouts, steps, and physical activities automatically",
    uz: "Mashqlar, qadamlar va jismoniy faoliyatni avtomatik kuzating",
    ru: "Автоматически отслеживайте тренировки, шаги и физическую активность",
  },
  aiNutrition: { en: "AI Nutrition", uz: "AI ovqatlanish", ru: "ИИ питание" },
  aiNutritionDesc: {
    en: "Get personalized meal recommendations based on your health data",
    uz: "Sog'liq ma'lumotlaringiz asosida shaxsiy ovqat tavsiyalarini oling",
    ru: "Получайте персональные рекомендации по питанию на основе ваших данных",
  },
  dataSecurity: { en: "Data Security", uz: "Ma'lumotlar xavfsizligi", ru: "Безопасность данных" },
  dataSecurityDesc: {
    en: "Your health data is encrypted and securely stored",
    uz: "Sog'liq ma'lumotlaringiz shifrlangan va xavfsiz saqlanadi",
    ru: "Ваши данные о здоровье зашифрованы и надежно хранятся",
  },
  expertSupport: { en: "Expert Support", uz: "Mutaxassis yordami", ru: "Поддержка экспертов" },
  expertSupportDesc: {
    en: "Connect with certified health professionals and nutritionists",
    uz: "Sertifikatlangan sog'liqni saqlash mutaxassislari bilan bog'laning",
    ru: "Связывайтесь с сертифицированными специалистами по здоровью",
  },

  // How it works section
  simpleProcess: { en: "Simple Process", uz: "Oddiy jarayon", ru: "Простой процесс" },
  howItWorksTitle: { en: "How Yogin Works", uz: "Yogin qanday ishlaydi", ru: "Как работает Yogin" },
  howItWorksSubtitle: {
    en: "Get started with your health journey in just 4 simple steps",
    uz: "Sog'liq sayohatingizni atigi 4 ta oddiy qadamda boshlang",
    ru: "Начните свой путь к здоровью всего за 4 простых шага",
  },
  signUp: { en: "Sign Up", uz: "Ro'yxatdan o'ting", ru: "Регистрация" },
  signUpDesc: { en: "Create your account to get started", uz: "Boshlash uchun hisob yarating", ru: "Создайте аккаунт, чтобы начать" },
  orContinueWith: { en: "Or continue with", uz: "Yoki davom eting", ru: "Или продолжить с" },
  fullNamePlaceholder: { en: "Enter your full name", uz: "To'liq ismingizni kiriting", ru: "Введите полное имя" },
  emailPlaceholder: { en: "Enter your email", uz: "Emailingizni kiriting", ru: "Введите электронную почту" },
  passwordPlaceholder: { en: "Enter your password", uz: "Parolingizni kiriting", ru: "Введите пароль" },
  agePlaceholder: { en: "Enter your age", uz: "Yoshingizni kiriting", ru: "Введите ваш возраст" },
  heightPlaceholder: { en: "Enter your height in cm", uz: "Bo'yingizni sm da kiriting", ru: "Введите ваш рост в см" },
  weightPlaceholder: { en: "Enter your weight in kg", uz: "Vazningizni kg da kiriting", ru: "Введите ваш вес в кг" },
  sexPlaceholder: { en: "Enter your sex (Male/Female)", uz: "Jinsingizni kiriting (Erkak/Ayol)", ru: "Введите ваш пол (Муж/Жен)" },
  activityLevelPlaceholder: { en: "Select activity level", uz: "Faollik darajasini tanlang", ru: "Выберите уровень активности" },
  noActivity: { en: "No Activity", uz: "Faoliyat yo'q", ru: "Нет активности" },
  lightActivity: { en: "Light Activity", uz: "Yengil faoliyat", ru: "Легкая активность" },
  moderateActivity: { en: "Moderate Activity", uz: "O'rtacha faoliyat", ru: "Умеренная активность" },
  highActivity: { en: "High Activity", uz: "Yuqori faoliyat", ru: "Высокая активность" },
  athlete: { en: "Athlete", uz: "Sportchi", ru: "Атлет" },
  goalsPlaceholder: { en: "Select your goal", uz: "Maqsadingizni tanlang", ru: "Выберите вашу цель" },
  weightLoss: { en: "Weight Loss", uz: "Vazn yo'qotish", ru: "Похудение" },
  muscleGain: { en: "Muscle Gain", uz: "Mushak oshirish", ru: "Набор мышц" },
  healthImprovement: { en: "Health Improvement", uz: "Sog'liqni yaxshilash", ru: "Улучшение здоровья" },
  maintenance: { en: "Maintenance", uz: "Ushlab turish", ru: "Поддержание" },
  setGoals: { en: "Set Goals", uz: "Maqsad qo'ying", ru: "Поставьте цели" },
  setGoalsDesc: {
    en: "Define your health objectives",
    uz: "Sog'liq maqsadlaringizni belgilang",
    ru: "Определите цели здоровья",
  },
  trackProgress: { en: "Track Progress", uz: "Rivojlanishni kuzating", ru: "Отслеживайте прогресс" },
  trackProgressDesc: {
    en: "Monitor your daily activities",
    uz: "Kunlik faoliyatingizni kuzating",
    ru: "Отслеживайте ежедневную активность",
  },
  achieveResults: { en: "Achieve Results", uz: "Natijalarga erishing", ru: "Достигайте результатов" },
  achieveResultsDesc: {
    en: "Reach your health goals faster",
    uz: "Sog'liq maqsadlaringizga tezroq erishing",
    ru: "Быстрее достигайте целей здоровья",
  },

  // Testimonials section
  userReviews: { en: "User Reviews", uz: "Foydalanuvchi sharhlari", ru: "Отзывы пользователей" },
  testimonialsTitle: {
    en: "What Our Users Say",
    uz: "Foydalanuvchilarimiz nima deydi",
    ru: "Что говорят наши пользователи",
  },
  testimonialsSubtitle: {
    en: "Join thousands of satisfied users who transformed their health with Yogin",
    uz: "Yogin bilan sog'ligini o'zgartirgan minglab mamnun foydalanuvchilarga qo'shiling",
    ru: "Присоединяйтесь к тысячам довольных пользователей, которые изменили свое здоровье с Yogin",
  },

  // FAQ section
  faq: { en: "FAQ", uz: "Tez-tez so'raladigan savollar", ru: "Часто задаваемые вопросы" },
  faqTitle: { en: "Frequently Asked Questions", uz: "Tez-tez so'raladigan savollar", ru: "Часто задаваемые вопросы" },
  faqSubtitle: {
    en: "Get answers to common questions about Yogin",
    uz: "Yogin haqida umumiy savollarga javob oling",
    ru: "Получите ответы на распространенные вопросы о Yogin",
  },

  // FAQ items
  faqQuestion1: {
    en: "How does AI nutrition tracking work?",
    uz: "AI ovqatlanish kuzatuvi qanday ishlaydi?",
    ru: "Как работает ИИ отслеживание питания?",
  },
  faqAnswer1: {
    en: "Our AI analyzes your food descriptions and calculates nutritional values automatically.",
    uz: "Bizning AI ovqat tavsiflaringizni tahlil qiladi va ozuqaviy qiymatlarni avtomatik hisoblaydi.",
    ru: "Наш ИИ анализирует описания пищи и автоматически рассчитывает пищевую ценность.",
  },
  faqQuestion2: {
    en: "Is my health data secure?",
    uz: "Sog'liq ma'lumotlarim xavfsizmi?",
    ru: "Безопасны ли мои данные о здоровье?",
  },
  faqAnswer2: {
    en: "Yes, all data is encrypted and stored securely following healthcare standards.",
    uz: "Ha, barcha ma'lumotlar shifrlangan va sog'liqni saqlash standartlariga muvofiq xavfsiz saqlanadi.",
    ru: "Да, все данные зашифрованы и надежно хранятся согласно медицинским стандартам.",
  },
  faqQuestion3: {
    en: "Can I connect with health professionals?",
    uz: "Sog'liqni saqlash mutaxassislari bilan bog'lana olamanmi?",
    ru: "Могу ли я связаться со специалистами по здоровью?",
  },
  faqAnswer3: {
    en: "Yes, our platform connects you with certified nutritionists and health coaches.",
    uz: "Ha, bizning platforma sizni sertifikatlangan dietologlar va sog'liq murabbiylar bilan bog'laydi.",
    ru: "Да, наша платформа связывает вас с сертифицированными диетологами и тренерами по здоровью.",
  },

  // Product Showcase section
  productShowcase: { en: "Product Showcase", uz: "Mahsulot ko'rgazmasi", ru: "Демонстрация продукта" },
  productShowcaseTitle: { en: "See Yogin in Action", uz: "Yoginni amalda ko'ring", ru: "Посмотрите Yogin в действии" },
  productShowcaseSubtitle: {
    en: "Explore our intuitive interface designed for your health journey",
    uz: "Sog'liq sayohatingiz uchun mo'ljallangan intuitiv interfeysimizni o'rganing",
    ru: "Изучите наш интуитивный интерфейс, созданный для вашего пути к здоровью",
  },
  smartDashboard: { en: "Smart Dashboard", uz: "Aqlli boshqaruv paneli", ru: "Умная панель управления" },
  smartDashboardDesc: {
    en: "Get a complete overview of your health metrics, progress, and goals all in one place. Our AI-powered dashboard provides personalized insights and recommendations.",
    uz: "Sog'liq ko'rsatkichlaringiz, rivojlanishingiz va maqsadlaringizning to'liq ko'rinishini bir joyda oling. AI bilan ta'minlangan boshqaruv panelimiiz shaxsiy tushunchalar va tavsiyalar beradi.",
    ru: "Получите полный обзор ваших показателей здоровья, прогресса и целей в одном месте. Наша панель управления на базе ИИ предоставляет персонализированные insights и рекомендации.",
  },
  realTimeMetrics: {
    en: "Real-time health metrics tracking",
    uz: "Real vaqtda sog'liq ko'rsatkichlarini kuzatish",
    ru: "Отслеживание показателей здоровья в реальном времени",
  },
  personalizedRecommendations: {
    en: "Personalized daily recommendations",
    uz: "Shaxsiy kunlik tavsiyalar",
    ru: "Персонализированные ежедневные рекомендации",
  },
  progressVisualization: {
    en: "Progress visualization and analytics",
    uz: "Rivojlanishni vizualizatsiya va tahlil",
    ru: "Визуализация прогресса и аналитика",
  },
  goalTracking: {
    en: "Goal achievement tracking",
    uz: "Maqsadga erishishni kuzatish",
    ru: "Отслеживание достижения целей",
  },

  aiFoodAnalysis: { en: "AI Food Analysis", uz: "AI ovqat tahlili", ru: "ИИ анализ пищи" },
  aiFoodAnalysisDesc: {
    en: "Simply describe what you ate, and our advanced AI will automatically calculate calories, nutrients, and provide personalized feedback about your meal choices.",
    uz: "Shunchaki nima yegangizni tasvirlab bering, bizning ilg'or AI avtomatik ravishda kaloriya, ozuqaviy moddalarni hisoblaydi va ovqat tanlovlaringiz haqida shaxsiy fikr beradi.",
    ru: "Просто опишите, что вы ели, и наш продвинутый ИИ автоматически рассчитает калории, питательные вещества и предоставит персонализированную обратную связь о ваших пищевых выборах.",
  },
  aiPoweredAnalysis: { en: "AI-Powered Analysis", uz: "AI bilan ta'minlangan tahlil", ru: "Анализ на базе ИИ" },
  aiAnalysisExample: { 
    en: "AI analyzes your food descriptions and calculates nutritional values automatically", 
    uz: "AI ovqat tavsiflaringizni tahlil qiladi va ozuqaviy qiymatlarni avtomatik hisoblaydi", 
    ru: "ИИ анализирует описания пищи и автоматически рассчитывает пищевую ценность" 
  },
  goalAchievementTracking: { 
    en: "Goal achievement tracking", 
    uz: "Maqsadga erishishni kuzatish", 
    ru: "Отслеживание достижения целей" 
  },

  activityTrackingTitle: { en: "Activity Tracking", uz: "Faoliyatni kuzatish", ru: "Отслеживание активности" },
  activityTrackingDesc: {
    en: "Monitor your physical activities, workouts, and daily movement. Set fitness goals and track your progress with detailed analytics.",
    uz: "Jismoniy faoliyatingiz, mashqlaringiz va kunlik harakatlaringizni kuzating. Fitness maqsadlarini belgilang va batafsil tahlil bilan rivojlanishingizni kuzating.",
    ru: "Отслеживайте физическую активность, тренировки и ежедневные движения. Ставьте фитнес-цели и отслеживайте прогресс с подробной аналитикой.",
  },
  stepsToday: { en: "Steps Today", uz: "Bugungi qadamlar", ru: "Шаги сегодня" },
  avgHeartRate: { en: "Avg Heart Rate", uz: "O'rtacha yurak urishi", ru: "Средний пульс" },

  // Health Benefits section
  healthBenefits: { en: "Health Benefits", uz: "Sog'liq foydalari", ru: "Польза для здоровья" },
  healthBenefitsTitle: {
    en: "Transform Your Health Journey",
    uz: "Sog'liq sayohatingizni o'zgartiring",
    ru: "Трансформируйте свой путь к здоровью",
  },
  healthBenefitsSubtitle: {
    en: "Discover the amazing benefits our users experience with Yogin",
    uz: "Foydalanuvchilarimiz Yogin bilan boshdan kechirayotgan ajoyib foydalarga guvoh bo'ling",
    ru: "Откройте для себя удивительные преимущества, которые наши пользователи получают с Yogin",
  },
  improvedFitness: { en: "Improved Fitness", uz: "Yaxshilangan fitness", ru: "Улучшенная физическая форма" },
  improvedFitnessDesc: {
    en: "Users report 40% increase in daily activity levels",
    uz: "Foydalanuvchilar kunlik faollik darajasining 40% oshganini xabar qilishadi",
    ru: "Пользователи сообщают о 40% увеличении уровня ежедневной активности",
  },
  weightManagement: { en: "Weight Management", uz: "Vazn boshqaruvi", ru: "Управление весом" },
  weightManagementDesc: {
    en: "Average weight loss of 8kg in 6 months",
    uz: "6 oyda o'rtacha 8 kg vazn yo'qotish",
    ru: "Средняя потеря веса 8 кг за 6 месяцев",
  },
  betterMentalHealth: { en: "Better Mental Health", uz: "Yaxshi ruhiy salomatlik", ru: "Лучшее психическое здоровье" },
  betterMentalHealthDesc: {
    en: "85% report improved mood and energy",
    uz: "85% kayfiyat va energiyaning yaxshilanganini xabar qiladi",
    ru: "85% сообщают об улучшении настроения и энергии",
  },
  qualitySleep: { en: "Quality Sleep", uz: "Sifatli uyqu", ru: "Качественный сон" },
  qualitySleepDesc: {
    en: "Better sleep quality in just 2 weeks",
    uz: "Atigi 2 haftada yaxshi uyqu sifati",
    ru: "Лучшее качество сна всего за 2 недели",
  },
  nutritionAwareness: { en: "Nutrition Awareness", uz: "Ovqatlanish xabardorligi", ru: "Осведомленность о питании" },
  nutritionAwarenessDesc: {
    en: "90% make healthier food choices",
    uz: "90% sog'lom ovqat tanlovlarini amalga oshiradi",
    ru: "90% делают более здоровый выбор пищи",
  },
  strengthBuilding: { en: "Strength Building", uz: "Kuch oshirish", ru: "Наращивание силы" },
  strengthBuildingDesc: {
    en: "Muscle mass increase by 15% average",
    uz: "Mushak massasining o'rtacha 15% oshishi",
    ru: "Увеличение мышечной массы в среднем на 15%",
  },

  // Technology section
  aiTechnology: { en: "AI Technology", uz: "AI texnologiyasi", ru: "ИИ технология" },
  aiTechnologyTitle: {
    en: "Powered by Advanced AI",
    uz: "Ilg'or AI bilan ta'minlangan",
    ru: "Работает на продвинутом ИИ",
  },
  aiTechnologySubtitle: {
    en: "Our cutting-edge artificial intelligence makes health tracking effortless and accurate",
    uz: "Bizning zamonaviy sun'iy intellektimiz sog'liqni kuzatishni oson va aniq qiladi",
    ru: "Наш передовой искусственный интеллект делает отслеживание здоровья легким и точным",
  },
  naturalLanguageProcessing: {
    en: "Natural Language Processing",
    uz: "Tabiiy til qayta ishlash",
    ru: "Обработка естественного языка",
  },
  naturalLanguageProcessingDesc: {
    en: "Describe your meals in plain language, and our AI understands and analyzes nutritional content automatically.",
    uz: "Ovqatlaringizni oddiy tilda tasvirlab bering, bizning AI avtomatik ravishda ozuqaviy tarkibni tushunadi va tahlil qiladi.",
    ru: "Описывайте свои блюда простым языком, и наш ИИ автоматически понимает и анализирует питательный состав.",
  },
  personalizedRecommendationsTitle: {
    en: "Personalized Recommendations",
    uz: "Shaxsiy tavsiyalar",
    ru: "Персонализированные рекомендации",
  },
  personalizedRecommendationsDesc: {
    en: "AI analyzes your health data, preferences, and goals to provide tailored nutrition and fitness advice.",
    uz: "AI sizning sog'liq ma'lumotlaringiz, afzalliklaringiz va maqsadlaringizni tahlil qilib, moslashtirilgan ovqatlanish va fitness maslahatlarini beradi.",
    ru: "ИИ анализирует ваши данные о здоровье, предпочтения и цели, чтобы предоставить индивидуальные советы по питанию и фитнесу.",
  },
  predictiveAnalytics: { en: "Predictive Analytics", uz: "Bashoratli tahlil", ru: "Предиктивная аналитика" },
  predictiveAnalyticsDesc: {
    en: "Our AI predicts health trends and suggests preventive measures based on your data patterns.",
    uz: "Bizning AI sog'liq tendentsiyalarini bashorat qiladi va ma'lumotlar naqshlaringiz asosida profilaktik choralarni taklif qiladi.",
    ru: "Наш ИИ предсказывает тенденции здоровья и предлагает профилактические меры на основе ваших данных.",
  },

  // Success Stories section
  successStories: { en: "Success Stories", uz: "Muvaffaqiyat hikoyalari", ru: "Истории успеха" },
  successStoriesTitle: {
    en: "Real People, Real Results",
    uz: "Haqiqiy odamlar, haqiqiy natijalar",
    ru: "Реальные люди, реальные результаты",
  },
  successStoriesSubtitle: {
    en: "Inspiring transformation stories from our community",
    uz: "Jamiyatimizdan ilhomlantiruvchi o'zgarish hikoyalari",
    ru: "Вдохновляющие истории трансформации из нашего сообщества",
  },
  viewMoreStories: {
    en: "View More Success Stories",
    uz: "Ko'proq muvaffaqiyat hikoyalarini ko'rish",
    ru: "Посмотреть больше историй успеха",
  },
  weightLost: { en: "Weight Lost", uz: "Yo'qotilgan vazn", ru: "Потерянный вес" },
  bodyFat: { en: "Body Fat", uz: "Tana yog'i", ru: "Жир тела" },
  energyLevel: { en: "Energy Level", uz: "Energiya darajasi", ru: "Уровень энергии" },
  muscleGain: { en: "Muscle Gain", uz: "Mushak oshishi", ru: "Прирост мышц" },
  strength: { en: "Strength", uz: "Kuch", ru: "Сила" },
  activity: { en: "Activity", uz: "Faollik", ru: "Активность" },

  // Health Tips section
  healthTips: { en: "Health Tips", uz: "Sog'liq maslahatlari", ru: "Советы по здоровью" },
  healthTipsTitle: {
    en: "Expert Health Advice",
    uz: "Mutaxassis sog'liq maslahatlari",
    ru: "Экспертные советы по здоровью",
  },
  healthTipsSubtitle: {
    en: "Daily tips and insights from certified health professionals",
    uz: "Sertifikatlangan sog'liqni saqlash mutaxassislardan kunlik maslahatlar va tushunchalar",
    ru: "Ежедневные советы и insights от сертифицированных специалистов по здоровью",
  },
  powerOfProtein: { en: "The Power of Protein", uz: "Oqsilning kuchi", ru: "Сила белка" },
  powerOfProteinDesc: {
    en: "Learn why protein is essential for muscle building and weight management",
    uz: "Oqsil nima uchun mushak qurish va vazn boshqaruvi uchun muhimligini bilib oling",
    ru: "Узнайте, почему белок важен для наращивания мышц и управления весом",
  },
  hiitVsSteady: { en: "HIIT vs Steady Cardio", uz: "HIIT vs doimiy kardio", ru: "HIIT против стабильного кардио" },
  hiitVsSteadyDesc: {
    en: "Discover which cardio method is best for your fitness goals",
    uz: "Fitness maqsadlaringiz uchun qaysi kardio usuli eng yaxshiligini bilib oling",
    ru: "Узнайте, какой метод кардио лучше всего подходит для ваших фитнес-целей",
  },
  sleepRecovery: { en: "Sleep & Recovery", uz: "Uyqu va tiklanish", ru: "Сон и восстановление" },
  sleepRecoveryDesc: {
    en: "Why quality sleep is crucial for your health and fitness progress",
    uz: "Sifatli uyqu nima uchun sog'ligingiz va fitness rivojlanishingiz uchun muhimligini bilib oling",
    ru: "Почему качественный сон важен для вашего здоровья и фитнес-прогресса",
  },
  stressManagement: { en: "Stress Management", uz: "Stress boshqaruvi", ru: "Управление стрессом" },
  stressManagementDesc: {
    en: "Effective techniques to manage stress and improve mental wellbeing",
    uz: "Stressni boshqarish va ruhiy farovonlikni yaxshilash uchun samarali usullar",
    ru: "Эффективные техники управления стрессом и улучшения психического благополучия",
  },
  waterHealth: { en: "Water & Health", uz: "Suv va sog'liq", ru: "Вода и здоровье" },
  waterHealthDesc: {
    en: "The importance of proper hydration for optimal body function",
    uz: "Tananing optimal ishlashi uchun to'g'ri gidratatsiyaning ahamiyati",
    ru: "Важность правильной гидратации для оптимального функционирования организма",
  },
  buildingHealthyRoutines: {
    en: "Building Healthy Routines",
    uz: "Sog'lom odatlarni shakllantirish",
    ru: "Формирование здоровых привычек",
  },
  buildingHealthyRoutinesDesc: {
    en: "How to create lasting healthy habits that stick long-term",
    uz: "Uzoq muddatli sog'lom odatlarni qanday yaratish mumkin",
    ru: "Как создать долгосрочные здоровые привычки",
  },
  readMore: { en: "Read More", uz: "Ko'proq o'qish", ru: "Читать далее" },
  minRead: { en: "min read", uz: "daqiqa o'qish", ru: "мин чтения" },

  // Comparison section
  whyChooseYogin: { en: "Why Choose Yogin", uz: "Nima uchun Yoginni tanlash kerak", ru: "Почему выбрать Yogin" },
  comparisonTitle: {
    en: "Yogin vs Traditional Methods",
    uz: "Yogin vs an'anaviy usullar",
    ru: "Yogin против традиционных методов",
  },
  comparisonSubtitle: {
    en: "See how Yogin revolutionizes health tracking compared to traditional approaches",
    uz: "Yogin an'anaviy yondashuvlar bilan solishtirganda sog'liqni kuzatishni qanday inqilob qilishini ko'ring",
    ru: "Посмотрите, как Yogin революционизирует отслеживание здоровья по сравнению с традиционными подходами",
  },
  traditionalMethods: { en: "Traditional Methods", uz: "An'anaviy usullar", ru: "Традиционные методы" },
  yoginAiPlatform: { en: "Yogin AI Platform", uz: "Yogin AI platformasi", ru: "Платформа Yogin AI" },
  resultsComparison: { en: "Results Comparison", uz: "Natijalar taqqoslash", ru: "Сравнение результатов" },
  goalAchievementRate: {
    en: "Goal Achievement Rate",
    uz: "Maqsadga erishish darajasi",
    ru: "Уровень достижения целей",
  },
  traditional: { en: "Traditional", uz: "An'anaviy", ru: "Традиционный" },
  withYogin: { en: "With Yogin", uz: "Yogin bilan", ru: "С Yogin" },

  // Partnership section
  trustedPartners: { en: "Trusted Partners", uz: "Ishonchli hamkorlar", ru: "Надежные партнеры" },
  partnersTitle: {
    en: "Certified by Health Experts",
    uz: "Sog'liq mutaxassislari tomonidan sertifikatlangan",
    ru: "Сертифицировано экспертами по здоровью",
  },
  partnersSubtitle: {
    en: "Yogin is trusted and recommended by leading health organizations",
    uz: "Yogin yetakchi sog'liqni saqlash tashkilotlari tomonidan ishoniladi va tavsiya etiladi",
    ru: "Yogin пользуется доверием и рекомендуется ведущими организациями здравоохранения",
  },
  fdaApproved: { en: "FDA Approved", uz: "FDA tomonidan tasdiqlangan", ru: "Одобрено FDA" },
  fdaApprovedDesc: {
    en: "Our health tracking algorithms meet FDA standards for medical applications",
    uz: "Bizning sog'liqni kuzatish algoritmlarimiz tibbiy ilovalar uchun FDA standartlariga javob beradi",
    ru: "Наши алгоритмы отслеживания здоровья соответствуют стандартам FDA для медицинских приложений",
  },
  hipaaCompliant: { en: "HIPAA Compliant", uz: "HIPAA talablariga mos", ru: "Соответствует HIPAA" },
  hipaaCompliantDesc: {
    en: "Your health data is protected with enterprise-grade security measures",
    uz: "Sizning sog'liq ma'lumotlaringiz korporativ darajadagi xavfsizlik choralari bilan himoyalangan",
    ru: "Ваши данные о здоровье защищены мерами безопасности корпоративного уровня",
  },
  expertReviewed: { en: "Expert Reviewed", uz: "Mutaxassislar tomonidan ko'rib chiqilgan", ru: "Проверено экспертами" },
  expertReviewedDesc: {
    en: "All recommendations are reviewed by certified nutritionists and doctors",
    uz: "Barcha tavsiyalar sertifikatlangan dietologlar va shifokorlar tomonidan ko'rib chiqiladi",
    ru: "Все рекомендации проверяются сертифицированными диетологами и врачами",
  },

  // CTA section
  joinHealthRevolution: {
    en: "Join the Health Revolution",
    uz: "Sog'liq inqilobiga qo'shiling",
    ru: "Присоединяйтесь к революции здоровья",
  },
  ctaTitle: {
    en: "Ready to Transform Your Health?",
    uz: "Sog'ligingizni o'zgartirishga tayyormisiz?",
    ru: "Готовы трансформировать свое здоровье?",
  },
  ctaSubtitle: {
    en: "Join over 50,000 users who are already improving their health with Yogin's AI-powered platform",
    uz: "Yoginning AI bilan ta'minlangan platformasi bilan sog'ligini yaxshilayotgan 50,000 dan ortiq foydalanuvchilarga qo'shiling",
    ru: "Присоединяйтесь к более чем 50,000 пользователей, которые уже улучшают свое здоровье с помощью платформы Yogin на базе ИИ",
  },
  getStartedFree: { en: "Get Started - It's Free", uz: "Boshlash - Bu bepul", ru: "Начать - Это бесплатно" },
  noCreditCard: {
    en: "No credit card required",
    uz: "Kredit karta talab qilinmaydi",
    ru: "Кредитная карта не требуется",
  },
  availableLanguages: { en: "Available in 3 languages", uz: "3 tilda mavjud", ru: "Доступно на 3 языках" },
  support247: { en: "24/7 AI Support", uz: "24/7 AI yordam", ru: "24/7 поддержка ИИ" },
  certifiedExperts: {
    en: "Certified by health experts",
    uz: "Sog'liq mutaxassislari tomonidan sertifikatlangan",
    ru: "Сертифицировано экспертами по здоровью",
  },

  // Footer
  footerDescription: {
    en: "AI-powered health platform helping you achieve your wellness goals through smart tracking and personalized insights.",
    uz: "Aqlli kuzatuv va shaxsiy tushunchalar orqali sog'liq maqsadlaringizga erishishga yordam beradigan AI bilan ta'minlangan sog'liq platformasi.",
    ru: "Платформа здоровья на базе ИИ, помогающая достичь ваших целей благополучия через умное отслеживание и персонализированные insights.",
  },
  features: { en: "Features", uz: "Imkoniyatlar", ru: "Возможности" },
  support: { en: "Support", uz: "Yordam", ru: "Поддержка" },
  helpCenter: { en: "Help Center", uz: "Yordam markazi", ru: "Центр помощи" },
  contactUs: { en: "Contact Us", uz: "Biz bilan bog'laning", ru: "Свяжитесь с нами" },
  community: { en: "Community", uz: "Jamiyat", ru: "Сообщество" },
  apiDocs: { en: "API Docs", uz: "API hujjatlari", ru: "Документация API" },
  privacyPolicy: { en: "Privacy Policy", uz: "Maxfiylik siyosati", ru: "Политика конфиденциальности" },
  termsOfService: { en: "Terms of Service", uz: "Foydalanish shartlari", ru: "Условия использования" },
  allRightsReserved: {
    en: "All rights reserved. Made with ❤️ for your health.",
    uz: "Barcha huquqlar himoyalangan. Sizning sog'ligingiz uchun ❤️ bilan yaratilgan.",
    ru: "Все права защищены. Создано с ❤️ для вашего здоровья.",
  },

  // Auth
  email: { en: "Email", uz: "Email", ru: "Электронная почта" },
  password: { en: "Password", uz: "Parol", ru: "Пароль" },
  fullName: { en: "Full Name", uz: "To'liq ism", ru: "Полное имя" },
  loginWithGoogle: { en: "Login with Google", uz: "Google orqali kirish", ru: "Войти через Google" },
  signupWithGoogle: {
    en: "Sign up with Google",
    uz: "Google orqali ro'yxatdan o'tish",
    ru: "Регистрация через Google",
  },
  dontHaveAccount: { en: "Don't have an account?", uz: "Hisobingiz yo'qmi?", ru: "Нет аккаунта?" },
  alreadyHaveAccount: { en: "Already have an account?", uz: "Hisobingiz bormi?", ru: "Уже есть аккаунт?" },
  loginDesc: { en: "Enter your credentials to access your account", uz: "Hisobingizga kirish uchun ma'lumotlaringizni kiriting", ru: "Введите свои данные для входа в аккаунт" },
  emailPlaceholder: { en: "Enter your email", uz: "Emailingizni kiriting", ru: "Введите электронную почту" },
  passwordPlaceholder: { en: "Enter your password", uz: "Parolingizni kiriting", ru: "Введите пароль" },
  orContinueWith: { en: "Or continue with", uz: "Yoki davom eting", ru: "Или продолжить с" },

  // Dashboard
  welcome: { en: "Welcome", uz: "Xush kelibsiz", ru: "Добро пожаловать" },
  profile: { en: "Profile", uz: "Profil", ru: "Профиль" },
  healthGoals: { en: "Health Goals", uz: "Sog'liq maqsadlari", ru: "Цели здоровья" },
  recentActivities: { en: "Recent Activities", uz: "So'nggi faoliyatlar", ru: "Недавние активности" },
  nutritionalTips: { en: "Nutritional Tips", uz: "Ovqatlanish maslahatlari", ru: "Советы по питанию" },
  overview: { en: "Overview", uz: "Umumiy ko‘rinish", ru: "Обзор" },
  nutrition: { en: "Nutrition", uz: "Ovqatlanish", ru: "Питание" },
  todaysProgress: { en: "Today's Progress", uz: "Bugungi natija", ru: "Прогресс за сегодня" },
  export: { en: "Export", uz: "Yuklab olish", ru: "Экспорт" },
  calories: { en: "Calories", uz: "Kaloriya", ru: "Калории" },
  protein: { en: "Protein", uz: "Oqsil", ru: "Белки" },
  carbs: { en: "Carbs", uz: "Uglevod", ru: "Углеводы" },
  fat: { en: "Fat", uz: "Yog‘", ru: "Жиры" },
  water: { en: "Water", uz: "Suv", ru: "Вода" },
  bmi: { en: "BMI", uz: "BMI", ru: "ИМТ" },
  age: { en: "Age", uz: "Yosh", ru: "Возраст" },
  weight: { en: "Weight", uz: "Vazn", ru: "Вес" },
  target: { en: "Target", uz: "Maqsad", ru: "Цель" },
  healthScore: { en: "Health Score", uz: "Sog‘liq balli", ru: "Оценка здоровья" },
  overallScore: { en: "Overall Score", uz: "Umumiy ball", ru: "Общий балл" },
  todaysNutrition: { en: "Today's Nutrition", uz: "Bugungi ovqatlanish", ru: "Питание за сегодня" },
  logFood: { en: "Log Food", uz: "Ovqat kiritish", ru: "Добавить еду" },
  logYourFood: { en: "Log Your Food", uz: "Ovqatni kiritish", ru: "Добавить прием пищи" },
  describeFood: { en: "Describe what you ate and our AI will calculate the nutritional values", uz: "Nima yeganingizni yozing, sun'iy intellekt oziq-ovqat qiymatini hisoblab beradi", ru: "Опишите, что вы ели, и наш ИИ рассчитает питательную ценность" },
  caloriesConsumed: { en: "Calories consumed", uz: "Yeyilgan kaloriya", ru: "Потребленные калории" },
  nutritionTips: { en: "Nutrition Tips", uz: "Ovqatlanish bo‘yicha maslahatlar", ru: "Советы по питанию" },
  proteinPower: { en: "Protein Power", uz: "Oqsil kuchi", ru: "Сила белка" },
  proteinPowerTip: { en: "Add protein to every meal for better satiety and muscle maintenance.", uz: "Har bir ovqatga oqsil qo‘shing, bu to‘qlik va mushaklarni saqlashga yordam beradi.", ru: "Добавляйте белок в каждый прием пищи для лучшего насыщения и поддержания мышц." },
  hydrationFirst: { en: "Hydration First", uz: "Avval suv iching", ru: "Сначала вода" },
  hydrationFirstTip: { en: "Drink water before meals to improve digestion and control appetite.", uz: "Ovqatdan oldin suv iching, bu hazmni yaxshilaydi va ishtahani nazorat qiladi.", ru: "Пейте воду перед едой для улучшения пищеварения и контроля аппетита." },
  colorfulPlates: { en: "Colorful Plates", uz: "Rangli taomlar", ru: "Цветные блюда" },
  colorfulPlatesTip: { en: "Eat a variety of colorful vegetables for maximum nutrients.", uz: "Ko‘proq rangli sabzavotlar iste'mol qiling, bu ko‘proq foydali modda beradi.", ru: "Ешьте больше разноцветных овощей для максимальной пользы." },
  timingMatters: { en: "Timing Matters", uz: "Vaqt muhim", ru: "Время имеет значение" },
  timingMattersTip: { en: "Eat your largest meal when you're most active during the day.", uz: "Eng katta ovqatingizni eng faol vaqtingizda iste'mol qiling.", ru: "Самую большую еду ешьте в самый активный период дня." },
  profileInformation: { en: "Profile Information", uz: "Profil ma'lumotlari", ru: "Информация профиля" },
  name: { en: "Name", uz: "Ism", ru: "Имя" },
  height: { en: "Height", uz: "Bo‘yi", ru: "Рост" },
  sex: { en: "Sex", uz: "Jinsi", ru: "Пол" },
  activityLevel: { en: "Activity Level", uz: "Faollik darajasi", ru: "Уровень активности" },
  goals: { en: "Goals", uz: "Maqsadlar", ru: "Цели" },
  healthStatistics: { en: "Health Statistics", uz: "Sog‘liq statistikasi", ru: "Статистика здоровья" },
  dayStreak: { en: "Day Streak", uz: "Ketma-ket kunlar", ru: "Серия дней" },
  updateProfile: { en: "Update Profile", uz: "Profilni yangilash", ru: "Обновить профиль" },
  notifications: { en: "Notifications", uz: "Bildirishnomalar", ru: "Уведомления" },
  settings: { en: "Settings", uz: "Sozlamalar", ru: "Настройки" },
  share: { en: "Share", uz: "Ulashish", ru: "Поделиться" },
  loadingHealthData: { en: "Loading your health data...", uz: "Sog‘liq ma'lumotlaringiz yuklanmoqda...", ru: "Загрузка данных о здоровье..." },
  errorLoadingData: { en: "Error loading data", uz: "Ma'lumotlarni yuklashda xatolik", ru: "Ошибка загрузки данных" },
  notAvailable: { en: "N/A", uz: "Mavjud emas", ru: "Нет данных" },
  streakDays: { en: "Day streak", uz: "Kunlik seriya", ru: "Дней подряд" },

  // Forms
  allergies: { en: "Allergies", uz: "Allergiyalar", ru: "Аллергии" },
  foodIntake: { en: "Food Intake", uz: "Ovqat iste'moli", ru: "Потребление пищи" },
  activities: { en: "Activities", uz: "Faoliyatlar", ru: "Активности" },
  goals: { en: "Goals", uz: "Maqsadlar", ru: "Цели" },
  save: { en: "Save", uz: "Saqlash", ru: "Сохранить" },
  cancel: { en: "Cancel", uz: "Bekor qilish", ru: "Отмена" },

  // Common
  loading: { en: "Loading...", uz: "Yuklanmoqda...", ru: "Загрузка..." },
  error: { en: "Error", uz: "Xato", ru: "Ошибка" },
  success: { en: "Success", uz: "Muvaffaqiyat", ru: "Успех" },
  language: { en: "en", uz: "uz", ru: "ru" },
  successStorySaidkamolName: {
    en: "Saidkamol Jo'raqulov",
    uz: "Jo'raqulov Saidkamol",
    ru: "Сайдкамол Джуракулов",
  },
  successStorySaidkamolAge: {
    en: "22 years old, Tashkent, Uzbekistan",
    uz: "22 yosh, Toshkent, O‘zbekiston",
    ru: "22 года, Ташкент, Узбекистан",
  },
  successStorySaidkamolAchievement: {
    en: "Muscle mass increased",
    uz: "Muskul massasi oshdi",
    ru: "Увеличена мышечная масса",
  },
  successStorySaidkamolStory: {
    en: "With HealthPilot, I went from 58kg to 64kg and significantly increased my muscle mass. The AI recommendations and monitoring were very helpful.",
    uz: "HealthPilot yordamida 58 kilogrammdan 64 kilogrammgacha yetdim va mushak massam ancha oshdi. Platformadagi AI tavsiyalari va monitoring juda foydali bo‘ldi.",
    ru: "С помощью HealthPilot я увеличил вес с 58 до 64 кг и значительно нарастил мышечную массу. Рекомендации и мониторинг ИИ были очень полезны.",
  },
  successStorySaidkamolBefore: {
    en: "58 kg, low muscle mass",
    uz: "58 kg, past mushak massasi",
    ru: "58 кг, низкая мышечная масса",
  },
  successStorySaidkamolAfter: {
    en: "64 kg, increased muscle mass",
    uz: "64 kg, mushak massasi oshgan",
    ru: "64 кг, увеличенная мышечная масса",
  },
  successStorySaidkamolWeight: {
    en: "+6kg",
    uz: "+6kg",
    ru: "+6кг",
  },
  successStorySaidkamolWeightLabel: {
    en: "Weight gained",
    uz: "Yo'qotilgan vazn",
    ru: "Набранный вес",
  },
  successStorySaidkamolMuscle: {
    en: "+10%",
    uz: "+10%",
    ru: "+10%",
  },
  successStorySaidkamolMuscleLabel: {
    en: "Muscle mass",
    uz: "Mushak massasi",
    ru: "Мышечная масса",
  },
  successStorySaidkamolEnergy: {
    en: "+80%",
    uz: "+80%",
    ru: "+80%",
  },
  successStorySaidkamolEnergyLabel: {
    en: "Energy level",
    uz: "Energiya darajasi",
    ru: "Уровень энергии",
  },

  // Profile Update
  completeProfile: { en: "Complete Your Profile", uz: "Profilingizni to'liq to'ldiring", ru: "Заполните профиль" },
  basicInformation: { en: "Basic Information", uz: "Asosiy ma'lumotlar", ru: "Основная информация" },
  healthInformation: { en: "Health Information", uz: "Sog'liq ma'lumotlari", ru: "Информация о здоровье" },
  newPassword: { en: "New Password (optional)", uz: "Yangi parol (ixtiyoriy)", ru: "Новый пароль (необязательно)" },
  yourName: { en: "Your name", uz: "Sizning ismingiz", ru: "Ваше имя" },
  yourAge: { en: "Your age", uz: "Sizning yoshingiz", ru: "Ваш возраст" },
  leaveEmptyToKeepCurrent: { en: "Leave empty to keep current password", uz: "Joriy parolni saqlash uchun bo'sh qoldiring", ru: "Оставьте пустым, чтобы сохранить текущий пароль" },
  weightInKg: { en: "Weight in kg", uz: "Vazn kg da", ru: "Вес в кг" },
  heightInCm: { en: "Height in cm", uz: "Bo'y sm da", ru: "Рост в см" },
  selectSex: { en: "Select sex", uz: "Jinsni tanlang", ru: "Выберите пол" },
  male: { en: "Male", uz: "Erkak", ru: "Мужской" },
  female: { en: "Female", uz: "Ayol", ru: "Женский" },
  other: { en: "Other", uz: "Boshqa", ru: "Другой" },
  selectActivityLevel: { en: "Select activity level", uz: "Faollik darajasini tanlang", ru: "Выберите уровень активности" },
  noActivity: { en: "No Activity", uz: "Faoliyat yo'q", ru: "Нет активности" },
  lightActivity: { en: "Light Activity", uz: "Yengil faoliyat", ru: "Легкая активность" },
  moderateActivity: { en: "Moderate Activity", uz: "O'rtacha faoliyat", ru: "Умеренная активность" },
  highActivity: { en: "High Activity", uz: "Yuqori faoliyat", ru: "Высокая активность" },
  athlete: { en: "Athlete", uz: "Sportchi", ru: "Спортсмен" },
  selectYourGoal: { en: "Select your goal", uz: "Maqsadingizni tanlang", ru: "Выберите цель" },
  weightLoss: { en: "Weight Loss", uz: "Vazn tashlash", ru: "Потеря веса" },
  muscleGain: { en: "Muscle Gain", uz: "Mushak oshirish", ru: "Наращивание мышц" },
  healthImprovement: { en: "Health Improvement", uz: "Sog'liqni yaxshilash", ru: "Улучшение здоровья" },
  maintenance: { en: "Maintenance", uz: "Saqlash", ru: "Поддержание" },
  iHaveAllergies: { en: "I have allergies", uz: "Menda allergiya bor", ru: "У меня аллергия" },
  updating: { en: "Updating...", uz: "Yangilanmoqda...", ru: "Обновление..." },
  updateProfile: { en: "Update Profile", uz: "Profilni yangilash", ru: "Обновить профиль" },
  profileUpdatedSuccessfully: { en: "Profile updated successfully! Your daily targets have been recalculated.", uz: "Profil muvaffaqiyatli yangilandi! Kunlik maqsadlaringiz qayta hisoblandi.", ru: "Профиль успешно обновлен! Ваши ежедневные цели пересчитаны." },
    failedToUpdateProfile: { en: "Failed to update profile", uz: "Profilni yangilashda xatolik", ru: "Не удалось обновить профиль" },
  healthInformation: { en: "Health Information", uz: "Sog'liq ma'lumotlari", ru: "Информация о здоровье" },
  newPasswordOptional: { en: "New Password (optional)", uz: "Yangi parol (ixtiyoriy)", ru: "Новый пароль (необязательно)" },
  leaveEmptyToKeepPassword: { en: "Leave empty to keep current password", uz: "Joriy parolni saqlash uchun bo'sh qoldiring", ru: "Оставьте пустым, чтобы сохранить текущий пароль" },
  male: { en: "Male", uz: "Erkak", ru: "Мужчина" },
  female: { en: "Female", uz: "Ayol", ru: "Женщина" },
  other: { en: "Other", uz: "Boshqa", ru: "Другое" },
  iHaveAllergies: { en: "I have allergies", uz: "Menda allergiya bor", ru: "У меня есть аллергия" },
  updating: { en: "Updating...", uz: "Yangilanmoqda...", ru: "Обновление..." },
  goodMorning: { en: "Good morning", uz: "Xayrli tong", ru: "Доброе утро" },
  goodAfternoon: { en: "Good afternoon", uz: "Xayrli kun", ru: "Добрый день" },
  goodEvening: { en: "Good evening", uz: "Xayrli kech", ru: "Добрый вечер" },
  aiPoweredHealthPlatform: { en: "AI-Powered Health Platform", uz: "AI yordamli sog'liq platformasi", ru: "Платформа здоровья на базе ИИ" },
  powerfulFeaturesBadge: { en: "Powerful Features", uz: "Kuchli imkoniyatlar", ru: "Мощные возможности" },
  simpleProcessBadge: { en: "Simple Process", uz: "Oddiy jarayon", ru: "Простой процесс" },
  userReviewsBadge: { en: "User Reviews", uz: "Foydalanuvchi sharhlari", ru: "Отзывы пользователей" },
  productShowcaseBadge: { en: "Product Showcase", uz: "Mahsulot ko'rgazmasi", ru: "Демонстрация продукта" },
  healthBenefitsBadge: { en: "Health Benefits", uz: "Sog'liq foydalari", ru: "Польза для здоровья" },
  aiTechnologyBadge: { en: "AI Technology", uz: "AI texnologiyasi", ru: "ИИ технология" },
  successStoriesBadge: { en: "Success Stories", uz: "Muvaffaqiyat hikoyalari", ru: "Истории успеха" },
  whyChooseYoginBadge: { en: "Why Choose Yogin", uz: "Nima uchun Yoginni tanlash kerak", ru: "Почему выбрать Yogin" },
  joinHealthRevolutionBadge: { en: "Join the Health Revolution", uz: "Sog'liq inqilobiga qo'shiling", ru: "Присоединяйтесь к революции здоровья" },
  itsFree: { en: "It's Free", uz: "Bu bepul", ru: "Это бесплатно" },
  testimonial1Name: { en: "Sarah Johnson", uz: "Sarah Johnson", ru: "Сара Джонсон" },
  testimonial1Role: { en: "Fitness Enthusiast", uz: "Fitness ishqibozi", ru: "Любитель фитнеса" },
  testimonial1Content: { en: "HealthPilot made tracking so easy! Highly recommend.", uz: "HealthPilot kuzatishni juda oson qildi! Tavsiya qilaman.", ru: "HealthPilot сделал отслеживание очень простым! Рекомендую." },
  testimonial4Name: { en: "Alex Thompson", uz: "Alex Thompson", ru: "Алекс Томпсон" },
  testimonial4Role: { en: "Personal Trainer", uz: "Shaxsiy murabbiy", ru: "Персональный тренер" },
  testimonial4Content: { en: "AI insights transformed my coaching approach. Amazing results!", uz: "AI tavsiyalari murabbiylik usulimni o'zgartirdi. Ajoyib natijalar!", ru: "ИИ-аналитика изменила мой подход к тренировкам. Потрясающие результаты!" },

  testimonial3Name: { en: "Maria Petrova", uz: "Maria Petrova", ru: "Мария Петрова" },
  testimonial3Role: { en: "Nutritionist", uz: "Dietolog", ru: "Диетолог" },
  testimonial3Content: { en: "Personalized dashboard is a game changer!", uz: "Shaxsiy panel juda foydali!", ru: "Персонализированная панель — это прорыв!" },
  // Dashboard, Signup, va boshqa sahifalar uchun yo'qolgan kalitlar
  todaysMeals: { en: "Today's Meals", uz: "Bugungi ovqatlar", ru: "Приемы пищи за сегодня" },
  signupDesc: { en: "Create your account to get started.", uz: "Boshlash uchun hisob yarating.", ru: "Создайте аккаунт, чтобы начать." },
  aiAnalyzingTitle: { en: "AI is analyzing...", uz: "AI analiz qilmoqda...", ru: "ИИ анализирует..." },
  aiAnalyzingDesc: { en: "AI is calculating based on your data, please wait...", uz: "Ma'lumotlaringiz asosida AI hisob-kitob qilmoqda, kutib turing...", ru: "ИИ рассчитывает на основе ваших данных, пожалуйста, подождите..." },
  signupFailed: { en: "Signup failed", uz: "Ro'yxatdan o'tishda xatolik yuz berdi", ru: "Ошибка при регистрации" },
  noMealsLogged: { en: "No meals logged today", uz: "Bugun ovqatlar kiritilmagan", ru: "Сегодня приемы пищи не добавлены" },
  featuresSectionTitle: { en: "Everything you need for better health", uz: "Yaxshi sog'liq uchun kerak bo'lgan hamma narsa", ru: "Все необходимое для лучшего здоровья" },
  featuresSectionSubtitle: { en: "Comprehensive health tracking and management tools powered by artificial intelligence", uz: "Sun'iy intellekt bilan ta'minlangan keng qamrovli sog'liqni kuzatish va boshqarish vositalari", ru: "Комплексные инструменты отслеживания и управления здоровьем на базе искусственного интеллекта" },
  howYoginWorksTitle: { en: "How Yogin Works", uz: "Yogin qanday ishlaydi", ru: "Как работает Yogin" },
  howYoginWorksSubtitle: { en: "Get started with your health journey in just 4 simple steps", uz: "Sog'liq sayohatingizni atigi 4 ta oddiy qadamda boshlang", ru: "Начните свой путь к здоровью всего за 4 простых шага" },
  whatUsersSayTitle: { en: "What Our Users Say", uz: "Foydalanuvchilarimiz nima deydi", ru: "Что говорят наши пользователи" },
  whatUsersSaySubtitle: { en: "Join thousands of satisfied users who transformed their health with Yogin", uz: "Yogin bilan sog'ligini o'zgartirgan minglab mamnun foydalanuvchilarga qo'shiling", ru: "Присоединяйтесь к тысячам довольных пользователей, которые изменили свое здоровье с Yogin" },
  smartDashboardTitle: { en: "Smart Dashboard", uz: "Aqlli boshqaruv paneli", ru: "Умная панель управления" },
  smartDashboardDescription: { en: "Get a complete overview of your health metrics, progress, and goals all in one place.", uz: "Sog'liq ko'rsatkichlaringiz, rivojlanishingiz va maqsadlaringizning to'liq ko'rinishini bir joyda oling.", ru: "Получите полный обзор ваших показателей здоровья, прогресса и целей в одном месте." },
  aiFoodAnalysisTitle: { en: "AI Food Analysis", uz: "AI ovqat tahlili", ru: "ИИ анализ пищи" },
  aiFoodAnalysisDescription: { en: "Describe what you ate and our AI will calculate the nutritional values.", uz: "Nima yeganingizni yozing, sun'iy intellekt oziq-ovqat qiymatini hisoblab beradi.", ru: "Опишите, что вы ели, и наш ИИ рассчитает питательную ценность." },
  activityTrackingDescription: { en: "Monitor your physical activities, workouts, and daily movement.", uz: "Jismoniy faoliyatingiz, mashqlaringiz va kunlik harakatlaringizni kuzating.", ru: "Отслеживайте физическую активность, тренировки и ежедневные движения." },
  transformHealthJourneyTitle: { en: "Transform Your Health Journey", uz: "Sog'liq sayohatingizni o'zgartiring", ru: "Трансформируйте свой путь к здоровью" },
  transformHealthJourneySubtitle: { en: "Discover the amazing benefits our users experience with Yogin", uz: "Foydalanuvchilarimiz Yogin bilan boshdan kechirayotgan ajoyib foydalarga guvoh bo'ling", ru: "Откройте для себя удивительные преимущества, которые наши пользователи получают с Yogin" },
  nlpTitle: { en: "Natural Language Processing", uz: "Tabiiy tilni qayta ishlash", ru: "Обработка естественного языка" },
  nlpDescription: { en: "Describe your meals in plain language, and our AI understands and analyzes nutritional content automatically.", uz: "Ovqatlaringizni oddiy tilda tasvirlab bering, bizning AI avtomatik ravishda ozuqaviy tarkibni tushunadi va tahlil qiladi.", ru: "Описывайте свои блюда простым языком, и наш ИИ автоматически понимает и анализирует питательный состав." },
  input: { en: "Input", uz: "Kiritish", ru: "Ввод" },
  aiOutput: { en: "AI Output", uz: "AI natijasi", ru: "Результат ИИ" },
  aiExampleInput: { 
    en: "\"Grilled salmon with quinoa\"", 
    uz: "\"Qovurilgan losos va kinoa\"", 
    ru: "\"Жареный лосось с киноа\"" 
  },
  aiExampleOutput: { 
    en: "✓ 380 cal, 35g protein, 25g carbs", 
    uz: "✓ 380 kal, 35g oqsil, 25g uglevod", 
    ru: "✓ 380 ккал, 35г белка, 25г углеводов" 
  },
  personalizedRecsTitle: { en: "Personalized Recommendations", uz: "Shaxsiy tavsiyalar", ru: "Персонализированные рекомендации" },
  personalizedRecsDescription: { en: "AI analyzes your health data, preferences, and goals to provide tailored nutrition and fitness advice.", uz: "AI sizning sog'liq ma'lumotlaringiz, afzalliklaringiz va maqsadlaringizni tahlil qilib, moslashtirilgan ovqatlanish va fitness maslahatlarini beradi.", ru: "ИИ анализирует ваши данные о здоровье, предпочтения и цели, чтобы предоставить индивидуальные советы по питанию и фитнесу." },
  proteinTip: { en: "Add protein to every meal for better satiety and muscle maintenance.", uz: "Har bir ovqatga oqsil qo‘shing, bu to‘qlik va mushaklarni saqlashga yordam beradi.", ru: "Добавляйте белок в каждый прием пищи для лучшего насыщения и поддержания мышц." },
  cardioGoal: { en: "Aim for at least 150 minutes of moderate cardio per week.", uz: "Haftasiga kamida 150 daqiqa o'rtacha kardio maqsad qiling.", ru: "Ставьте цель не менее 150 минут умеренного кардио в неделю." },
  predictiveAnalyticsTitle: { en: "Predictive Analytics", uz: "Bashoratli tahlil", ru: "Предиктивная аналитика" },
  predictiveAnalyticsDescription: { en: "Our AI predicts health trends and suggests preventive measures based on your data patterns.", uz: "Bizning AI sog'liq tendentsiyalarini bashorat qiladi va ma'lumotlar naqshlaringiz asosida profilaktik choralarni taklif qiladi.", ru: "Наш ИИ предсказывает тенденции здоровья и предлагает профилактические меры на основе ваших данных." },
  prediction: { en: "Prediction", uz: "Bashorat", ru: "Прогноз" },
  weightGoalPrediction: { en: "You are on track to reach your weight goal in 2 months!", uz: "Siz 2 oy ichida vazn maqsadingizga erishishingiz mumkin!", ru: "Вы на пути к достижению цели по весу за 2 месяца!" },
  before: { en: "Before", uz: "Oldin", ru: "До" },
  after: { en: "After", uz: "Keyin", ru: "После" },
  viewMoreSuccessStories: { en: "View More Success Stories", uz: "Ko'proq muvaffaqiyat hikoyalarini ko'rish", ru: "Посмотреть больше историй успеха" },
  yoginVsTraditionalTitle: { en: "Yogin vs Traditional Methods", uz: "Yogin va an'anaviy usullar", ru: "Yogin против традиционных методов" },
  yoginVsTraditionalSubtitle: { en: "See how Yogin revolutionizes health tracking compared to traditional approaches", uz: "Yogin an'anaviy yondashuvlar bilan solishtirganda sog'liqni kuzatishni qanday inqilob qilishini ko'ring", ru: "Посмотрите, как Yogin революционизирует отслеживание здоровья по сравнению с традиционными подходами" },
  manualCalorieCounting: { en: "Manual calorie counting", uz: "Qo'lda kaloriya hisoblash", ru: "Ручной подсчет калорий" },
  genericDietPlans: { en: "Generic diet plans", uz: "Umumiy dietalar", ru: "Общие диеты" },
  noPersonalization: { en: "No personalization", uz: "Shaxsiylashtirish yo'q", ru: "Нет персонализации" },
  timeConsumingTracking: { en: "Time-consuming tracking", uz: "Ko'p vaqt oladigan kuzatuv", ru: "Отслеживание, занимающее много времени" },
  limitedInsights: { en: "Limited insights", uz: "Cheklangan tahlillar", ru: "Ограниченные аналитические данные" },
  noAiAssistance: { en: "No AI assistance", uz: "AI yordam yo'q", ru: "Нет помощи ИИ" },
  aiPoweredFoodAnalysis: { en: "AI-powered food analysis", uz: "AI yordamli ovqat tahlili", ru: "Анализ пищи на базе ИИ" },
  personalizedRecommendations: { en: "Personalized recommendations", uz: "Shaxsiy tavsiyalar", ru: "Персонализированные рекомендации" },
  smartGoalSetting: { en: "Smart goal setting", uz: "Aqlli maqsad qo'yish", ru: "Умная постановка целей" },
  effortlessTracking: { en: "Effortless tracking", uz: "Oson kuzatuv", ru: "Легкое отслеживание" },
  deepHealthInsights: { en: "Deep health insights", uz: "Chuquroq sog'liq tahlillari", ru: "Глубокий анализ здоровья" },
  aiAssistance: { en: "AI assistance", uz: "AI yordam", ru: "Помощь ИИ" },
  resultsComparison: { en: "Results Comparison", uz: "Natijalar taqqoslash", ru: "Сравнение результатов" },
  goalAchievementRate: { en: "Goal Achievement Rate", uz: "Maqsadga erishish darajasi", ru: "Уровень достижения целей" },
  traditional: { en: "Traditional", uz: "An'anaviy", ru: "Традиционный" },
  withYogin: { en: "With Yogin", uz: "Yogin bilan", ru: "С Yogin" },
  joinHealthRevolutionBadge: { en: "Join the Health Revolution", uz: "Sog'liq inqilobiga qo'shiling", ru: "Присоединяйтесь к революции здоровья" },
  transformHealthTitle: { en: "Ready to Transform Your Health?", uz: "Sog'ligingizni o'zgartirishga tayyormisiz?", ru: "Готовы трансформировать свое здоровье?" },
  transformHealthSubtitle: { en: "Join over 50,000 users who are already improving their health with Yogin's AI-powered platform", uz: "Yoginning AI bilan ta'minlangan platformasi bilan sog'ligini yaxshilayotgan 50,000 dan ortiq foydalanuvchilarga qo'shiling", ru: "Присоединяйтесь к более чем 50,000 пользователей, которые уже улучшают свое здоровье с помощью платформы Yogin на базе ИИ" },
  itsFree: { en: "It's Free", uz: "Bu bepul", ru: "Это бесплатно" },
  aiSupport247: { en: "24/7 AI Support", uz: "24/7 AI yordam", ru: "24/7 поддержка ИИ" },
  certifiedByExperts: { en: "Certified by health experts", uz: "Sog'liq mutaxassislari tomonidan sertifikatlangan", ru: "Сертифицировано экспертами по здоровью" },

  // Profile Update
  completeProfile: { en: "Complete Your Profile", uz: "Profilingizni to'liq to'ldiring", ru: "Заполните профиль" },
  healthInformation: { en: "Health Information", uz: "Sog'liq ma'lumotlari", ru: "Информация о здоровье" },
  newPassword: { en: "New Password (optional)", uz: "Yangi parol (ixtiyoriy)", ru: "Новый пароль (необязательно)" },
  yourName: { en: "Your name", uz: "Sizning ismingiz", ru: "Ваше имя" },
  yourAge: { en: "Your age", uz: "Sizning yoshingiz", ru: "Ваш возраст" },
  leaveEmptyToKeepCurrent: { en: "Leave empty to keep current password", uz: "Joriy parolni saqlash uchun bo'sh qoldiring", ru: "Оставьте пустым, чтобы сохранить текущий пароль" },
  weightInKg: { en: "Weight in kg", uz: "Vazn kg da", ru: "Вес в кг" },
  heightInCm: { en: "Height in cm", uz: "Bo'y sm da", ru: "Рост в см" },
  selectSex: { en: "Select sex", uz: "Jinsni tanlang", ru: "Выберите пол" },
  male: { en: "Male", uz: "Erkak", ru: "Мужской" },
  female: { en: "Female", uz: "Ayol", ru: "Женский" },
  other: { en: "Other", uz: "Boshqa", ru: "Другой" },
  selectActivityLevel: { en: "Select activity level", uz: "Faollik darajasini tanlang", ru: "Выберите уровень активности" },
  noActivity: { en: "No Activity", uz: "Faoliyat yo'q", ru: "Нет активности" },
  lightActivity: { en: "Light Activity", uz: "Yengil faoliyat", ru: "Легкая активность" },
  moderateActivity: { en: "Moderate Activity", uz: "O'rtacha faoliyat", ru: "Умеренная активность" },
  highActivity: { en: "High Activity", uz: "Yuqori faoliyat", ru: "Высокая активность" },
  athlete: { en: "Athlete", uz: "Sportchi", ru: "Спортсмен" },
  selectYourGoal: { en: "Select your goal", uz: "Maqsadingizni tanlang", ru: "Выберите цель" },
  weightLoss: { en: "Weight Loss", uz: "Vazn tashlash", ru: "Потеря веса" },
  muscleGain: { en: "Muscle Gain", uz: "Mushak oshirish", ru: "Наращивание мышц" },
  healthImprovement: { en: "Health Improvement", uz: "Sog'liqni yaxshilash", ru: "Улучшение здоровья" },
  maintenance: { en: "Maintenance", uz: "Saqlash", ru: "Поддержание" },
  iHaveAllergies: { en: "I have allergies", uz: "Menda allergiya bor", ru: "У меня аллергия" },
  updating: { en: "Updating...", uz: "Yangilanmoqda...", ru: "Обновление..." },
  updateProfile: { en: "Update Profile", uz: "Profilni yangilash", ru: "Обновить профиль" },
  profileUpdatedSuccessfully: { en: "Profile updated successfully! Your daily targets have been recalculated.", uz: "Profil muvaffaqiyatli yangilandi! Kunlik maqsadlaringiz qayta hisoblandi.", ru: "Профиль успешно обновлен! Ваши ежедневные цели пересчитаны." },
  failedToUpdateProfile: { en: "Failed to update profile", uz: "Profilni yangilashda xatolik", ru: "Не удалось обновить профиль" },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("uz")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
