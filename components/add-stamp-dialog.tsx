"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface AddStampDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStampDialog({ open, onOpenChange }: AddStampDialogProps) {
  const [experienceType, setExperienceType] = useState<string>("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        {/* Perforated stamp edges around the dialog */}
        <div className="pointer-events-none absolute -left-4 top-0 bottom-0 z-50 flex flex-col justify-around">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`left-${i}`} className="h-5 w-5 rounded-full bg-background shadow-lg" />
          ))}
        </div>
        <div className="pointer-events-none absolute -right-4 top-0 bottom-0 z-50 flex flex-col justify-around">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`right-${i}`} className="h-5 w-5 rounded-full bg-background shadow-lg" />
          ))}
        </div>
        <div className="pointer-events-none absolute -top-4 left-0 right-0 z-50 flex justify-around">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`top-${i}`} className="h-5 w-5 rounded-full bg-background shadow-lg" />
          ))}
        </div>
        <div className="pointer-events-none absolute -bottom-4 left-0 right-0 z-50 flex justify-around">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`bottom-${i}`} className="h-5 w-5 rounded-full bg-background shadow-lg" />
          ))}
        </div>

        <DialogContent className="max-w-2xl border-4 border-border bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="font-mono text-2xl">Create Your Stamp</DialogTitle>
            <DialogDescription className="text-base">
              Fill in the details below to request verification for your work experience
            </DialogDescription>
          </DialogHeader>

          {/* Stamp preview at top */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute inset-x-0 top-0 flex h-3 justify-between px-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`preview-top-${i}`} className="h-3 w-3 rounded-full bg-background" />
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex h-3 justify-between px-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`preview-bottom-${i}`} className="h-3 w-3 rounded-full bg-background" />
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border-2 border-border bg-gradient-to-br from-primary/60 to-accent/60 p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="rounded-md border border-border bg-background/80 p-4 backdrop-blur-sm">
                <p className="text-center font-mono text-sm text-muted-foreground">
                  Your stamp preview will appear here
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-mono">
                Experience Type
              </Label>
              <Select value={experienceType} onValueChange={setExperienceType}>
                <SelectTrigger
                  id="type"
                  className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="border-2 border-border">
                  <SelectItem value="work">Work Experience</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="font-mono">
                Company / Institution
              </Label>
              <Input
                id="company"
                placeholder="e.g., Google, Stanford University"
                className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="font-mono">
                Role / Degree
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, BS Computer Science"
                className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-2 border-border p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-mono">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM yyyy") : "Present"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-2 border-border p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="Brief description of your role or achievements"
                className="border-2 border-border bg-input font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-border font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              Cancel
            </Button>
            <Button className="flex-1 border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              Request Verification
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  )
}
