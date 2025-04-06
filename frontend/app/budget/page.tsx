"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Plus, Trash2 } from "lucide-react"

interface BudgetItem {
  id: string
  category: string
  amount: number
  type: "income" | "expense"
  date: string
  description: string
}

// Mock budget data
const MOCK_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: "1",
    category: "Salary",
    amount: 50000,
    type: "income",
    date: "2023-07-01",
    description: "Monthly salary",
  },
  {
    id: "2",
    category: "Rent",
    amount: 15000,
    type: "expense",
    date: "2023-07-05",
    description: "Monthly rent",
  },
  {
    id: "3",
    category: "Groceries",
    amount: 5000,
    type: "expense",
    date: "2023-07-10",
    description: "Weekly groceries",
  },
  {
    id: "4",
    category: "Utilities",
    amount: 3000,
    type: "expense",
    date: "2023-07-15",
    description: "Electricity and water",
  },
  {
    id: "5",
    category: "Transportation",
    amount: 2000,
    type: "expense",
    date: "2023-07-20",
    description: "Fuel and public transport",
  },
  {
    id: "6",
    category: "Freelance",
    amount: 10000,
    type: "income",
    date: "2023-07-25",
    description: "Side project payment",
  },
]

// Category options
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Gifts", "Other Income"]
const EXPENSE_CATEGORIES = [
  "Rent",
  "Groceries",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Loan Repayment",
  "Other Expenses",
]

export default function UserBudget() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    category: "",
    amount: "",
    type: "expense" as BudgetItem["type"],
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const { toast } = useToast()

  const filteredItems = budgetItems.filter(
    (item) =>
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddItem = () => {
    if (!newItem.category || !newItem.amount || !newItem.date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newId = (Math.max(...budgetItems.map((item) => Number.parseInt(item.id))) + 1).toString()

    setBudgetItems([
      ...budgetItems,
      {
        id: newId,
        category: newItem.category,
        amount: Number(newItem.amount),
        type: newItem.type,
        date: newItem.date,
        description: newItem.description,
      },
    ])

    setNewItem({
      category: "",
      amount: "",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      description: "",
    })

    setIsAddItemOpen(false)

    toast({
      title: "Item Added",
      description: `A new ${newItem.type} item has been added to your budget`,
    })
  }

  const handleDeleteItem = (itemId: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== itemId))

    toast({
      title: "Item Deleted",
      description: "The budget item has been deleted",
    })
  }

  // Calculate statistics
  const totalIncome = budgetItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = budgetItems
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0)
  const balance = totalIncome - totalExpenses

  // Prepare data for pie charts
  const incomeByCategory = INCOME_CATEGORIES.map((category) => {
    const amount = budgetItems
      .filter((item) => item.type === "income" && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0)
    return { name: category, value: amount }
  }).filter((item) => item.value > 0)

  const expensesByCategory = EXPENSE_CATEGORIES.map((category) => {
    const amount = budgetItems
      .filter((item) => item.type === "expense" && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0)
    return { name: category, value: amount }
  }).filter((item) => item.value > 0)

  // Colors for pie charts
  const INCOME_COLORS = ["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"]
  const EXPENSE_COLORS = ["#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#701a1a", "#5f1919"]

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MainLayout title="Budget Tracker">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={balance >= 0 ? "bg-green-50" : "bg-red-50"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Income - Expenses</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All income sources</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All expenses</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Budget Items</h2>

              <div className="flex space-x-2">
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />

                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Budget Item</DialogTitle>
                      <DialogDescription>Add a new income or expense to your budget</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newItem.type}
                          onValueChange={(value: BudgetItem["type"]) => setNewItem({ ...newItem, type: value })}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {newItem.type === "income"
                              ? INCOME_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))
                              : EXPENSE_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newItem.amount}
                          onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newItem.date}
                          onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddItem}>
                        Add Item
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <BudgetTable items={filteredItems} onDeleteItem={handleDeleteItem} />
              </TabsContent>

              <TabsContent value="income">
                <BudgetTable
                  items={filteredItems.filter((item) => item.type === "income")}
                  onDeleteItem={handleDeleteItem}
                />
              </TabsContent>

              <TabsContent value="expense">
                <BudgetTable
                  items={filteredItems.filter((item) => item.type === "expense")}
                  onDeleteItem={handleDeleteItem}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

interface BudgetTableProps {
  items: BudgetItem[]
  onDeleteItem: (itemId: string) => void
}

function BudgetTable({ items, onDeleteItem }: BudgetTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(items.length / itemsPerPage)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No budget items found
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className={item.type === "income" ? "text-green-600" : "text-red-600"}>
                  {item.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-100 text-red-800 hover:bg-red-200"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, items.length)} of {items.length}
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

