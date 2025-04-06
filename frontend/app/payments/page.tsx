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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  loanId: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: "pending" | "paid" | "overdue" | "partial"
  paymentMethod: string | null
  transactionId: string | null
}

// Mock payments data
const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    loanId: "1",
    amount: 5000,
    dueDate: "2023-02-15",
    paidDate: "2023-02-14",
    status: "paid",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX123456",
  },
  {
    id: "2",
    loanId: "1",
    amount: 5000,
    dueDate: "2023-03-15",
    paidDate: "2023-03-16",
    status: "paid",
    paymentMethod: "Mobile Money",
    transactionId: "TRX234567",
  },
  {
    id: "3",
    loanId: "1",
    amount: 5000,
    dueDate: "2023-04-15",
    paidDate: null,
    status: "pending",
    paymentMethod: null,
    transactionId: null,
  },
  {
    id: "4",
    loanId: "2",
    amount: 3750,
    dueDate: "2023-03-20",
    paidDate: "2023-03-19",
    status: "paid",
    paymentMethod: "Mobile Money",
    transactionId: "TRX456789",
  },
  {
    id: "5",
    loanId: "2",
    amount: 3750,
    dueDate: "2023-04-20",
    paidDate: "2023-04-20",
    status: "partial",
    paymentMethod: "Bank Transfer",
    transactionId: "TRX567890",
  },
  {
    id: "6",
    loanId: "2",
    amount: 3750,
    dueDate: "2023-05-20",
    paidDate: null,
    status: "overdue",
    paymentMethod: null,
    transactionId: null,
  },
]

// Mock loans for the dropdown
const MOCK_LOANS = [
  { id: "1", amount: 50000, term: 12, remainingAmount: 35000 },
  { id: "2", amount: 75000, term: 24, remainingAmount: 67500 },
]

export default function UserPayments() {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer")
  const { toast } = useToast()

  const filteredPayments = payments.filter(
    (payment) =>
      payment.loanId.includes(searchTerm) ||
      payment.status.includes(searchTerm) ||
      (payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleMakePayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setPaymentAmount(payment.amount.toString())
    setIsPaymentDialogOpen(true)
  }

  const handleSubmitPayment = () => {
    if (!selectedPayment || !paymentAmount || Number(paymentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid payment amount",
      })
      return
    }

    const amount = Number(paymentAmount)
    const status: Payment["status"] = amount >= selectedPayment.amount ? "paid" : "partial"

    setPayments(
      payments.map((p) =>
        p.id === selectedPayment.id
          ? {
              ...p,
              status,
              paidDate: new Date().toISOString().split("T")[0],
              paymentMethod,
              transactionId: `TRX${Math.floor(Math.random() * 1000000)}`,
            }
          : p,
      ),
    )

    setIsPaymentDialogOpen(false)
    setSelectedPayment(null)
    setPaymentAmount("")

    toast({
      title: "Payment Successful",
      description: `Your payment of ${amount.toLocaleString()} has been processed`,
    })
  }

  const getStatusBadgeClass = (status: Payment["status"]) => {
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
  const totalDue = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const overdueCount = payments.filter((p) => p.status === "overdue").length

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MainLayout title="Payments">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Pending and overdue payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPaid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All completed payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueCount}</div>
                <p className="text-xs text-muted-foreground">Payments past due date</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Payment Schedule</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <PaymentTable
                  payments={filteredPayments}
                  onMakePayment={handleMakePayment}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="pending">
                <PaymentTable
                  payments={filteredPayments.filter((p) => p.status === "pending")}
                  onMakePayment={handleMakePayment}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="paid">
                <PaymentTable
                  payments={filteredPayments.filter((p) => p.status === "paid" || p.status === "partial")}
                  onMakePayment={handleMakePayment}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="overdue">
                <PaymentTable
                  payments={filteredPayments.filter((p) => p.status === "overdue")}
                  onMakePayment={handleMakePayment}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Active Loans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_LOANS.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Loan #{loan.id}</p>
                        <p className="text-xl font-bold">{loan.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Term: {loan.term} months</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-xl font-bold">{loan.remainingAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {((loan.remainingAmount / loan.amount) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${100 - (loan.remainingAmount / loan.amount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>Enter payment details to process your payment</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Card Payment">Card Payment</SelectItem>
                    <SelectItem value="Cash Deposit">Cash Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmitPayment}>
                Process Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </ProtectedRoute>
  )
}

interface PaymentTableProps {
  payments: Payment[]
  onMakePayment: (payment: Payment) => void
  getStatusBadgeClass: (status: Payment["status"]) => string
}

function PaymentTable({ payments, onMakePayment, getStatusBadgeClass }: PaymentTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(payments.length / itemsPerPage)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
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
          {currentPayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            currentPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.id}</TableCell>
                <TableCell>{payment.loanId}</TableCell>
                <TableCell>{payment.amount.toLocaleString()}</TableCell>
                <TableCell>{payment.dueDate}</TableCell>
                <TableCell>{payment.paidDate || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(payment.status)}>
                    {payment.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{payment.paymentMethod || "-"}</TableCell>
                <TableCell>
                  {(payment.status === "pending" || payment.status === "overdue") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-100 text-green-800 hover:bg-green-200"
                      onClick={() => onMakePayment(payment)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {payment.status === "partial" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => onMakePayment(payment)}
                    >
                      Complete
                    </Button>
                  )}
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
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, payments.length)} of {payments.length}
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

