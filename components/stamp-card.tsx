import { Badge } from "@/components/ui/badge"

interface StampCardProps {
  company: string
  role: string
  period: string
  status: "verified" | "pending"
  color: string
}

export function StampCard({ company, role, period, status, color }: StampCardProps) {
  return (
    <div className="group relative">
      {/* Stamp perforations effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-x-0 top-0 flex h-4 justify-between px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`top-${i}`} className="h-4 w-4 rounded-full bg-background" />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-4 justify-between px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`bottom-${i}`} className="h-4 w-4 rounded-full bg-background" />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 flex w-4 flex-col justify-between py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`left-${i}`} className="h-4 w-4 rounded-full bg-background" />
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 flex w-4 flex-col justify-between py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`right-${i}`} className="h-4 w-4 rounded-full bg-background" />
          ))}
        </div>
      </div>

      {/* Stamp content */}
      <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-lg border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with status badge */}
        <div className="flex items-start justify-between border-b-2 border-border bg-muted/50 p-4">
          <Badge
            variant={status === "verified" ? "default" : "secondary"}
            className="border-2 border-border font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          >
            {status === "verified" ? "VERIFIED" : "PENDING"}
          </Badge>
        </div>

        {/* Body with role and period */}
        <div className="flex-1 p-6">
          <p className="mb-1 font-mono text-lg font-bold text-foreground">{company}</p>
          <p className="mb-2 font-mono text-sm font-semibold text-foreground">{role}</p>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>

        {/* Footer with stamp/seal */}
        <div className="flex justify-end border-t-2 border-border bg-muted/50 p-4">
          <div
            className={`h-16 w-16 rounded-full border-4 border-border bg-gradient-to-br ${color} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]`}
          />
        </div>
      </div>
    </div>
  )
}
