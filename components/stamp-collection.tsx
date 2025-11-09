"use client"

import { useState } from "react"
import { StampCard } from "@/components/stamp-card"
import { AddStampDialog } from "@/components/add-stamp-dialog"
import { Plus } from "lucide-react"

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

export function StampCollection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">Your Stamps</h2>
          <p className="text-balance text-lg text-muted-foreground">
            Each stamp represents a verified milestone in your career journey
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockStamps.map((stamp) => (
            <StampCard key={stamp.id} {...stamp} />
          ))}

          <button
            onClick={() => setIsDialogOpen(true)}
            className="group relative flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card p-6 transition-all hover:border-foreground/50 hover:bg-muted/50"
          >
            <div className="rounded-lg border-2 border-border bg-background p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]">
              <Plus className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-mono font-semibold text-foreground">Add stamp</p>
              <p className="text-sm text-muted-foreground">Request verification</p>
            </div>
          </button>
        </div>
      </div>

      <AddStampDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </section>
  )
}
