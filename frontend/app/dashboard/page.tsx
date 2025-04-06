"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CreditCard } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import api from "@/utils/api"

interface LoanUser {
  id: string
  name: string
}

interface Loan {
  _id: string
  user: LoanUser | string
  amount: number
  applicationDate: string
  status: "pending" | "verified" | "rejected" | "approved" | "disbursed"
}

export default function UserDashboard() {
  const [balance, setBalance] = useState(0)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch user loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await api.get('/api/loans')
        setLoans(response.data.loans)
        
        // Calculate balance based on disbursed loans
        const disbursedAmount = response.data.loans
          .filter((loan: Loan) => loan.status === "disbursed")
          .reduce((total: number, loan: Loan) => total + loan.amount, 0)
          
        setBalance(disbursedAmount)
        setLoading(false)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load loans")
        setLoading(false)
      }
    }
    
    fetchLoans()
  }, [])

  // Filter loans based on search term
  const filteredLoans = loans.filter(loan => 
    loan.status.includes(searchTerm.toLowerCase()) ||
    loan.amount.toString().includes(searchTerm)
  )

  const getStatusBadgeClass = (status: Loan["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verified":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "disbursed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MainLayout title="Dashboard - Loans">
        <div className="bg-white p-4 mb-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-gray-600 text-sm">BALANCE</p>
                <p className="text-xl font-bold">{balance.toLocaleString()}</p>
              </div>
            </div>
            <Link href="/apply-loan">
              <Button variant="secondary">Get a Loan</Button>
            </Link>
          </div>

          <div className="flex border-t">
            <button className="flex-1 py-2 border-b-2 border-green-600 font-medium">Borrow Cash</button>
            <button className="flex-1 py-2 text-gray-500">Transact</button>
            <button className="flex-1 py-2 text-gray-500">Deposit Cash</button>
          </div>
        </div>

        <div className="mb-4">
          <Input 
            type="search" 
            placeholder="Search for loans" 
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Applied Loans</h2>
            <div className="flex space-x-2">
              <button className="p-1 rounded border">
                <span className="material-icons text-sm">sort</span>
              </button>
              <button className="p-1 rounded border">
                <span className="material-icons text-sm">filter_list</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-4">No loans found. Apply for a loan to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Loan Officer</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Date Applied</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan._id} className="border-b">
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                          <span className="text-sm">JO</span>
                        </div>
                        <div>
                          <p>John Okeh</p>
                          <p className="text-xs text-gray-500">Loan Officer</p>
                        </div>
                      </td>
                      <td className="py-3">{loan.amount.toLocaleString()}</td>
                      <td className="py-3">{new Date(loan.applicationDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={getStatusBadgeClass(loan.status)}>
                          {loan.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-gray-400">
                          <span className="material-icons">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="flex justify-between items-center mt-4">
                <div>Items per page: 5</div>
                <div className="flex items-center">
                  <span>1-{Math.min(5, filteredLoans.length)} of {filteredLoans.length}</span>
                  <button className="ml-2 p-1 rounded border">
                    <span className="material-icons">chevron_left</span>
                  </button>
                  <button className="p-1 rounded border">
                    <span className="material-icons">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

