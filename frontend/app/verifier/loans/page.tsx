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
import { Eye, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Loan {
  id: string
  borrowerId: string
  borrowerName: string
  amount: number
  term: number // in months
  purpose: string
  dateApplied: string
  status: "pending" | "verified" | "rejected"
  documents: string[]
}

// Mock loans data
const MOCK_LOANS: Loan[] = [
  {
    id: "1",
    borrowerId: "1",
    borrowerName: "John Smith",
    amount: 50000,
    term: 12,
    purpose: "Business expansion",
    dateApplied: "2023-05-15",
    status: "pending",
    documents: ["ID Card", "Business Plan", "Bank Statement"],
  },
  {
    id: "2",
    borrowerId: "2",
    borrowerName: "Sarah Johnson",
    amount: 75000,
    term: 24,
    purpose: "Education",
    dateApplied: "2023-06-20",
    status: "verified",
    documents: ["ID Card", "Admission Letter", "Bank Statement", "Guarantor Form"],
  },
  {
    id: "3",
    borrowerId: "3",
    borrowerName: "Michael Brown",
    amount: 100000,
    term: 36,
    purpose: "Home renovation",
    dateApplied: "2023-04-10",
    status: "rejected",
    documents: ["ID Card", "Property Documents"],
  },
  {
    id: "4",
    borrowerId: "4",
    borrowerName: "Emily Davis",
    amount: 25000,
    term: 6,
    purpose: "Medical expenses",
    dateApplied: "2023-07-05",
    status: "pending",
    documents: ["ID Card", "Medical Reports", "Bank Statement"],
  },
  {
    id: "5",
    borrowerId: "5",
    borrowerName: "David Wilson",
    amount: 150000,
    term: 48,
    purpose: "Debt consolidation",
    dateApplied: "2023-07-01",
    status: "pending",
    documents: ["ID Card", "Debt Statements", "Bank Statement", "Employment Letter"],
  },
]

export default function VerifierLoans() {
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredLoans = loans.filter(
    (loan) =>
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                  {((pendingCount / loans.length) * 100).toFixed(1)}% of total loans
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
                  {((verifiedCount / loans.length) * 100).toFixed(1)}% of total loans
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
                  {((rejectedCount / loans.length) * 100).toFixed(1)}% of total loans
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
            <TableHead>Purpose</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Documents</TableHead>
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
                <TableCell>{loan.term} months</TableCell>
                <TableCell>{loan.purpose}</TableCell>
                <TableCell>{loan.dateApplied}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(loan.status)}>
                    {loan.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {loan.documents.map((doc, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
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
                          onClick={() => onUpdateStatus(loan.id, "verified")}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => onUpdateStatus(loan.id, "rejected")}
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

