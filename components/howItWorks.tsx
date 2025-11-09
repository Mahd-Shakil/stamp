import { UserPlus, Send, CheckCircle } from "lucide-react"

export default function HowItWorks() {
    const steps = [
        {
            number: "1",
            title: "Request a stamp",
            description: "Fill in your work experience or education details through our stamp builder",
            icon: UserPlus,
        },
        {
            number: "2",
            title: "Company verifies",
            description: "Your employer or institution receives the request and adds it to the blockchain",
            icon: Send,
        },
        {
            number: "3",
            title: "Collect & share",
            description: "Your verified stamp is added to your collection and shareable with recruiters",
            icon: CheckCircle,
        },
    ]

    return (
        <section className="bg-secondary/30 px-4 py-16 md:py-20">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                    <h2 className="mb-3 font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Getting started is easy
                    </h2>
                    <p className="text-balance text-lg text-muted-foreground">
                        Building your verified career collection in 3 simple steps
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="rounded-lg border-2 border-border bg-primary p-3 shadow-sm">
                                    <step.icon className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <span className="font-mono text-4xl font-bold text-muted-foreground/20">{step.number}</span>
                            </div>
                            <h3 className="mb-2 font-mono text-xl font-bold text-foreground">{step.title}</h3>
                            <p className="text-balance text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
