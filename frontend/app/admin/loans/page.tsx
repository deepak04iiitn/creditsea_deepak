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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Eye, FileText } from "lucide-react"
// Import the API utility instead of axios directly
import api from "@/utils/api"

interface Loan {
  _id: string // Changed from id to _id to match MongoDB's ID
  user: {
    _id: string
    name: string
    email: string
  }
  amount: number
  interestRate: number
  tenure: number // Changed from term to tenure to match backend model
  applicationDate: string // Changed from startDate
  disbursementDate?: string // Optional as it might not be set for all loan statuses
  status: "pending" | "verified" | "approved" | "disbursed" | "repaying" | "completed" | "defaulted" | "rejected"
  reason: string // Changed from purpose
  amountPaid: number
  totalAmountPayable: number
}

// Interface for creating a new loan
interface NewLoan {
  userId: string
  amount: string
  interestRate: string
  tenure: string
  reason: string
  employmentStatus: string
  employerName: string
  employerAddress: string
}

// User interface
interface User {
  _id: string
  name: string
  email: string
  role: string
}

export default function AdminLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newLoan, setNewLoan] = useState<NewLoan>({
    userId: "",
    amount: "",
    interestRate: "15", // Default interest rate
    tenure: "",
    reason: "",
    employmentStatus: "Employed",
    employerName: "",
    employerAddress: "",
  })
  const { toast } = useToast()

  // Fetch loans on component mount
  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching loans data...")
        
        // Use the API utility instead of axios directly
        const response = await api.get("/api/admin/loans")
        console.log("Loans data received:", response.data)
        setLoans(response.data.loans || [])
        
        // Also fetch users for the dropdown in the add loan form
        console.log("Fetching users data...")
        const usersResponse = await api.get("/api/admin/users")
        console.log("Users data received:", usersResponse.data)
        
        // Filter to only include users with role 'user'
        const regularUsers = usersResponse.data.users.filter((user: User) => user.role === "user")
        setUsers(regularUsers)
      } catch (error: any) {
        console.error("Error fetching loans or users:", error)
        
        let errorMessage = "Failed to load data"
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

  const handleAddLoan = async () => {
    if (!newLoan.userId || !newLoan.amount || !newLoan.interestRate || !newLoan.tenure || !newLoan.reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      // Use the API utility
      const response = await api.post(
        "/api/admin/loans",
        {
          user: newLoan.userId,
          amount: Number(newLoan.amount),
          interestRate: Number(newLoan.interestRate),
          tenure: Number(newLoan.tenure),
          reason: newLoan.reason,
          employmentStatus: newLoan.employmentStatus,
          employerName: newLoan.employerName,
          employerAddress: newLoan.employerAddress,
        }
      )

      // Add the new loan to the state
      setLoans([response.data.loan, ...loans])

      // Reset the form
      setNewLoan({
        userId: "",
        amount: "",
        interestRate: "15",
        tenure: "",
        reason: "",
        employmentStatus: "Employed",
        employerName: "",
        employerAddress: "",
      })

      setIsAddLoanOpen(false)

      toast({
        title: "Loan Added",
        description: `A new loan has been created successfully`,
      })
    } catch (error: any) {
      console.error("Error adding loan:", error)
      toast({
        variant: "destructive",
        title: "Failed to add loan",
        description: error.response?.data?.message || "There was an error creating the loan.",
      })
    }
  }

  const handleUpdateStatus = async (loanId: string, newStatus: Loan["status"]) => {
    try {
      // Use the API utility
      await api.patch(
        `/api/admin/loans/${loanId}/status`,
        { status: newStatus }
      )

      // Update the state
      setLoans(loans.map((loan) => (loan._id === loanId ? { ...loan, status: newStatus } : loan)))

      toast({
        title: "Status Updated",
        description: `Loan status has been updated to ${newStatus.toUpperCase()}`,
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
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "disbursed":
        return "bg-purple-100 text-purple-800"
      case "repaying":
        return "bg-cyan-100 text-cyan-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "defaulted":
        return "bg-red-100 text-red-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalLoans = loans.length
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalDisbursed = loans
    .filter((loan) => ["disbursed", "repaying", "completed", "defaulted"].includes(loan.status))
    .reduce((sum, loan) => sum + loan.amount, 0)
  const totalRepaid = loans.reduce((sum, loan) => sum + loan.amountPaid, 0)

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout title="Loans">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLoans}</div>
                <p className="text-xs text-muted-foreground">All time loans</p>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDisbursed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalAmount > 0 ? ((totalDisbursed / totalAmount) * 100).toFixed(1) : 0}% of total amount
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRepaid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDisbursed > 0 ? ((totalRepaid / totalDisbursed) * 100).toFixed(1) : 0}% of disbursed amount
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Loans</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />

                <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <FileText className="mr-2 h-4 w-4" />
                      Add Loan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Loan</DialogTitle>
                      <DialogDescription>Create a new loan for a borrower</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="borrower">Borrower</Label>
                        <Select
                          value={newLoan.userId}
                          onValueChange={(value) => setNewLoan({ ...newLoan, userId: value })}
                        >
                          <SelectTrigger id="borrower">
                            <SelectValue placeholder="Select borrower" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="amount">Loan Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newLoan.amount}
                          onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          value={newLoan.interestRate}
                          onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tenure">Loan Term (months)</Label>
                        <Input
                          id="tenure"
                          type="number"
                          value={newLoan.tenure}
                          onChange={(e) => setNewLoan({ ...newLoan, tenure: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="reason">Loan Purpose</Label>
                        <Input
                          id="reason"
                          value={newLoan.reason}
                          onChange={(e) => setNewLoan({ ...newLoan, reason: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="employmentStatus">Employment Status</Label>
                        <Select
                          value={newLoan.employmentStatus}
                          onValueChange={(value) => setNewLoan({ ...newLoan, employmentStatus: value })}
                        >
                          <SelectTrigger id="employmentStatus">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Self-employed">Self-employed</SelectItem>
                            <SelectItem value="Unemployed">Unemployed</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(newLoan.employmentStatus === "Employed" || newLoan.employmentStatus === "Self-employed") && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="employerName">Employer Name</Label>
                            <Input
                              id="employerName"
                              value={newLoan.employerName}
                              onChange={(e) => setNewLoan({ ...newLoan, employerName: e.target.value })}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="employerAddress">Employer Address</Label>
                            <Input
                              id="employerAddress"
                              value={newLoan.employerAddress}
                              onChange={(e) => setNewLoan({ ...newLoan, employerAddress: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddLoanOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddLoan}>
                        Add Loan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {error ? (
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
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="disbursed">Disbursed</TabsTrigger>
                  <TabsTrigger value="repaying">Repaying</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="defaulted">Defaulted</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <LoanTable
                    loans={filteredLoans}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="pending">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "pending")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="verified">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "verified")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="approved">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "approved")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="disbursed">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "disbursed")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="repaying">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "repaying")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="completed">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "completed")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="defaulted">
                  <LoanTable
                    loans={filteredLoans.filter((l) => l.status === "defaulted")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                    isLoading={isLoading}
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
  isLoading: boolean
}

function LoanTable({ loans, onUpdateStatus, getStatusBadgeClass, isLoading }: LoanTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLoans = loans.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(loans.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid</TableHead>
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
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{loan.tenure} months</TableCell>
                <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(loan.status)}>
                    {loan.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {loan.amountPaid.toLocaleString()} ({loan.totalAmountPayable > 0 ? ((loan.amountPaid / loan.totalAmountPayable) * 100).toFixed(1) : 0}%)
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/loans/${loan._id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>

                    {loan.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                        onClick={() => onUpdateStatus(loan._id, "verified")}
                      >
                        Verify
                      </Button>
                    )}

                    {loan.status === "verified" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(loan._id, "approved")}
                      >
                        Approve
                      </Button>
                    )}

                    {loan.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                        onClick={() => onUpdateStatus(loan._id, "disbursed")}
                      >
                        Disburse
                      </Button>
                    )}

                    {loan.status === "disbursed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                        onClick={() => onUpdateStatus(loan._id, "repaying")}
                      >
                        Start Repayment
                      </Button>
                    )}

                    {loan.status === "repaying" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(loan._id, "completed")}
                      >
                        Mark Completed
                      </Button>
                    )}

                    {["pending", "verified", "approved"].includes(loan.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(loan._id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}

                    {["disbursed", "repaying"].includes(loan.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(loan._id, "defaulted")}
                      >
                        Mark Default
                      </Button>
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