"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect based on user role
        if (user?.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user?.role === "verifier") {
          router.push("/verifier/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  )
}

