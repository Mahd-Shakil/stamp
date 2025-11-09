import Hero from "../components/hero"
import HowItWorks from "../components/howItWorks"
import Footer from '../components/footer'
export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Hero />
            <HowItWorks />
            <Footer />
        </main>
    )
}

