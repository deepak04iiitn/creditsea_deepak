"use client"

import { useState } from "react"
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

interface Loan {
  id: string
  borrowerId: string
  borrowerName: string
  amount: number
  interestRate: number
  term: number // in months
  startDate: string
  endDate: string
  status: "pending" | "verified" | "approved" | "disbursed" | "repaying" | "completed" | "defaulted" | "rejected"
  purpose: string
  amountPaid: number
}

// Mock loans data
const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 50000,
    interestRate: 15,
    term: 12,
    startDate: "2023-01-15",
    endDate: "2024-01-15",
    status: "disbursed",
    purpose: "Business expansion",
    amountPaid: 15000,
  },
  {
    id: "2",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 75000,
    interestRate: 12,
    term: 24,
    startDate: "2023-02-20",
    endDate: "2025-02-20",
    status: "repaying",
    purpose: "Education",
    amountPaid: 10000,
  },
  {
    id: "3",
    borrowerId: "5",
    borrowerName: "David Wilson",
    amount: 100000,
    interestRate: 10,
    term: 36,
    startDate: "2023-03-10",
    endDate: "2026-03-10",
    status: "approved",
    purpose: "Home renovation",
    amountPaid: 0,
  },
  {
    id: "4",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 25000,
    interestRate: 18,
    term: 6,
    startDate: "2022-11-05",
    endDate: "2023-05-05",
    status: "completed",
    purpose: "Medical expenses",
    amountPaid: 25000,
  },
  {
    id: "5",
    borrowerId: "3",
    borrowerName: "Michael Brown",
    amount: 150000,
    interestRate: 8,
    term: 48,
    startDate: "2023-04-15",
    endDate: "2027-04-15",
    status: "verified",
    purpose: "Debt consolidation",
    amountPaid: 0,
  },
  {
    id: "6",
    borrowerId: "4",
    borrowerName: "Emily Davis",
    amount: 200000,
    interestRate: 9,
    term: 60,
    startDate: "2022-12-01",
    endDate: "2027-12-01",
    status: "defaulted",
    purpose: "Business startup",
    amountPaid: 20000,
  },
  {
    id: "7",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 30000,
    interestRate: 20,
    term: 3,
    startDate: "2023-05-10",
    endDate: "2023-08-10",
    status: "pending",
    purpose: "Emergency funds",
    amountPaid: 0,
  },
]

// Mock borrowers for the dropdown
const MOCK_BORROWERS = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Emily Davis" },
  { id: "5", name: "David Wilson" },
]

export default function AdminLoans() {
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false)
  const [newLoan, setNewLoan] = useState({
    borrowerId: "",
    amount: "",
    interestRate: "",
    term: "",
    purpose: "",
  })
  const { toast } = useToast()

  const filteredLoans = loans.filter(
    (loan) =>
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddLoan = () => {
    if (!newLoan.borrowerId || !newLoan.amount || !newLoan.interestRate || !newLoan.term || !newLoan.purpose) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newId = (Math.max(...loans.map((l) => Number.parseInt(l.id))) + 1).toString()
    const selectedBorrower = MOCK_BORROWERS.find((b) => b.id === newLoan.borrowerId)

    if (!selectedBorrower) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid borrower selected",
      })
      return
    }

    const today = new Date()
    const startDate = today.toISOString().split("T")[0]
    const endDate = new Date(today.setMonth(today.getMonth() + Number(newLoan.term))).toISOString().split("T")[0]

    setLoans([
      ...loans,
      {
        id: newId,
        borrowerId: newLoan.borrowerId,
        borrowerName: selectedBorrower.name,
        amount: Number(newLoan.amount),
        interestRate: Number(newLoan.interestRate),
        term: Number(newLoan.term),
        startDate,
        endDate,
        status: "pending",
        purpose: newLoan.purpose,
        amountPaid: 0,
      },
    ])

    setNewLoan({
      borrowerId: "",
      amount: "",
      interestRate: "",
      term: "",
      purpose: "",
    })

    setIsAddLoanOpen(false)

    toast({
      title: "Loan Added",
      description: `A new loan for ${selectedBorrower.name} has been added`,
    })
  }

  const handleUpdateStatus = (loanId: string, newStatus: Loan["status"]) => {
    setLoans(loans.map((loan) => (loan.id === loanId ? { ...loan, status: newStatus } : loan)))

    toast({
      title: "Status Updated",
      description: `Loan status has been updated to ${newStatus.toUpperCase()}`,
    })
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
                  {((totalDisbursed / totalAmount) * 100).toFixed(1)}% of total amount
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
                  {((totalRepaid / totalDisbursed) * 100).toFixed(1)}% of disbursed amount
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
                          value={newLoan.borrowerId}
                          onValueChange={(value) => setNewLoan({ ...newLoan, borrowerId: value })}
                        >
                          <SelectTrigger id="borrower">
                            <SelectValue placeholder="Select borrower" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_BORROWERS.map((borrower) => (
                              <SelectItem key={borrower.id} value={borrower.id}>
                                {borrower.name}
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
                        <Label htmlFor="term">Loan Term (months)</Label>
                        <Input
                          id="term"
                          type="number"
                          value={newLoan.term}
                          onChange={(e) => setNewLoan({ ...newLoan, term: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="purpose">Loan Purpose</Label>
                        <Input
                          id="purpose"
                          value={newLoan.purpose}
                          onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                        />
                      </div>
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

              <TabsContent value="approved">
                <LoanTable
                  loans={filteredLoans.filter((l) => l.status === "approved")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="disbursed">
                <LoanTable
                  loans={filteredLoans.filter((l) => l.status === "disbursed")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="repaying">
                <LoanTable
                  loans={filteredLoans.filter((l) => l.status === "repaying")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="completed">
                <LoanTable
                  loans={filteredLoans.filter((l) => l.status === "completed")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="defaulted">
                <LoanTable
                  loans={filteredLoans.filter((l) => l.status === "defaulted")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>
            </Tabs>
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
              <TableRow key={loan.id}>
                <TableCell>{loan.id}</TableCell>
                <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                <TableCell>{loan.amount.toLocaleString()}</TableCell>
                <TableCell>{loan.interestRate}%</TableCell>
                <TableCell>{loan.term} months</TableCell>
                <TableCell>{loan.startDate}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(loan.status)}>
                    {loan.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {loan.amountPaid.toLocaleString()} ({((loan.amountPaid / loan.amount) * 100).toFixed(1)}%)
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>

                    {loan.status === "verified" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(loan.id, "approved")}
                      >
                        Approve
                      </Button>
                    )}

                    {loan.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                        onClick={() => onUpdateStatus(loan.id, "disbursed")}
                      >
                        Disburse
                      </Button>
                    )}

                    {loan.status === "disbursed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                        onClick={() => onUpdateStatus(loan.id, "repaying")}
                      >
                        Start Repayment
                      </Button>
                    )}

                    {loan.status === "repaying" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(loan.id, "completed")}
                      >
                        Mark Completed
                      </Button>
                    )}

                    {["pending", "verified", "approved"].includes(loan.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(loan.id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}

                    {["disbursed", "repaying"].includes(loan.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(loan.id, "defaulted")}
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
  )
}

