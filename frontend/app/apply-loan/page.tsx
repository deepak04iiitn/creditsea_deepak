"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import MainLayout from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import api from "@/utils/api"

export default function ApplyLoan() {
  const [fullName, setFullName] = useState("")
  const [amount, setAmount] = useState("")
  const [tenure, setTenure] = useState("")
  const [reason, setReason] = useState("")
  const [employmentStatus, setEmploymentStatus] = useState("")
  const [employerName, setEmployerName] = useState("")
  const [employerAddress, setEmployerAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !amount || !tenure || !reason || !employmentStatus) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    if (!agreed) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please agree to the terms and conditions",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/api/loans', {
        amount: Number(amount),
        tenure: Number(tenure),
        reason,
        employmentStatus,
        employerName: employerName || undefined,
        employerAddress: employerAddress || undefined,
      })

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MainLayout title="Apply for a Loan">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">APPLY FOR A LOAN</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="fullName">Full name as it appears on bank account</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="amount">How much do you need?</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="tenure">Loan tenure (in months)</Label>
                <Input
                  id="tenure"
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="employmentStatus">Employment status</Label>
                <Input
                  id="employmentStatus"
                  value={employmentStatus}
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="reason">Reason for loan</Label>
              <Textarea id="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="employerName">Employer name</Label>
                <Input id="employerName" value={employerName} onChange={(e) => setEmployerName(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="employerAddress">Employer address</Label>
                <Input
                  id="employerAddress"
                  value={employerAddress}
                  onChange={(e) => setEmployerAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms1" 
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label htmlFor="terms1" className="text-sm">
                  I have read the legal and other information and agree that by considering the application, CreditSea may 
                  disclose information to other lenders, credit bureaus, and credit reporting agencies.
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

