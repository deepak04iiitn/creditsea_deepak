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

interface Borrower {
  _id: string
  name: string
  email: string
  phone: string
  status: "pending" | "verified" | "rejected"
  dateApplied: string
  documents: string[]
}

export default function VerifierBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch borrowers on component mount
  useEffect(() => {
    const fetchBorrowers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching borrowers data...")
        // Fetch users with verification status
        const response = await api.get("/api/verifier/borrowers")
        console.log("Borrowers data received:", response.data)
        setBorrowers(response.data.borrowers || [])
      } catch (error: any) {
        console.error("Error fetching borrowers:", error)
        
        let errorMessage = "Failed to load borrowers data"
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
          description: "There was an error loading the borrowers data."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBorrowers()
  }, [toast])

  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phone.includes(searchTerm),
  )

  const handleUpdateStatus = async (borrowerId: string, newStatus: Borrower["status"]) => {
    try {
      // Update borrower status via API
      await api.patch(`/api/verifier/borrowers/${borrowerId}/status`, { 
        status: newStatus 
      })

      // Update the state
      setBorrowers(
        borrowers.map((borrower) => (borrower._id === borrowerId ? { ...borrower, status: newStatus } : borrower)),
      )

      toast({
        title: "Status Updated",
        description: `Borrower status has been updated to ${newStatus}`,
      })
    } catch (error: any) {
      console.error("Error updating borrower status:", error)
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.response?.data?.message || "There was an error updating the borrower status.",
      })
    }
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
                  {borrowers.length > 0 ? ((pendingCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
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
                  {borrowers.length > 0 ? ((verifiedCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
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
                  {borrowers.length > 0 ? ((rejectedCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
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
            )}
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
              <TableRow key={borrower._id}>
                <TableCell className="font-medium">{borrower.name}</TableCell>
                <TableCell>{borrower.email}</TableCell>
                <TableCell>{borrower.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(borrower.status)}>
                    {borrower.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(borrower.dateApplied).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {borrower.documents && borrower.documents.map((doc, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/verifier/borrowers/${borrower._id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
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
                          onClick={() => onUpdateStatus(borrower._id, "verified")}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-100 text-red-800 hover:bg-red-200"
                          onClick={() => onUpdateStatus(borrower._id, "rejected")}
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

      {borrowers.length > itemsPerPage && (
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
      )}
    </div>
  )
}