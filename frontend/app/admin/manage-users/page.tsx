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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/context/auth-context"
import api from "@/utils/api"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as UserRole,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Fetch admin users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users')
      
      // Transform data to match the expected User interface
      const formattedUsers = response.data.users.map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.createdAt).toISOString().split('T')[0]
      }))
      
      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users from the server"
      })
      setLoading(false)
    }
  }

  // Filter users when search term changes
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      const response = await api.post('/api/auth/register/privileged', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      })
      
      // Add the new user to the list
      const createdUser = response.data.user
      setUsers([...users, {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        createdAt: new Date().toISOString().split("T")[0]
      }])
      
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "admin",
      })

      setIsAddUserOpen(false)

      toast({
        title: "User Added",
        description: `${newUser.name} has been added as a ${newUser.role}`,
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to create user",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/admin/users/${userId}`)
      
      // Remove the deleted user from the list
      setUsers(users.filter(user => user.id !== userId))

      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to delete user",
      })
    }
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      // We need to make an API call to update the user's role
      await api.put(`/api/admin/users/${userId}`, { role: newRole })
      
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to update user role",
      })
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout title="Manage Users">
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">User Management</h2>

            <div className="flex space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />

              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">Add Admin</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with admin privileges</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="verifier">Verifier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddUser}>
                      Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: UserRole) => handleUpdateRole(user.id, value)}
                          disabled={user.email === "admin@example.com"} // Prevent changing the main admin
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="verifier">Verifier</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.email === "admin@example.com"} // Prevent deleting the main admin
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}