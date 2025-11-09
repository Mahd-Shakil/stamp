import Hero from "../components/hero"
import HowItWorks from "../components/howItWorks"
import Footer from '../components/footer'
import Navbar from '../components/navbar'
export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Footer />
        </main>
    )
}

