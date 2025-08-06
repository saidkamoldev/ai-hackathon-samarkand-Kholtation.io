"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

interface User {
  ID: number // Backenddan kelgan ID (katta harf)
  name: string
  email: string
  avatar?: string
  age?: number
  health?: {
    weight?: number
    height?: number
    sex?: string
    activate?: {
      activate_type?: string
    }
    allergy?: {
      allergy?: boolean
      allergy_type?: string[]
    }
  }
  goals?: {
    goals_type?: string
  }
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  signup: (
    name: string,
    email: string,
    password: string,
    age: number,
    height: number,
    weight: number,
    sex: string,
    activate_type: string,
    goals_type: string
  ) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Login response:", data) // Debug uchun
        
        // Backenddan kelgan user ma'lumotini to'g'ridan-to'g'ri ishlatish
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
      } else {
        const err = await response.json()
        throw new Error(err.error || "Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Google login response:", data) // Debug uchun
        
        // Backenddan kelgan user ma'lumotini to'g'ridan-to'g'ri ishlatish
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
      } else {
        const err = await response.json()
        throw new Error(err.error || "Google login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    age: number,
    height: number,
    weight: number,
    sex: string,
    activate_type: string,
    goals_type: string
  ) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          age,
          height,
          weight,
          sex,
          activate_type,
          goals_type,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Signup response:", data) // Debug uchun
        // Backenddan kelgan user ma'lumotini to'g'ridan-to'g'ri ishlatish
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))
      } else {
        const err = await response.json()
        throw new Error(err.error || "Signup failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithGoogle, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
