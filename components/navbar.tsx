import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 border-b border-border/40 bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="font-mono text-xl font-bold text-foreground">stamp.</span>
                    </Link>



                    {/* Right Side - Login & Register */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="font-mono text-sm">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="border-2 border-border bg-background font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <Link href="/register">Register</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
