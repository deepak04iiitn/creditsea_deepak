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
import { DollarSign, Eye } from "lucide-react"

interface Repayment {
  id: string
  loanId: string
  borrowerId: string
  borrowerName: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: "pending" | "paid" | "overdue" | "partial"
  paymentMethod: string | null
  transactionId: string | null
  notes: string | null
}

// Mock repayments data
const MOCK_REPAYMENTS: Repayment[] = [
  {
    id: "1",
    loanId: "1",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 5000,
    dueDate: "2023-02-15",
    paidDate: "2023-02-14",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX123456",
    notes: null,
  },
  {
    id: "2",
    loanId: "1",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 5000,
    dueDate: "2023-03-15",
    paidDate: "2023-03-16",
    status: "paid",
    paymentMethod: "Mobile Money",
    transactionId: "TRX234567",
    notes: "Paid one day late",
  },
  {
    id: "3",
    loanId: "1",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 5000,
    dueDate: "2023-04-15",
    paidDate: "2023-04-10",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX345678",
    notes: null,
  },
  {
    id: "4",
    loanId: "2",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 3750,
    dueDate: "2023-03-20",
    paidDate: "2023-03-19",
    status: "paid",
    paymentMethod: "Mobile Money",
    transactionId: "TRX456789",
    notes: null,
  },
  {
    id: "5",
    loanId: "2",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 3750,
    dueDate: "2023-04-20",
    paidDate: "2023-04-20",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX567890",
    notes: null,
  },
  {
    id: "6",
    loanId: "2",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 3750,
    dueDate: "2023-05-20",
    paidDate: null,
    status: "pending",
    paymentMethod: null,
    transactionId: null,
    notes: null,
  },
  {
    id: "7",
    loanId: "6",
    borrowerId: "4",
    borrowerName: "Emily Davis",
    amount: 4000,
    dueDate: "2023-01-01",
    paidDate: null,
    status: "overdue",
    paymentMethod: null,
    transactionId: null,
    notes: "Borrower not responding to calls",
  },
  {
    id: "8",
    loanId: "6",
    borrowerId: "4",
    borrowerName: "Emily Davis",
    amount: 4000,
    dueDate: "2023-02-01",
    paidDate: "2023-02-15",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX678901",
    notes: "Paid late with penalty",
  },
  {
    id: "9",
    loanId: "6",
    borrowerId: "4",
    borrowerName: "Emily Davis",
    amount: 4000,
    dueDate: "2023-03-01",
    paidDate: "2023-03-01",
    status: "partial",
    paymentMethod: "Mobile Money",
    transactionId: "TRX789012",
    notes: "Paid only half the amount",
  },
]

// Mock loans for the dropdown
const MOCK_LOANS = [
  { id: "1", borrowerId: "1", borrowerName: "John Smith", amount: 50000 },
  { id: "2", borrowerId: "2", borrowerName: "Sarah Johnson", amount: 75000 },
  { id: "6", borrowerId: "4", borrowerName: "Emily Davis", amount: 200000 },
]

