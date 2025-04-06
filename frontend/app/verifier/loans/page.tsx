"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

interface Loan {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  amount: number
  interestRate: number
  tenure: number
  reason: string
  applicationDate: string
  status: "pending" | "verified" | "rejected"
  documents?: string[]
  employmentStatus?: string
  employerName?: string
  employerAddress?: string
}

export default function VerifierLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch loans on component mount
  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching verifier loans data...")
        const response = await api.get("/api/verifier/loans/pending")
        console.log("Verifier loans data received:", response.data)
        setLoans(response.data.loans || [])
      } catch (error: any) {
        console.error("Error fetching loans:", error)
        
        let errorMessage = "Failed to load loans data"
        if (error.response) {
          errorMessage += `: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`
        } else if (error.request) {
          errorMessage += ": No response received from server"
        } else {
          errorMessage += `: ${error.message}`
        }
        
        setError(errorMessage)
        
        toast({
          variant: "destructive",
          title: "Failed to fetch data",
          description: "There was an error loading the loans data."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoans()
  }, [toast])

  const filteredLoans = loans.filter(
    (loan) =>
      loan.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUpdateStatus = async (loanId: string, newStatus: Loan["status"]) => {
    try {
      // Update loan status via API
      await api.patch(`/api/verifier/loans/${loanId}/verify`, { 
        status: newStatus 
      })

      // Update the state
      setLoans(loans.map((loan) => (loan._id === loanId ? { ...loan, status: newStatus } : loan)))

      toast({
        title: "Status Updated",
        description: `Loan status has been updated to ${newStatus}`,
      })
    } catch (error: any) {
      console.error("Error updating loan status:", error)
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.message || "There was an error updating the loan status.",
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const pendingCount = loans.filter((l) => l.status === "pending").length
  const verifiedCount = loans.filter((l) => l.status === "verified").length
  const rejectedCount = loans.filter((l) => l.status === "rejected").length
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <ProtectedRoute allowedRoles={["verifier"]}>
      <MainLayout title="Loans Verification">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  {loans.length > 0 ? ((pendingCount / loans.length) * 100).toFixed(1) : 0}% of total loans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verified Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verifiedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {loans.length > 0 ? ((verifiedCount / loans.length) * 100).toFixed(1) : 0}% of total loans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {loans.length > 0 ? ((rejectedCount / loans.length) * 100).toFixed(1) : 0}% of total loans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Sum of all loan amounts</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Loans Verification</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Loans</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <LoanTable
                    loans={filteredLoans}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="pending">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "pending")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="verified">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "verified")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="rejected">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "rejected")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

interface LoanTableProps {
  loans: Loan[]
  onUpdateStatus: (loanId: string, newStatus: Loan["status"]) => void
  getStatusBadgeClass: (status: Loan["status"]) => string
}

function LoanTable({ loans, onUpdateStatus, getStatusBadgeClass }: LoanTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLoans = loans.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(loans.length / itemsPerPage)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentLoans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No loans found
              </TableCell>
            </TableRow>
          ) : (
            currentLoans.map((loan) => (
              <TableRow key={loan._id}>
                <TableCell>{loan._id.substring(0, 8)}...</TableCell>
                <TableCell className="font-medium">{loan.user.name}</TableCell>
                <TableCell>{loan.amount.toLocaleString()}</TableCell>
                <TableCell>{loan.tenure} months</TableCell>
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{loan.reason}</TableCell>
                <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(loan.status)}>
                    {loan.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/verifier/loans/${loan._id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>

                    {loan.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => onUpdateStatus(loan._id, "verified")}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => onUpdateStatus(loan._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {loans.length > itemsPerPage && (
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
      )}
    </div>
  )
}