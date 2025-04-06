"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

// Define user roles
export type UserRole = "user" | "admin" | "verifier"

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/api/users/profile')
          setUser(response.data.user)
        } catch (error) {
          localStorage.removeItem("token")
          delete api.defaults.headers.common['Authorization']
        }
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      // Store token and set default header
      localStorage.setItem("token", token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "verifier") {
        router.push("/verifier/dashboard")
      } else {
        router.push("/dashboard")
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred during login",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await api.post('/api/auth/register', { 
        name, 
        email, 
        password,
        role: "user" // Default role for registration
      })

      toast({
        title: "Registration successful",
        description: "Your account has been created. Please login.",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred during registration",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    router.push("/login")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

