"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddStampDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  employers: any[]
  initialData?: {
    company_name: string
    role_title: string
    start_date: string
    end_date: string
    proof_link: string
  }
  submitting?: boolean
}

export function AddStampDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  employers,
  initialData,
  submitting = false
}: AddStampDialogProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    start_date: '',
    end_date: '',
    proof_link: '',
  })

  // Update form data when initialData changes (from PDF parsing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-4 border-border bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="font-mono text-2xl">Request Verification</DialogTitle>
            <DialogDescription className="text-base">
              Fill in the details below to request verification for your work experience
            </DialogDescription>
          </DialogHeader>

          {/* Stamp preview at top */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative overflow-hidden rounded-lg border-2 border-border bg-gradient-to-br from-primary/60 to-accent/60 p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="rounded-md border border-border bg-background/80 p-4 backdrop-blur-sm">
                {formData.company_name || formData.role_title ? (
                  <div className="text-center">
                    <p className="font-mono font-semibold text-foreground">{formData.company_name || 'Company'}</p>
                    <p className="font-mono text-sm text-muted-foreground">{formData.role_title || 'Role'}</p>
                  </div>
                ) : (
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    Your stamp preview will appear here
                  </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="font-mono">
                Company / Institution *
              </Label>
              <Select 
                value={formData.company_name} 
                onValueChange={(value) => setFormData({ ...formData, company_name: value })}
                required
              >
                <SelectTrigger
                  id="company"
                  className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  <SelectValue placeholder="Select a verified company..." />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  {employers.map((employer) => (
                    <SelectItem key={employer.organization_name} value={employer.organization_name}>
                      {employer.organization_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only verified companies are listed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="font-mono">
                Role / Degree *
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, BS Computer Science"
                className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="font-mono">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="font-mono">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave empty if current</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof" className="font-mono">
                Proof Link (Optional)
              </Label>
              <Input
                id="proof"
                type="url"
                placeholder="https://linkedin.com/..."
                className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                value={formData.proof_link}
                onChange={(e) => setFormData({ ...formData, proof_link: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                LinkedIn profile, screenshot, or other supporting evidence
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="flex-1 border-2 border-border font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="flex-1 border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Request Verification'}
              </Button>
            </div>
          </form>
        </DialogContent>
    </Dialog>
  )
}
