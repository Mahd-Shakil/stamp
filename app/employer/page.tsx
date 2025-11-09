"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Check, X, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function EmployerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [employer, setEmployer] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployerData()
  }, [])

  async function fetchEmployerData() {
    try {
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch employer data from database
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()

      if (employerError || !employerData) {
        // Not an employer, redirect to user dashboard
        router.push('/dashboard')
        return
      }

      setEmployer(employerData)

      // Fetch pending requests for this employer's company
      const { data: requestData, error: requestError } = await supabase
        .from('credential_requests')
        .select('*, users(*)')
        .eq('company_name', employerData.organization_name)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!requestError && requestData) {
        setRequests(requestData)
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(requestId: string, userWalletAddress: string, metadata: any) {
    setProcessing(requestId)
    try {
      // Call API to mint token and update status
      const response = await fetch('/api/credentials/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userWalletAddress,
          metadata,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve credential')
      }

      toast({
        title: "Success",
        description: "Credential approved and minted to blockchain!",
      })
      fetchEmployerData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(requestId: string) {
    setProcessing(requestId)
    try {
      const { error } = await supabase
        .from('credential_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Request rejected",
      })
      fetchEmployerData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!employer) {
    return null
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="font-mono text-sm"
          >
            Log Out
          </Button>
        </div>

        <div className="mb-12">
          <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {employer.organization_name} Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Review and approve verification requests</p>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-mono text-xl font-bold text-foreground">Incoming Requests</h2>
            <span className="rounded-full border-2 border-border bg-primary px-3 py-1 font-mono text-sm font-bold text-primary-foreground">
              {requests.filter((r) => r.status === "pending").length}
            </span>
          </div>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-1 font-mono text-lg font-bold text-foreground">
                          {request.users?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.users?.email || 'No email provided'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" && (
                          <span className="flex items-center gap-1 rounded border-2 border-border bg-yellow-100 px-3 py-1 font-mono text-sm font-semibold text-yellow-900">
                            <Clock className="h-4 w-4" />
                            Pending
                          </span>
                        )}
                        {request.status === "approved" && (
                          <span className="flex items-center gap-1 rounded border-2 border-border bg-green-100 px-3 py-1 font-mono text-sm font-semibold text-green-900">
                            <Check className="h-4 w-4" />
                            Approved
                          </span>
                        )}
                        {request.status === "rejected" && (
                          <span className="flex items-center gap-1 rounded border-2 border-border bg-red-100 px-3 py-1 font-mono text-sm font-semibold text-red-900">
                            <X className="h-4 w-4" />
                            Denied
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 rounded-md border-2 border-border bg-muted/50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-muted-foreground">Position</span>
                        <span className="font-mono text-sm text-foreground">{request.role_title}</span>
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-muted-foreground">Period</span>
                        <span className="font-mono text-sm text-foreground">
                          {request.start_date} - {request.end_date || 'Present'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-muted-foreground">Requested</span>
                        <span className="font-mono text-sm text-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {request.proof_link && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-muted-foreground">Proof</span>
                          <a 
                            href={request.proof_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-sm text-blue-600 hover:underline"
                          >
                            View Link
                          </a>
                        </div>
                      )}
                    </div>

                    {request.status === "pending" && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleReject(request.request_id)}
                          disabled={processing === request.request_id}
                          variant="outline"
                          className="flex-1 border-2 border-border font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="mr-2 h-4 w-4" />
                          {processing === request.request_id ? 'Processing...' : 'Deny'}
                        </Button>
                        <Button
                          onClick={() => handleApprove(
                            request.request_id,
                            request.users?.wallet_address,
                            {
                              company_name: request.company_name,
                              role_title: request.role_title,
                              start_date: request.start_date,
                              end_date: request.end_date,
                            }
                          )}
                          disabled={processing === request.request_id}
                          className="flex-1 border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {processing === request.request_id ? 'Processing...' : 'Approve'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground font-mono">No pending requests at this time</p>
              <p className="text-sm text-muted-foreground mt-2">New verification requests will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
