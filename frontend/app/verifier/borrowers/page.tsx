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

interface Borrower {
  id: string
  name: string
  email: string
  phone: string
  status: "pending" | "verified" | "rejected"
  dateApplied: string
  documents: string[]
}

// Mock borrowers data
const MOCK_BORROWERS: Borrower[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    status: "pending",
    dateApplied: "2023-05-15",
    documents: ["ID Card", "Proof of Address", "Bank Statement"],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1987654321",
    status: "verified",
    dateApplied: "2023-06-20",
    documents: ["ID Card", "Proof of Address", "Bank Statement", "Employment Letter"],
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1122334455",
    status: "rejected",
    dateApplied: "2023-04-10",
    documents: ["ID Card", "Proof of Address"],
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1555666777",
    status: "pending",
    dateApplied: "2023-07-05",
    documents: ["ID Card", "Proof of Address", "Bank Statement"],
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+1777888999",
    status: "pending",
    dateApplied: "2023-07-01",
    documents: ["ID Card", "Proof of Address", "Bank Statement", "Employment Letter"],
  },
]

export default function VerifierBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>(MOCK_BORROWERS)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phone.includes(searchTerm),
  )

  const handleUpdateStatus = (borrowerId: string, newStatus: Borrower["status"]) => {
    setBorrowers(
      borrowers.map((borrower) => (borrower.id === borrowerId ? { ...borrower, status: newStatus } : borrower)),
    )

    toast({
      title: "Status Updated",
      description: `Borrower status has been updated to ${newStatus.toUpperCase()}`,
    })
  }

  const getStatusBadgeClass = (status: Borrower["status"]) => {
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
  const pendingCount = borrowers.filter((b) => b.status === "pending").length
  const verifiedCount = borrowers.filter((b) => b.status === "verified").length
  const rejectedCount = borrowers.filter((b) => b.status === "rejected").length

  return (
    <ProtectedRoute allowedRoles={["verifier"]}>
      <MainLayout title="Borrowers Verification">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((pendingCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verified Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{verifiedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((verifiedCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rejectedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((rejectedCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Borrowers Verification</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search borrowers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Borrowers</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <BorrowerTable
                  borrowers={filteredBorrowers}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="pending">
                <BorrowerTable
                  borrowers={filteredBorrowers.filter((b) => b.status === "pending")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="verified">
                <BorrowerTable
                  borrowers={filteredBorrowers.filter((b) => b.status === "verified")}
                  onUpdateStatus={handleUpdateStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                />
              </TabsContent>

              <TabsContent value="rejected">
                <BorrowerTable
                  borrowers={filteredBorrowers.filter((b) => b.status === "rejected")}
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

interface BorrowerTableProps {
  borrowers: Borrower[]
  onUpdateStatus: (borrowerId: string, newStatus: Borrower["status"]) => void
  getStatusBadgeClass: (status: Borrower["status"]) => string
}

function BorrowerTable({ borrowers, onUpdateStatus, getStatusBadgeClass }: BorrowerTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentBorrowers = borrowers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(borrowers.length / itemsPerPage)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Applied</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentBorrowers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No borrowers found
              </TableCell>
            </TableRow>
          ) : (
            currentBorrowers.map((borrower) => (
              <TableRow key={borrower.id}>
                <TableCell className="font-medium">{borrower.name}</TableCell>
                <TableCell>{borrower.email}</TableCell>
                <TableCell>{borrower.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(borrower.status)}>
                    {borrower.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{borrower.dateApplied}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {borrower.documents.map((doc, index) => (
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

                    {borrower.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                          onClick={() => onUpdateStatus(borrower.id, "verified")}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => onUpdateStatus(borrower.id, "rejected")}
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
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, borrowers.length)} of {borrowers.length}
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

