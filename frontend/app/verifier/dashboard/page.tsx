"use client"

import { useState } from "react"
import { CreditCard, DollarSign, Users } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import StatsCard from "@/components/dashboard/stats-card"
import LoanTable, { type Loan } from "@/components/dashboard/loan-table"
import ChartCard from "@/components/dashboard/chart-card"

// Mock data for verifier dashboard
const MOCK_STATS = {
  loans: 50,
  borrowers: 100,
  cashDisbursed: 300000,
  savings: 450000,
  repaidLoans: 30,
}

const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    user: {
      id: "101",
      name: "Tom Cruise",
    },
    amount: 50000,
    date: "June 05, 2021",
    status: "pending",
    reason: "Contact Email not Linked",
  },
  {
    id: "2",
    user: {
      id: "102",
      name: "Matt Damon",
    },
    amount: 75000,
    date: "June 03, 2021",
    status: "pending",
    reason: "Adding Images to Featured Posts",
  },
  {
    id: "3",
    user: {
      id: "103",
      name: "Robert Downey",
    },
    amount: 100000,
    date: "June 06, 2021",
    status: "pending",
    reason: "When will I be charged this month?",
  },
  {
    id: "4",
    user: {
      id: "104",
      name: "Christian Bale",
    },
    amount: 125000,
    date: "June 08, 2021",
    status: "verified",
    reason: "Payment not going through",
  },
  {
    id: "5",
    user: {
      id: "105",
      name: "Henry Cavil",
    },
    amount: 150000,
    date: "June 10, 2021",
    status: "verified",
    reason: "Unable to add replies",
  },
  {
    id: "6",
    user: {
      id: "106",
      name: "Chris Evans",
    },
    amount: 175000,
    date: "June 12, 2021",
    status: "verified",
    reason: "Downtime since last week",
  },
  {
    id: "7",
    user: {
      id: "107",
      name: "Sam Smith",
    },
    amount: 200000,
    date: "June 15, 2021",
    status: "rejected",
    reason: "Referral Bonus",
  },
]

// Chart data
const LOANS_RELEASED_DATA = [
  { name: "1", value: 500 },
  { name: "2", value: 350 },
  { name: "3", value: 200 },
  { name: "4", value: 650 },
  { name: "5", value: 100 },
  { name: "6", value: 250 },
  { name: "7", value: 300 },
  { name: "8", value: 150 },
  { name: "9", value: 400 },
  { name: "10", value: 500 },
  { name: "11", value: 300 },
  { name: "12", value: 700 },
]

const OUTSTANDING_LOANS_DATA = [
  { name: "1", value: 50 },
  { name: "2", value: 500 },
  { name: "3", value: 600 },
  { name: "4", value: 800 },
  { name: "5", value: 100 },
  { name: "6", value: 450 },
  { name: "7", value: 200 },
  { name: "8", value: 800 },
  { name: "9", value: 550 },
  { name: "10", value: 100 },
  { name: "11", value: 400 },
  { name: "12", value: 350 },
]

const REPAYMENTS_DATA = [
  { name: "1", value: 1 },
  { name: "2", value: 5 },
  { name: "3", value: 6 },
  { name: "4", value: 9 },
  { name: "5", value: 1 },
  { name: "6", value: 4 },
  { name: "7", value: 2 },
  { name: "8", value: 9 },
  { name: "9", value: 5 },
  { name: "10", value: 1 },
  { name: "11", value: 4 },
  { name: "12", value: 3 },
]

export default function VerifierDashboard() {
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [stats, setStats] = useState(MOCK_STATS)

  const handleStatusChange = (loanId: string, newStatus: Loan["status"]) => {
    setLoans(loans.map((loan) => (loan.id === loanId ? { ...loan, status: newStatus } : loan)))
  }

  return (
    <ProtectedRoute allowedRoles={["verifier"]}>
      <MainLayout title="Dashboard">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Dashboard • Loans</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats.loans}
              label="Loans"
              className="bg-white"
            />

            <StatsCard
              icon={<Users className="h-6 w-6 text-white" />}
              value={stats.borrowers}
              label="Borrowers"
              className="bg-white"
            />

            <StatsCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              value={stats.cashDisbursed.toLocaleString()}
              label="Cash Disbursed"
              className="bg-white"
            />

            <StatsCard
              icon={<DollarSign className="h-6 w-6 text-white" />}
              value={stats.savings.toLocaleString()}
              label="Savings"
              className="bg-white"
            />

            <StatsCard
              icon={<CreditCard className="h-6 w-6 text-white" />}
              value={stats.repaidLoans}
              label="Repaid Loans"
              className="bg-white"
            />
          </div>

          <LoanTable loans={loans} title="Applied Loans" onStatusChange={handleStatusChange} />

          <div className="grid grid-cols-1 gap-6 mt-6">
            <ChartCard title="Loans Released Monthly" data={LOANS_RELEASED_DATA} type="area" color="#84cc16" />

            <ChartCard
              title="Total Outstanding Open Loans - Monthly"
              data={OUTSTANDING_LOANS_DATA}
              type="bar"
              color="#3b82f6"
            />

            <ChartCard
              title="Number of Repayments Collected - Monthly"
              data={REPAYMENTS_DATA}
              type="bar"
              color="#b91c1c"
            />
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

