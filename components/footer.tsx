import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="border-t-2 border-border bg-card px-4 py-12">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center">
                    <h2 className="mb-3 font-mono text-2xl font-bold text-foreground">Become an organizer?</h2>
                    <p className="mb-6 text-muted-foreground">Submit a ticket and we'll be in touch</p>
                    <Button
                        asChild
                        className="border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <a href="mailto:otishlau@gmail.com?subject=Looking%20to%20become%20an%20organizer">Join</a>
                    </Button>
                </div>
                <div className="border-t-2 border-border pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Built for hackathon • Blockchain-powered verification • © 2025
                    </p>
                </div>
            </div>
        </footer>
    )
}
