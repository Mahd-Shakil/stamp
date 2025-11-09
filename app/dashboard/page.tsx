"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { StampCard } from "@/components/stamp-card"
import { AddStampDialog } from "@/components/add-stamp-dialog"
import { Plus, ArrowLeft, Upload, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [employers, setEmployers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    start_date: '',
    end_date: '',
    proof_link: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [parsingPdf, setParsingPdf] = useState(false)
  const [extractedExperiences, setExtractedExperiences] = useState<any[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [showExtracted, setShowExtracted] = useState(false)
  const [lastUploadTime, setLastUploadTime] = useState<number>(0)

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()

      if (userError || !userData) {
        router.push('/login')
        return
      }

      setUser(userData)

      // Fetch user's credentials
      const { data: credData, error: credError } = await supabase
        .from('credential_requests')
        .select('*')
        .eq('user_id', userData.user_id)
        .order('created_at', { ascending: false })

      if (!credError && credData) {
        setCredentials(credData)
      }

      // Fetch list of verified employers/companies
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('organization_name')
        .order('organization_name')

      if (!employerError && employerData) {
        setEmployers(employerData)
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    setSubmitting(true)

    try {
      const { data: result, error } = await supabase
        .from('credential_requests')
        .insert({
          user_id: user.user_id,
          company_name: data.company_name,
          role_title: data.role_title,
          start_date: data.start_date,
          end_date: data.end_date || null,
          proof_link: data.proof_link || null,
          status: 'pending',
        })
        .select()

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Verification request submitted successfully!",
        })
        setFormData({
          company_name: '',
          role_title: '',
          start_date: '',
          end_date: '',
          proof_link: '',
        })
        setIsDialogOpen(false)
        fetchUserData()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setParseError('File size must be less than 10MB')
      return
    }

    // Rate limiting: prevent rapid requests (5 second cooldown)
    const now = Date.now()
    const timeSinceLastUpload = now - lastUploadTime
    if (timeSinceLastUpload < 5000) {
      const waitTime = Math.ceil((5000 - timeSinceLastUpload) / 1000)
      setParseError(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before trying again. Free models have rate limits.`)
      e.target.value = ''
      return
    }

    setParsingPdf(true)
    setParseError(null)
    setExtractedExperiences([])
    setShowExtracted(false)
    setLastUploadTime(now)

    // Retry logic with exponential backoff
    const maxRetries = 2
    let retryCount = 0

    const attemptParse = async (): Promise<void> => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        // Check for rate limiting errors
        const errorMsg = data.error || 'Failed to parse PDF'
        if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('Provider returned error')) {
          if (retryCount < maxRetries) {
            retryCount++
            const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 2s, 4s
            setParseError(`Rate limited. Retrying in ${delay / 1000} seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return attemptParse()
          } else {
            throw new Error('Rate limit exceeded. Please wait a minute and try again, or enter the information manually.')
          }
        }
        throw new Error(errorMsg)
      }

      if (data.work_experiences && data.work_experiences.length > 0) {
        setExtractedExperiences(data.work_experiences)
        setShowExtracted(true)
      } else {
        setParseError('No work experience found in the resume. Please enter manually.')
      }
    }

    try {
      await attemptParse()
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse PDF. Please try again or enter manually.')
    } finally {
      setParsingPdf(false)
      // Reset file input
      e.target.value = ''
    }
  }

  function handleSelectExperience(experience: any) {
    // Try to match company name with existing employers (case-insensitive)
    let matchedCompany = experience.company_name || ''
    const employerNames = employers.map(e => e.organization_name)
    const matched = employerNames.find(
      name => name.toLowerCase() === matchedCompany.toLowerCase()
    )
    if (matched) {
      matchedCompany = matched
    }

    // Auto-fill form with selected experience
    setFormData({
      company_name: matchedCompany,
      role_title: experience.role_title || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      proof_link: formData.proof_link, // Keep existing proof link
    })
    setShowExtracted(false)
    setIsDialogOpen(true)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Convert credentials to stamp format
  const stamps = credentials.map((cred, index) => ({
    id: cred.request_id,
    company: cred.company_name,
    role: cred.role_title,
    period: `${cred.start_date} - ${cred.end_date || 'Present'}`,
    status: (cred.status === 'approved' ? 'verified' : 'pending') as "verified" | "pending",
    color: cred.status === 'approved' 
      ? ['from-yellow-400 to-amber-500', 'from-sky-300 to-blue-400', 'from-emerald-400 to-green-500'][index % 3]
      : 'from-slate-200 to-gray-300',
  }))

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

  if (!user) {
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Welcome, {user.name}!
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            Username: <span className="font-semibold">@{user.username}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Wallet: <span className="font-mono">{user.wallet_address}</span>
          </p>
        </div>

        {/* Public Profile Link */}
        <div className="mb-8 rounded-lg border-2 border-border bg-card p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-semibold text-foreground mb-2 font-mono">Your Public Profile:</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/vouch/${user.username}` : ''}
              className="flex-1 px-3 py-2 bg-input border-2 border-border rounded font-mono text-sm"
            />
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/vouch/${user.username}`)
                  toast({
                    title: "Success",
                    description: "Link copied to clipboard!",
                  })
                }
              }}
              className="border-2 border-border font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              Copy Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this link in your job applications!
          </p>
        </div>

        {/* Request Verification Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xl font-bold text-foreground">Request Verification</h2>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={parsingPdf}
                className="hidden"
                id="pdf-upload"
              />
              <Button
                asChild
                variant="outline"
                disabled={parsingPdf}
                className="border-2 border-border font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>
                  {parsingPdf ? (
                    <>⏳ Parsing...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume PDF
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* PDF Parse Error */}
          {parseError && (
            <div className="mb-4 rounded-lg border-2 border-border bg-card p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-mono text-foreground">{parseError}</p>
            </div>
          )}

          {/* Extracted Experiences */}
          {showExtracted && extractedExperiences.length > 0 && (
            <div className="mb-4 rounded-lg border-2 border-border bg-card p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-semibold text-foreground mb-3 font-mono">
                Found {extractedExperiences.length} work experience{extractedExperiences.length > 1 ? 's' : ''} in your resume:
              </p>
              <div className="space-y-2">
                {extractedExperiences.map((exp, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-border bg-background p-3 transition-all hover:border-foreground/50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground font-mono">{exp.role_title}</p>
                        <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSelectExperience(exp)}
                        size="sm"
                        className="ml-3 border-2 border-border font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Use This
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowExtracted(false)}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground underline font-mono transition-colors"
              >
                Or enter manually
              </button>
            </div>
          )}

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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono text-xl font-bold text-foreground">Your Stamps</h2>
            <Button
              onClick={fetchUserData}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-2 border-border font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {stamps.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stamps.map((stamp) => (
                <StampCard key={stamp.id} {...stamp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground font-mono">No credentials yet. Submit a verification request above!</p>
              <p className="text-sm text-muted-foreground mt-2">Once approved, your stamps will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <AddStampDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        employers={employers}
        initialData={formData}
        submitting={submitting}
      />
    </main>
  )
}
