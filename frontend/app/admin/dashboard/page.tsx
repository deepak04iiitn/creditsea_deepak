"use client"

import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Users, Building, BarChart } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import StatsCard from "@/components/dashboard/stats-card"
import ChartCard from "@/components/dashboard/chart-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/utils/api"

interface DashboardStats {
  activeUsers: number
  borrowers: number
  cashDisbursed: number
  cashReceived: number
  totalSavings: number
  repaidLoans: number
  otherAccounts: number
  totalLoans: number
}

interface RecoveryRates {
  defaultLoans: number
  openLoans: number
}

interface User {
  id: string
  name: string
}

interface Loan {
  _id: string
  user: User
  amount: number
  applicationDate: string
  status: string
  reason?: string
}

interface ChartPoint {
  name: string
  value: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recoveryRates, setRecoveryRates] = useState<RecoveryRates | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const [chartData, setChartData] = useState<{
    loansReleasedMonthly: ChartPoint[];
    outstandingLoansMonthly: ChartPoint[];
    repaymentsCollectedMonthly: ChartPoint[];
  }>({
    loansReleasedMonthly: [],
    outstandingLoansMonthly: [],
    repaymentsCollectedMonthly: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/admin/dashboard')
        
        setStats(response.data.stats)
        setRecoveryRates(response.data.recoveryRates)
        setLoans(response.data.recentLoans)
        
        // Format chart data for the UI
        const formatChartData = (chartArray: any[]): ChartPoint[] => {
          return chartArray.map(item => ({
            name: item._id.toString(),
            value: item.count
          }))
        }
        
        setChartData({
          loansReleasedMonthly: formatChartData(response.data.charts.loansReleasedMonthly),
          outstandingLoansMonthly: formatChartData(response.data.charts.outstandingLoansMonthly),
          repaymentsCollectedMonthly: formatChartData(response.data.charts.repaymentsCollectedMonthly)
        })
        
        setLoading(false)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data")
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  const handleStatusChange = async (loanId: string, newStatus: string) => {
    try {
      // This would be implemented to update loan status
      console.log(`Updating loan ${loanId} to ${newStatus}`)
    } catch (error) {
      console.error("Error updating loan status:", error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout title="Dashboard">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading dashboard data...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout title="Dashboard">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout title="Dashboard">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={<Users className="h-6 w-6 text-white" />}
              value={stats?.activeUsers || 0}
              label="Active Users"
              className="bg-white"
            />

            <StatsCard
              icon={<Users className="h-6 w-6 text-white" />}
              value={stats?.borrowers || 0}
              label="Borrowers"
              className="bg-white"
            />

            <StatsCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              value={(stats?.cashDisbursed || 0).toLocaleString()}
              label="Cash Disbursed"
              className="bg-white"
            />

            <StatsCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              value={(stats?.cashReceived || 0).toLocaleString()}
              label="Cash Received"
              className="bg-white"
            />

            <StatsCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              value={(stats?.totalSavings || 0).toLocaleString()}
              label="Savings"
              className="bg-white"
            />

            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats?.repaidLoans || 0}
              label="Repaid Loans"
              className="bg-white"
            />

            <StatsCard
              icon={<Building className="h-6 w-6 text-white" />}
              value={stats?.otherAccounts || 0}
              label="Other Accounts"
              className="bg-white"
            />

            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats?.totalLoans || 0}
              label="Loans"
              className="bg-white"
            />
          </div>

          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Recent Loans</h3>
              <div className="flex space-x-2">
                <button className="text-gray-500 px-2">
                  <span className="material-icons text-sm">sort</span>
                </button>
                <button className="text-gray-500 px-2">
                  <span className="material-icons text-sm">filter_list</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">User details</th>
                    <th className="pb-2">Customer name</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map((loan) => (
                    <tr key={loan._id} className="border-b">
                      <td className="py-3 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                          <span className="text-sm">{loan.user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p>{loan.reason || "Loan Application"}</p>
                          <p className="text-xs text-gray-500">{new Date(loan.applicationDate).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-3">{loan.user.name}</td>
                      <td className="py-3">{new Date(loan.applicationDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${loan.status === 'verified' ? 'bg-green-100 text-green-800' : loan.status === 'approved' ? 'bg-blue-100 text-blue-800' : loan.status === 'rejected' ? 'bg-red-100 text-red-800' : loan.status === 'disbursed' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {loan.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <ChartCard 
              title="Loans Released Monthly" 
              data={chartData.loansReleasedMonthly} 
              type="area" 
              color="#84cc16" 
            />

            <ChartCard
              title="Total Outstanding Open Loans - Monthly"
              data={chartData.outstandingLoansMonthly}
              type="bar"
              color="#3b82f6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="bg-amber-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">
                    Rate of Recovery (Open, Fully Paid, Default Loans)
                  </CardTitle>
                  <p className="text-sm text-gray-600">Percentage of the total amount that is paid for all loans</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart className="h-10 w-10 mr-4 text-amber-600" />
                    <span className="text-3xl font-bold text-amber-600">{recoveryRates?.defaultLoans || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium">Rate of Recovery (Open Loans)</CardTitle>
                  <p className="text-sm text-gray-600">Percentage of the due amount that is paid for open loans</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart className="h-10 w-10 mr-4 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">{recoveryRates?.openLoans || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ChartCard
              title="Number of Repayments Collected - Monthly"
              data={chartData.repaymentsCollectedMonthly}
              type="bar"
              color="#b91c1c"
            />
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

