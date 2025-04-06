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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/context/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Verifier User",
    email: "verifier@example.com",
    role: "verifier",
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    createdAt: "2023-03-10",
  },
  {
    id: "4",
    name: "John Smith",
    email: "john@example.com",
    role: "user",
    createdAt: "2023-04-05",
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "verifier",
    createdAt: "2023-05-12",
  },
]

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
  })
  const { toast } = useToast()

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newId = (Math.max(...users.map((u) => Number.parseInt(u.id))) + 1).toString()

    setUsers([
      ...users,
      {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ])

    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "user",
    })

    setIsAddUserOpen(false)

    toast({
      title: "User Added",
      description: `${newUser.name} has been added as a ${newUser.role}`,
    })
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))

    toast({
      title: "User Deleted",
      description: "The user has been deleted successfully",
    })
  }

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

    toast({
      title: "Role Updated",
      description: `User role has been updated to ${newRole}`,
    })
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
                          <SelectItem value="user">User</SelectItem>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: UserRole) => handleUpdateRole(user.id, value)}
                      disabled={user.id === "1"} // Prevent changing the main admin
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
                      disabled={user.id === "1"} // Prevent deleting the main admin
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

