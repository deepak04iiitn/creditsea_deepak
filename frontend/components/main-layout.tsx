"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Home, Users, CreditCard, DollarSign, Settings, LogOut, Bell, MessageSquare, ChevronDown, Menu } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function MainLayout({ children, title = "Dashboard" }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? "bg-green-800 text-white" : ""
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block w-64 bg-green-900 text-white`}>
        <div className="p-4 border-b border-green-800">
          <h1 className="text-xl font-bold">CREDIT APP</h1>
        </div>
        <div className="p-4 flex items-center space-x-3 border-b border-green-800">
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
            <span className="text-sm">{user?.name?.charAt(0)}</span>
          </div>
          <span>{user?.name}</span>
        </div>
        <nav className="p-2">
          {user?.role === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/admin/dashboard")}`}
              >
                <Home className="mr-2 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/borrowers"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/admin/borrowers")}`}
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Borrowers</span>
              </Link>
              <Link href="/admin/loans" className={`flex items-center p-2 rounded mb-1 ${isActive("/admin/loans")}`}>
                <CreditCard className="mr-2 h-5 w-5" />
                <span>Loans</span>
              </Link>
              <Link
                href="/admin/repayments"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/admin/repayments")}`}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                <span>Repayments</span>
              </Link>
              <Link
                href="/admin/manage-users"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/admin/manage-users")}`}
              >
                <Settings className="mr-2 h-5 w-5" />
                <span>Manage Users</span>
              </Link>
            </>
          )}

          {user?.role === "verifier" && (
            <>
              <Link
                href="/verifier/dashboard"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/verifier/dashboard")}`}
              >
                <Home className="mr-2 h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/verifier/borrowers"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/verifier/borrowers")}`}
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Borrowers</span>
              </Link>
              <Link
                href="/verifier/loans"
                className={`flex items-center p-2 rounded mb-1 ${isActive("/verifier/loans")}`}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                <span>Loans</span>
              </Link>
            </>
          )}

          {user?.role === "user" && (
            <>
              <Link href="/dashboard" className={`flex items-center p-2 rounded mb-1 ${isActive("/dashboard")}`}>
                <Home className="mr-2 h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link href="/payments" className={`flex items-center p-2 rounded mb-1 ${isActive("/payments")}`}>
                <DollarSign className="mr-2 h-5 w-5" />
                <span>Payments</span>
              </Link>
              <Link href="/budget" className={`flex items-center p-2 rounded mb-1 ${isActive("/budget")}`}>
                <CreditCard className="mr-2 h-5 w-5" />
                <span>Budget</span>
              </Link>
            </>
          )}

          <button onClick={logout} className="flex items-center p-2 rounded mb-1 w-full text-left">
            <LogOut className="mr-2 h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <div className="text-xl font-semibold">{title}</div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-1">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-1">
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span>{user?.role.toUpperCase()}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}

