"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import type { UserRole } from "@/context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${pathname}`)
      } else if (user && !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user.role === "verifier") {
          router.push("/verifier/dashboard")
        } else {
          router.push("/dashboard")
        }
      }
    }
  }, [isAuthenticated, isLoading, router, user, allowedRoles, pathname])

  // Show loading state
  if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return <>{children}</>
}

