"use client"

import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import StatsCard from "@/components/dashboard/stats-card"
import LoanTable, { type Loan } from "@/components/dashboard/loan-table"
import ChartCard from "@/components/dashboard/chart-card"
import api from "@/utils/api"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalLoans: number
  totalBorrowers: number
  verifiedLoans: number
  rejectedLoans: number
  cashDisbursed: number
  cashReceived: number
  totalSavings: number
}

interface ChartPoint {
  name: string
  value: number
}

interface ApiLoan {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  amount: number
  applicationDate: string
  status: string
  reason: string
}

export default function VerifierDashboard() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching verifier dashboard data...')
        const response = await api.get('/api/verifier/dashboard/stats')
        console.log('Verifier dashboard data received:', response.data)
        
        // Set stats
        setStats(response.data.stats)
        
        // Format chart data
        const formatChartData = (chartArray: any[]): ChartPoint[] => {
          if (!chartArray || !Array.isArray(chartArray)) {
            console.warn('Invalid chart data:', chartArray)
            return []
          }
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
        
        // Format loans for the table
        if (response.data.recentActivity && Array.isArray(response.data.recentActivity)) {
          const formattedLoans: Loan[] = response.data.recentActivity.map((loan: ApiLoan) => ({
            id: loan._id,
            user: {
              id: loan.user._id,
              name: loan.user.name
            },
            amount: loan.amount,
            date: new Date(loan.applicationDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: '2-digit' 
            }),
            status: loan.status,
            reason: loan.reason || "Loan Application"
          }))
          
          setLoans(formattedLoans)
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        let errorMessage = "Failed to load dashboard data"
        
        if (err.response) {
          errorMessage += `: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`
        } else if (err.request) {
          errorMessage += ": No response received from server"
        } else {
          errorMessage += `: ${err.message}`
        }
        
        setError(errorMessage)
        setLoading(false)
        
        toast({
          variant: "destructive",
          title: "Failed to fetch data",
          description: "There was an error loading the dashboard data."
        })
      }
    }
    
    fetchDashboardData()
  }, [toast])

  const handleStatusChange = async (loanId: string, newStatus: Loan["status"]) => {
    try {
      await api.patch(`/api/verifier/loans/${loanId}/verify`, { status: newStatus })
      
      // Update the state
      setLoans(loans.map((loan) => (loan.id === loanId ? { ...loan, status: newStatus } : loan)))
      
      toast({
        title: "Status Updated",
        description: `Loan status has been updated to ${newStatus}`
      })
    } catch (error: any) {
      console.error("Error updating loan status:", error)
      
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.message || "There was an error updating the loan status."
      })
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["verifier"]}>
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
      <ProtectedRoute allowedRoles={["verifier"]}>
        <MainLayout title="Dashboard">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["verifier"]}>
      <MainLayout title="Dashboard">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Dashboard • Loans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats?.totalLoans || 0}
              label="Loans"
              className="bg-white"
            />

            <StatsCard
              icon={<Users className="h-6 w-6 text-white" />}
              value={stats?.totalBorrowers || 0}
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
              value={(stats?.totalSavings || 0).toLocaleString()}
              label="Savings"
              className="bg-white"
            />

            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats?.verifiedLoans || 0}
              label="Verified Loans"
              className="bg-white"
            />
          </div>

          <LoanTable loans={loans} title="Recent Loan Activity" onStatusChange={handleStatusChange} />

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