'use client';

import type React from "react"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock } from "lucide-react"

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Login failed');

            const { data: employerData } = await supabase
                .from('employers')
                .select('*')
                .eq('auth_id', authData.user.id)
                .single();

            const redirectPath = employerData ? '/employer' : '/dashboard';
            router.push(redirectPath);

        } catch (error: any) {
            setError(error.message || 'Failed to log in');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary/30 to-accent/20 p-4">
            <div className="w-full max-w-md">
                <div className="relative">
                    <div className="relative rounded-lg border-4 border-border bg-card p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="mb-6 text-center">
                            <h1 className="font-mono text-3xl font-bold text-foreground">Welcome Back</h1>
                            <p className="mt-2 font-sans text-muted-foreground">Sign in to view your stamps</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    disabled={loading}
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
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full border-2 border-border bg-primary font-mono text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground font-sans">
                                {"Don't have an account? "}
                                <Link
                                    href="/signup"
                                    className="font-mono font-semibold text-primary underline decoration-2 underline-offset-2 hover:text-primary/80"
                                >
                                    Create one
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
