import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"

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
      {/* Stamp content */}
      <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with company name and status */}
        <div
          className={`relative flex items-center justify-between bg-gradient-to-br ${color} px-6 py-4 text-foreground`}
        >
          <h3 className="font-mono font-bold">{company}</h3>
          <Badge
            variant={status === "verified" ? "default" : "secondary"}
            className="border-2 border-border bg-background/90 font-mono text-xs shadow-sm"
          >
            {status === "verified" ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </>
            ) : (
              <>
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </>
            )}
          </Badge>
        </div>

        {/* Body with role and period */}
        <div className="flex min-h-[160px] flex-col justify-between bg-card/50 p-6">
          <div>
            <p className="mb-2 font-mono font-semibold text-foreground">{role}</p>
            <p className="text-sm text-muted-foreground">{period}</p>
          </div>

          {/* Decorative verification mark */}
          <div className="mt-4 flex justify-end">
            <div className="rounded-full border-2 border-border bg-muted/50 p-3 shadow-sm">
              {status === "verified" ? (
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Clock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
