"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Check,
    Car,
    Sparkles,
    Layers,
    ArrowRight,
    ShieldCheck,
    Zap,
    BarChart3,
    Package
} from "lucide-react"

interface DealerPackage {
    id: string
    name: string
    type: string
    description: string | null
    price: number
    durationDays: number
    maxVehicles: number
    maxFeaturedCars: number
    features: string | null
    isPopular: boolean
}

export default function DealerPackagesPage() {
    const router = useRouter()
    const [packages, setPackages] = useState<DealerPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeSubscription, setActiveSubscription] = useState<any>(null)

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/dealer/packages")
            if (res.ok) {
                const data = await res.json()
                setPackages(data.packages || [])
                setActiveSubscription(data.activeSubscription || null)
            } else {
                throw new Error("Failed to fetch packages")
            }
        } catch (err) {
            setError("Unable to load packages. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async (packageId: string) => {
        // Redirect to checkout page for payment
        router.push(`/dealer/packages/checkout/${packageId}`)
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container px-6 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
                    <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 uppercase">
                        Premium <span className="text-white">Dealer Plans</span>
                    </h1>
                    <p className="text-[#b0b0b0] text-lg max-w-2xl mx-auto">
                        Select the best plan to showcase your inventory and grow your business with The Garage ecosystem.
                    </p>
                </div>

                {/* Active Plan Banner */}
                {activeSubscription && (
                    <div className="mb-12 border border-white/10 rounded-3xl bg-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top duration-700">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#888] mb-1">Current Active Plan</p>
                                <h3 className="text-xl font-bold text-white">{activeSubscription.package.name}</h3>
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <p className="text-xs text-[#888] mb-1">Next Billing Date</p>
                            <p className="text-sm font-bold text-white">
                                {new Date(activeSubscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {packages.map((pkg, index) => (
                        <PackageCard
                            key={pkg.id}
                            packageData={pkg}
                            onSubscribe={handleSubscribe}
                            index={index}
                            isActive={activeSubscription?.packageId === pkg.id}
                        />
                    ))}
                </div>

                {/* Features Comparison or Trust Section */}
                <div className="border border-white/5 rounded-[2.5rem] bg-[#111] p-12 relative overflow-hidden animate-in fade-in zoom-in duration-700 delay-300">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck className="w-32 h-32 text-white" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="font-display text-3xl font-bold mb-4">Why upgrade?</h3>
                            <p className="text-sm text-[#888]">Experience the full power of our automotive platform.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-3 gap-8">
                            {[
                                { icon: Zap, title: "Instant Access", desc: "Start listing cars immediately after payment." },
                                { icon: BarChart3, title: "Rich Analytics", desc: "Track views and leads for your inventory." },
                                { icon: Layers, title: "Multi-Platform", desc: "Manage everything from mobile or desktop." }
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold mb-2">{item.title}</h4>
                                    <p className="text-xs text-[#888] leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PackageCard({
    packageData,
    onSubscribe,
    index,
    isActive
}: {
    packageData: DealerPackage,
    onSubscribe: (id: string) => void,
    index: number,
    isActive?: boolean
}) {
    const isVehicle = packageData.type === "VEHICLE"
    const isFeatured = packageData.type === "FEATURED"
    const isCombo = packageData.type === "COMBO"

    const features = JSON.parse(packageData.features || "[]")

    return (
        <div
            className={`group relative border rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 hover:scale-[1.02] ${isActive
                    ? "bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                    : packageData.isPopular
                        ? "bg-gradient-to-b from-[#111] to-[#0a0a0a] border-white/50 shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
                        : "bg-[#111] border-white/5 hover:border-white/10"
                } animate-in fade-in slide-in-from-bottom duration-700`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {isActive ? (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-black text-[10px] font-black uppercase tracking-[2px] px-6 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    Your Current Plan
                </div>
            ) : packageData.isPopular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white/20 text-white text-[10px] font-bold uppercase tracking-[2px] px-6 py-1.5 rounded-full backdrop-blur-md">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${isActive ? "bg-white text-black border-white" :
                        isVehicle ? "bg-white/5 border-white/10 text-white" :
                            isFeatured ? "bg-white/10 border-white/20 text-white" :
                                "bg-white border-white/10 text-black"
                    }`}>
                    {isVehicle && <Car className="w-7 h-7" />}
                    {isFeatured && <Sparkles className="w-7 h-7" />}
                    {isCombo && <Package className="w-7 h-7" />}
                </div>
                <h3 className="font-display text-3xl font-bold tracking-tight text-white mb-2">{packageData.name}</h3>
                <p className="text-sm text-[#888] min-h-[40px] leading-relaxed">{packageData.description}</p>
            </div>

            <div className="mb-8 p-6 bg-black/40 rounded-3xl border border-white/5">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white tracking-tighter">₹{packageData.price}</span>
                    <span className="text-sm text-[#888] font-medium uppercase tracking-widest">/Month</span>
                </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                        <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${isActive ? "bg-white text-black border-white" :
                                packageData.isPopular ? "bg-white/20 border-white/30 text-white" : "bg-white/5 border-white/10 text-white"
                            }`}>
                            <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-[#b0b0b0] group-hover/item:text-white transition-colors">{feature}</span>
                    </li>
                ))}

                {/* Limits Info */}
                <li className="pt-4 border-t border-white/5 mt-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#888]">Vehicle Limit</span>
                        <span className="text-white font-bold">{packageData.maxVehicles} Listings</span>
                    </div>
                </li>
            </ul>

            <button
                onClick={() => !isActive && onSubscribe(packageData.id)}
                disabled={isActive}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-[13px] flex items-center justify-center gap-2 transition-all duration-300 ${isActive
                        ? "bg-white/10 border border-white/20 text-white cursor-default opacity-80"
                        : packageData.isPopular
                            ? "bg-white text-black hover:bg-gray-200 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    }`}
            >
                {isActive ? "Currently Active" : "Choose Plan"} {!isActive && <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    )
}
