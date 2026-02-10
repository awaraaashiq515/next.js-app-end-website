import { PDIRequestForm } from "@/components/pdi/request-form"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { CheckCircle2, Shield, Search, FileText, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

// Fetch packages (view only)
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

async function getPDIPackages() {
    return await db.package.findMany({
        where: { type: "PDI", status: "ACTIVE" },
        orderBy: { price: "asc" }
    })
}

export default async function PDIPage() {
    const user = await getCurrentUser()
    const packages = await getPDIPackages()

    return (
        <div className="min-h-screen bg-[#08090c] text-white">
            <Navbar />
            <div className="pt-20"> {/* Add padding for fixed navbar */}
                {/* Hero Section */}
                <div className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium">
                                <Shield className="w-4 h-4" />
                                <span>Professional Inspection Service</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                                Don't Buy a Lemon. <br />
                                <span className="text-amber-500">Inspect Before You Accept.</span>
                            </h1>
                            <p className="text-lg text-gray-400">
                                Our comprehensive Pre-Delivery Inspection (PDI) ensures your new car is flawless before you drive it home.
                                We check over 50+ points including paint, electricals, and mechanicals.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How it Works */}
                <div className="py-20 bg-[#111318] border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-3xl font-bold text-white">How PDI Works</h2>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">1. Submit Request</h3>
                                            <p className="text-gray-400 mt-2">Fill out the simple form below with your vehicle details and preferred location.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <Search className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">2. Expert Inspection</h3>
                                            <p className="text-gray-400 mt-2">Our qualified engineers visit the showroom and perform a rigorous 50+ point check.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">3. Get Detailed Report</h3>
                                            <p className="text-gray-400 mt-2">Receive a comprehensive report highlighting any issues, scratches, or defects instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Request Form */}
                            <div className="flex-1 w-full max-w-lg">
                                <PDIRequestForm user={user ? { name: user.name, email: user.email, mobile: (user as any).mobile } : undefined} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Packages Section (View Only) */}
                <div className="py-20 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">Transparent Pricing</h2>
                        <p className="text-gray-400 mt-4">Choose a package that suits your needs. (Viewing purposes only)</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {packages.length > 0 ? (
                            packages.map((pkg) => (
                                <div key={pkg.id} className="bg-[#111318] border border-white/10 rounded-2xl p-8 flex flex-col hover:border-amber-500/50 transition-colors group">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-amber-500">₹{pkg.price}</span>
                                            <span className="text-gray-500 text-sm">/ vehicle</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            <span>{pkg.pdiCount} Inspection{pkg.pdiCount > 1 ? 's' : ''}</span>
                                        </li>
                                        {/* Parse services description if it's JSON or string */}
                                        {/* Assuming description is plain text for now, or you can parse JSON if needed */}
                                        <li className="flex items-start gap-3 text-gray-300">
                                            <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>{pkg.description}</span>
                                        </li>
                                    </ul>

                                    <div className="mt-auto pt-6 border-t border-white/5 text-center">
                                        <span className="text-sm text-gray-500 italic">Selectable in future update</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 bg-[#111318] rounded-xl border border-white/5 border-dashed">
                                <p className="text-gray-500">No packages currently available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
