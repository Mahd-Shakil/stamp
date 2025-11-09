"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Hash } from "lucide-react"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            setIsLoading(false)
            return
        }

        if (!username || username.length < 3) {
            setError("Username must be at least 3 characters")
            setIsLoading(false)
            return
        }

        // Validate username format (alphanumeric and underscores only)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setError("Username can only contain letters, numbers, and underscores")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, username, email, password }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to register')
            }

            router.push('/dashboard')
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/20 to-secondary/30 p-4">
            <div className="w-full max-w-md">
                {/* Stamp-style card */}
                <div className="relative">
                    {/* Card content */}
                    <div className="relative rounded-lg border-4 border-border bg-card p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="mb-6 text-center">
                            <h1 className="font-mono text-3xl font-bold text-foreground">Create Account</h1>
                            <p className="mt-2 font-sans text-muted-foreground">Start collecting your verified stamps</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-mono flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="border-2 border-border bg-input font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="font-mono flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="johndoe"
                                    className="border-2 border-border bg-input font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                    disabled={isLoading}
                                    required
                                    minLength={3}
                                    pattern="[a-zA-Z0-9_]+"
                                />
                                <p className="text-xs text-muted-foreground font-sans">
                                    This will be your public profile URL: /vouch/{username || 'username'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-mono flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="border-2 border-border bg-input font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-mono flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="border-2 border-border bg-input font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                    disabled={isLoading}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-mono flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="border-2 border-border bg-input font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                    disabled={isLoading}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full border-2 border-border bg-primary font-mono text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground font-sans">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-mono font-semibold text-primary underline decoration-2 underline-offset-2 hover:text-primary/80"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-4 text-center">
                            <Link
                                href="/"
                                className="text-sm text-muted-foreground font-mono hover:text-foreground underline underline-offset-2"
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