export default function AdminRepayments() {
  const [repayments, setRepayments] = useState<Repayment[]>(MOCK_REPAYMENTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddRepaymentOpen, setIsAddRepaymentOpen] = useState(false)
  const [newRepayment, setNewRepayment] = useState({
    loanId: "",
    amount: "",
    dueDate: "",
    notes: "",
  })
  const { toast } = useToast()

  const filteredRepayments = repayments.filter(
    (repayment) =>
      repayment.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repayment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repayment.paymentMethod && repayment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddRepayment = () => {
    if (!newRepayment.loanId || !newRepayment.amount || !newRepayment.dueDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newId = (Math.max(...repayments.map((r) => Number.parseInt(r.id))) + 1).toString()
    const selectedLoan = MOCK_LOANS.find((l) => l.id === newRepayment.loanId)

    if (!selectedLoan) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid loan selected",
      })
      return
    }

    setRepayments([
      ...repayments,
      {
        id: newId,
        loanId: newRepayment.loanId,
        borrowerId: selectedLoan.borrowerId,
        borrowerName: selectedLoan.borrowerName,
        amount: Number(newRepayment.amount),
        dueDate: newRepayment.dueDate,
        paidDate: null,
        status: "pending",
        paymentMethod: null,
        transactionId: null,
        notes: newRepayment.notes || null,
      },
    ])

    setNewRepayment({
      loanId: "",
      amount: "",
      dueDate: "",
      notes: "",
    })

    setIsAddRepaymentOpen(false)

    toast({
      title: "Repayment Added",
      description: `A new repayment schedule for ${selectedLoan.borrowerName} has been added`,
    })
  }

  const handleUpdateStatus = (repaymentId: string, newStatus: Repayment["status"], paidDate: string | null = null) => {
    setRepayments(
      repayments.map((repayment) =>
        repayment.id === repaymentId
          ? {
              ...repayment,
              status: newStatus,
              paidDate: paidDate || repayment.paidDate,
              paymentMethod:
                newStatus === "paid" || newStatus === "partial" ? "Bank Transfer" : repayment.paymentMethod,
              transactionId:
                newStatus === "paid" || newStatus === "partial"
                  ? `TRX${Math.floor(Math.random() * 1000000)}`
                  : repayment.transactionId,
            }
          : repayment,
      ),
    )

    toast({
      title: "Status Updated",
      description: `Repayment status has been updated to ${newStatus.toUpperCase()}`,
    })
  }

  const getStatusBadgeClass = (status: Repayment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "partial":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate statistics
  const totalRepayments = repayments.length
  const totalAmount = repayments.reduce((sum, repayment) => sum + repayment.amount, 0)
  const totalPaid = repayments
    .filter((repayment) => repayment.status === "paid")
    .reduce((sum, repayment) => sum + repayment.amount, 0)
  const totalPending = repayments
    .filter((repayment) => repayment.status === "pending")
    .reduce((sum, repayment) => sum + repayment.amount, 0)
  const totalOverdue = repayments
    .filter((repayment) => repayment.status === "overdue")
    .reduce((sum, repayment) => sum + repayment.amount, 0)

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout title="Repayments">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Repayments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRepayments}</div>
                <p className="text-xs text-muted-foreground">All scheduled repayments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Sum of all repayments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPaid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalPaid / totalAmount) * 100).toFixed(1)}% of total amount
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOverdue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalOverdue / totalAmount) * 100).toFixed(1)}% of total amount
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Repayments</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search repayments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />

                <Dialog open={isAddRepaymentOpen} onOpenChange={setIsAddRepaymentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Add Repayment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Repayment</DialogTitle>
                      <DialogDescription>Schedule a new repayment for a loan</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="loan">Loan</Label>
                        <Select
                          value={newRepayment.loanId}
                          onValueChange={(value) => setNewRepayment({ ...newRepayment, loanId: value })}
                        >
                          <SelectTrigger id="loan">
                            <SelectValue placeholder="Select loan" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_LOANS.map((loan) => (
                              <SelectItem key={loan.id} value={loan.id}>
                                {loan.borrowerName} - {loan.amount.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="amount">Repayment Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newRepayment.amount}
                          onChange={(e) => setNewRepayment({ ...newRepayment, amount: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newRepayment.dueDate}
                          onChange={(e) => setNewRepayment({ ...newRepayment, dueDate: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          value={newRepayment.notes}
                          onChange={(e) => setNewRepayment({ ...newRepayment, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddRepaymentOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddRepayment}>
                        Add Repayment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Repayments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="partial">Partial</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <RepaymentTable
                  repayments={filteredRepayments}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="pending">
                <RepaymentTable
                  repayments={filteredRepayments.filter((r) => r.status === "pending")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="paid">
                <RepaymentTable
                  repayments={filteredRepayments.filter((r) => r.status === "paid")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="overdue">
                <RepaymentTable
                  repayments={filteredRepayments.filter((r) => r.status === "overdue")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="partial">
                <RepaymentTable
                  repayments={filteredRepayments.filter((r) => r.status === "partial")}
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

interface RepaymentTableProps {
  repayments: Repayment[]
  onUpdateStatus: (repaymentId: string, newStatus: Repayment["status"], paidDate?: string | null) => void
  getStatusBadgeClass: (status: Repayment["status"]) => string
}

function RepaymentTable({ repayments, onUpdateStatus, getStatusBadgeClass }: RepaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentRepayments = repayments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(repayments.length / itemsPerPage)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Loan ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Paid Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRepayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No repayments found
              </TableCell>
            </TableRow>
          ) : (
            currentRepayments.map((repayment) => (
              <TableRow key={repayment.id}>
                <TableCell>{repayment.id}</TableCell>
                <TableCell className="font-medium">{repayment.borrowerName}</TableCell>
                <TableCell>{repayment.loanId}</TableCell>
                <TableCell>{repayment.amount.toLocaleString()}</TableCell>
                <TableCell>{repayment.dueDate}</TableCell>
                <TableCell>{repayment.paidDate || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(repayment.status)}>
                    {repayment.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{repayment.paymentMethod || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>

                    {repayment.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => onUpdateStatus(repayment.id, "paid", new Date().toISOString().split("T")[0])}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          onClick={() =>
                            onUpdateStatus(repayment.id, "partial", new Date().toISOString().split("T")[0])
                          }
                        >
                          Partial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => onUpdateStatus(repayment.id, "overdue")}
                        >
                          Mark Overdue
                        </Button>
                      </>
                    )}

                    {repayment.status === "overdue" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => onUpdateStatus(repayment.id, "paid", new Date().toISOString().split("T")[0])}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          onClick={() =>
                            onUpdateStatus(repayment.id, "partial", new Date().toISOString().split("T")[0])
                          }
                        >
                          Partial
                        </Button>
                      </>
                    )}

                    {repayment.status === "partial" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(repayment.id, "paid", new Date().toISOString().split("T")[0])}
                      >
                        Complete
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
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, repayments.length)} of {repayments.length}
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

