"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, UserPlus } from "lucide-react"
import api from "@/utils/api"

interface Borrower {
  _id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "blacklisted"
  loans: number
  totalBorrowed: number
  lastActivity: string
}

export default function AdminBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false)
  const [newBorrower, setNewBorrower] = useState({
    name: "",
    email: "",
    phone: "",
    password: "", // Added password field for creating new user
  })
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
        const response = await api.get("/api/admin/borrowers")
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

  const handleAddBorrower = async () => {
    if (!newBorrower.name || !newBorrower.email || !newBorrower.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields (name, email, and password)",
      })
      return
    }

    try {
      // Creating a new user with 'user' role via the API
      const response = await api.post("/api/auth/register", {
        name: newBorrower.name,
        email: newBorrower.email,
        password: newBorrower.password,
        phone: newBorrower.phone,
        role: 'user' // Ensure they're registered as a regular user
      })

      // Add the new borrower to the state
      const newUser = response.data.user
      setBorrowers([
        ...borrowers,
        {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || 'Not provided',
          status: 'active',
          loans: 0,
          totalBorrowed: 0,
          lastActivity: new Date().toISOString(),
        },
      ])

      setNewBorrower({
        name: "",
        email: "",
        phone: "",
        password: "",
      })

      setIsAddBorrowerOpen(false)

      toast({
        title: "Borrower Added",
        description: `${newBorrower.name} has been added as a borrower`,
      })
    } catch (error: any) {
      console.error("Error adding borrower:", error)
      toast({
        variant: "destructive",
        title: "Failed to add borrower",
        description: error.response?.data?.message || "There was an error creating the borrower.",
      })
    }
  }

  const handleUpdateStatus = async (borrowerId: string, newStatus: Borrower["status"]) => {
    try {
      // Update borrower status via API
      await api.patch(`/api/admin/borrowers/${borrowerId}/status`, { 
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
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "inactive":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "blacklisted":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const activeCount = borrowers.filter((b) => b.status === "active").length
  const inactiveCount = borrowers.filter((b) => b.status === "inactive").length
  const blacklistedCount = borrowers.filter((b) => b.status === "blacklisted").length

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout title="Borrowers">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCount}</div>
                <p className="text-xs text-muted-foreground">
                  {borrowers.length > 0 ? ((activeCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inactive Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inactiveCount}</div>
                <p className="text-xs text-muted-foreground">
                  {borrowers.length > 0 ? ((inactiveCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Blacklisted Borrowers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blacklistedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {borrowers.length > 0 ? ((blacklistedCount / borrowers.length) * 100).toFixed(1) : 0}% of total borrowers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Borrowers</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search borrowers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />

                <Dialog open={isAddBorrowerOpen} onOpenChange={setIsAddBorrowerOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Borrower
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Borrower</DialogTitle>
                      <DialogDescription>Add a new borrower to the system</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newBorrower.name}
                          onChange={(e) => setNewBorrower({ ...newBorrower, name: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newBorrower.email}
                          onChange={(e) => setNewBorrower({ ...newBorrower, email: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newBorrower.password}
                          onChange={(e) => setNewBorrower({ ...newBorrower, password: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={newBorrower.phone}
                          onChange={(e) => setNewBorrower({ ...newBorrower, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddBorrowerOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddBorrower}>
                        Add Borrower
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="blacklisted">Blacklisted</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <BorrowerTable
                    borrowers={filteredBorrowers}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="active">
                  <BorrowerTable
                    borrowers={filteredBorrowers.filter((b) => b.status === "active")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="inactive">
                  <BorrowerTable
                    borrowers={filteredBorrowers.filter((b) => b.status === "inactive")}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusBadgeClass={getStatusBadgeClass}
                  />
                </TabsContent>

                <TabsContent value="blacklisted">
                  <BorrowerTable
                    borrowers={filteredBorrowers.filter((b) => b.status === "blacklisted")}
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
            <TableHead>Loans</TableHead>
            <TableHead>Total Borrowed</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentBorrowers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
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
                <TableCell>{borrower.loans}</TableCell>
                <TableCell>{borrower.totalBorrowed.toLocaleString()}</TableCell>
                <TableCell>{new Date(borrower.lastActivity).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/borrowers/${borrower._id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    {borrower.status !== "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(borrower._id, "active")}
                      >
                        Activate
                      </Button>
                    )}
                    {borrower.status !== "inactive" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        onClick={() => onUpdateStatus(borrower._id, "inactive")}
                      >
                        Deactivate
                      </Button>
                    )}
                    {borrower.status !== "blacklisted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(borrower._id, "blacklisted")}
                      >
                        Blacklist
                      </Button>
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