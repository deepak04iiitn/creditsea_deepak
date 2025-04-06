"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export interface Loan {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  amount: number
  date: string
  status: "pending" | "verified" | "rejected" | "approved" | "disbursed"
  reason?: string
}

interface LoanTableProps {
  loans: Loan[]
  title?: string
  onStatusChange?: (loanId: string, newStatus: Loan["status"]) => void
}

export default function LoanTable({ loans, title = "Applied Loans", onStatusChange }: LoanTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const { user } = useAuth()
  const { toast } = useToast()

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLoans = loans.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(loans.length / itemsPerPage)

  const handleStatusChange = (loanId: string, newStatus: Loan["status"]) => {
    if (onStatusChange) {
      onStatusChange(loanId, newStatus)

      toast({
        title: "Status updated",
        description: `Loan status has been updated to ${newStatus.toUpperCase()}`,
      })
    }
  }

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
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="flex space-x-2">
          <button className="p-1 rounded border">
            <span className="material-icons text-sm">sort</span>
          </button>
          <button className="p-1 rounded border">
            <span className="material-icons text-sm">filter_list</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">User</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.map((loan) => (
              <tr key={loan.id} className="border-b">
                <td className="py-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                    <span className="text-sm">{loan.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p>{loan.user.name}</p>
                    <p className="text-xs text-gray-500">User</p>
                  </div>
                </td>
                <td className="py-3">{loan.amount.toLocaleString()}.00</td>
                <td className="py-3">{loan.date}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(loan.status)}`}>
                    {loan.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 flex space-x-2">
                  {user?.role === "verifier" && loan.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => handleStatusChange(loan.id, "verified")}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => handleStatusChange(loan.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {user?.role === "admin" && loan.status === "verified" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                        onClick={() => handleStatusChange(loan.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => handleStatusChange(loan.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <div>Items per page: {itemsPerPage}</div>
          <div className="flex items-center">
            <span>
              {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, loans.length)} of {loans.length}
            </span>
            <button
              className="ml-2 p-1 rounded border disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <span className="material-icons">chevron_left</span>
            </button>
            <button
              className="p-1 rounded border disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

