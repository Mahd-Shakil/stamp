import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
    return (
        <section className="bg-secondary/30 px-4 py-16 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="mb-4 font-mono text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    Blockchain Resume Verification
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
                    Get your work experience verified on the blockchain. Collect stamps for each approved credential.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="border-2 border-border bg-primary font-mono text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Link href="/dashboard">User Dashboard</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="border-2 border-border bg-card font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Link href="/employer">Company Dashboard</Link>
                    </Button>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>Verified on blockchain</span>
                    <span>•</span>
                    <span>Cryptographically signed</span>
                    <span>•</span>
                    <span>Instantly shareable</span>
                </div>
            </div>
        </section>
    )
}
