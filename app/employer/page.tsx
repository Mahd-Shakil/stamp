"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface VerificationRequest {
  id: string
  userName: string
  userEmail: string
  role: string
  period: string
  status: "pending" | "approved" | "denied"
  requestDate: string
}

const mockRequests: VerificationRequest[] = [
  {
    id: "1",
    userName: "Sarah Chen",
    userEmail: "sarah.chen@email.com",
    role: "Senior Software Engineer",
    period: "Mar 2021 - Dec 2023",
    status: "pending",
    requestDate: "2024-01-15",
  },
  {
    id: "2",
    userName: "Michael Rodriguez",
    userEmail: "m.rodriguez@email.com",
    role: "Product Manager",
    period: "Jun 2022 - Present",
    status: "pending",
    requestDate: "2024-01-14",
  },
  {
    id: "3",
    userName: "Emily Thompson",
    userEmail: "emily.t@email.com",
    role: "UI/UX Designer",
    period: "Jan 2020 - Aug 2022",
    status: "pending",
    requestDate: "2024-01-13",
  },
]

export default function CompanyDashboardPage() {
  const [requests, setRequests] = useState(mockRequests)

  const handleApprove = (id: string) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
  }

  const handleDeny = (id: string) => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: "denied" as const } : req)))
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Company Dashboard
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

          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="mb-1 font-mono text-lg font-bold text-foreground">{request.userName}</h3>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
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
                      {request.status === "denied" && (
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
                      <span className="font-mono text-sm text-foreground">{request.role}</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-muted-foreground">Period</span>
                      <span className="font-mono text-sm text-foreground">{request.period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-muted-foreground">Requested</span>
                      <span className="font-mono text-sm text-foreground">{request.requestDate}</span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleDeny(request.id)}
                        variant="outline"
                        className="flex-1 border-2 border-border font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
