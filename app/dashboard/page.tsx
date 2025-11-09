"use client"

import { useState } from "react"
import { StampCard } from "@/components/stamp-card"
import { AddStampDialog } from "@/components/add-stamp-dialog"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

const mockStamps = [
  {
    id: "1",
    company: "Meta",
    role: "Software Engineer",
    period: "Jun 2020 - Jan 2023",
    status: "verified" as const,
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "2",
    company: "Google",
    role: "AI Engineer",
    period: "Feb 2023 - Present",
    status: "verified" as const,
    color: "from-sky-300 to-blue-400",
  },
  {
    id: "3",
    company: "Stanford University",
    role: "BS Computer Science",
    period: "2016 - 2020",
    status: "verified" as const,
    color: "from-emerald-400 to-green-500",
  },
  {
    id: "4",
    company: "Apple",
    role: "iOS Developer Intern",
    period: "Summer 2019",
    status: "pending" as const,
    color: "from-slate-200 to-gray-300",
  },
]

export default function UserDashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Your Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Manage your verification stamps</p>
        </div>

        {/* Request Verification Section */}
        <div className="mb-12">
          <h2 className="mb-4 font-mono text-xl font-bold text-foreground">Request Verification</h2>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="group flex w-full items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card p-8 transition-all hover:border-foreground/50 hover:bg-muted/50 sm:w-auto sm:px-12"
          >
            <div className="rounded-lg border-2 border-border bg-background p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-mono font-semibold text-foreground">Add New Stamp</p>
              <p className="text-sm text-muted-foreground">Request verification from a company</p>
            </div>
          </button>
        </div>

        {/* Stamps Collection */}
        <div>
          <h2 className="mb-6 font-mono text-xl font-bold text-foreground">Your Stamps</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockStamps.map((stamp) => (
              <StampCard key={stamp.id} {...stamp} />
            ))}
          </div>
        </div>
      </div>

      <AddStampDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </main>
  )
}
