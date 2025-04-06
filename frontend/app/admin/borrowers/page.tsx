"use client"

import { useState } from "react"
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

interface Borrower {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "inactive" | "blacklisted"
  loans: number
  totalBorrowed: number
  lastActivity: string
}

// Mock borrowers data
const MOCK_BORROWERS: Borrower[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1234567890",
    status: "active",
    loans: 2,
    totalBorrowed: 150000,
    lastActivity: "2023-05-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1987654321",
    status: "active",
    loans: 1,
    totalBorrowed: 75000,
    lastActivity: "2023-06-20",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1122334455",
    status: "inactive",
    loans: 0,
    totalBorrowed: 0,
    lastActivity: "2023-04-10",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1555666777",
    status: "blacklisted",
    loans: 3,
    totalBorrowed: 250000,
    lastActivity: "2023-03-05",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+1777888999",
    status: "active",
    loans: 1,
    totalBorrowed: 100000,
    lastActivity: "2023-07-01",
  },
]

export default function AdminBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>(MOCK_BORROWERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false)
  const [newBorrower, setNewBorrower] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const { toast } = useToast()

  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.phone.includes(searchTerm),
  )

  const handleAddBorrower = () => {
    if (!newBorrower.name || !newBorrower.email || !newBorrower.phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newId = (Math.max(...borrowers.map((b) => Number.parseInt(b.id))) + 1).toString()

    setBorrowers([
      ...borrowers,
      {
        id: newId,
        name: newBorrower.name,
        email: newBorrower.email,
        phone: newBorrower.phone,
        status: "active",
        loans: 0,
        totalBorrowed: 0,
        lastActivity: new Date().toISOString().split("T")[0],
      },
    ])

    setNewBorrower({
      name: "",
      email: "",
      phone: "",
    })

    setIsAddBorrowerOpen(false)

    toast({
      title: "Borrower Added",
      description: `${newBorrower.name} has been added as a borrower`,
    })
  }

  const handleUpdateStatus = (borrowerId: string, newStatus: Borrower["status"]) => {
    setBorrowers(
      borrowers.map((borrower) => (borrower.id === borrowerId ? { ...borrower, status: newStatus } : borrower)),
    )

    toast({
      title: "Status Updated",
      description: `Borrower status has been updated to ${newStatus}`,
    })
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
                  {((activeCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
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
                  {((inactiveCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
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
                  {((blacklistedCount / borrowers.length) * 100).toFixed(1)}% of total borrowers
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
              <TableRow key={borrower.id}>
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
                <TableCell>{borrower.lastActivity}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {borrower.status !== "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                        onClick={() => onUpdateStatus(borrower.id, "active")}
                      >
                        Activate
                      </Button>
                    )}
                    {borrower.status !== "inactive" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        onClick={() => onUpdateStatus(borrower.id, "inactive")}
                      >
                        Deactivate
                      </Button>
                    )}
                    {borrower.status !== "blacklisted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                        onClick={() => onUpdateStatus(borrower.id, "blacklisted")}
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

