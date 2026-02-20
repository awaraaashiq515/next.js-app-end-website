"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    Car,
    ArrowUpDown,
    ChevronRight,
    Loader2,
    Eye,
    ShieldCheck,
    Award,
    MapPin,
    Zap,
    Fuel,
    Gauge,
    Calendar,
    MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { WishlistButton } from "@/components/shared/WishlistButton"
import AdvancedSearchPanel from "@/components/client/AdvancedSearchPanel"

export default function CarsPage() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchVehicles = useCallback((searchFilters?: Record<string, string>) => {
        setLoading(true)
        const raw: Record<string, string> = { type: "CAR", ...(searchFilters || {}) }
        // Strip empty values
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""))
        )
        fetch(`/api/vehicles?${params.toString()}`)
            .then(r => r.json())
            .then(data => setVehicles(data.vehicles || []))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchVehicles()
    }, [fetchVehicles])

    const featuredCars = vehicles.filter(v => v.isFeatured)
    const regularCars = vehicles.filter(v => !v.isFeatured)

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100">
            <Navbar />

            {/* Modern Ivory Header */}
            <header className="pt-28 pb-20 px-6 md:px-12 bg-zinc-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Official Inventory</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6">
                        Discover your <br />
                        <span className="text-zinc-400">perfect automobile.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl font-medium leading-relaxed">
                        Navigate through our curated selection of high-performance vehicles, each verified and documented for complete transparency.
                    </p>
                </div>
            </header>

            {/* Advanced Search Panel */}
            <section className="px-6 md:px-12 -mt-8 mb-20 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <AdvancedSearchPanel onSearch={fetchVehicles} />
                </div>
            </section>

            {/* Inventory List Section */}
            <main className="px-6 md:px-12 pb-32">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Featured Row */}
                    {featuredCars.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Featured Selection</h2>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mt-1">Handpicked Premium Assets</p>
                                </div>
                                <div className="hidden sm:block w-24 h-[1px] bg-zinc-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {featuredCars.map(vehicle => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} featured />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Standard List */}
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight italic">Our Collection</h2>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <ArrowUpDown className="w-3.5 h-3.5" /> Sort: Latest
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-zinc-200" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Building Inventory...</span>
                            </div>
                        ) : regularCars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {regularCars.map(vehicle => (
                                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-40 bg-zinc-50 border border-zinc-100 rounded-[2.5rem]">
                                <Car className="w-12 h-12 text-zinc-200 mx-auto mb-6 opacity-50" />
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">No matching vehicles</h3>
                                <p className="text-zinc-400 text-xs font-medium">Try different search terms or reset filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Minimalist Footer */}
            <footer className="py-20 px-6 md:px-12 border-t border-zinc-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <div className="text-xl font-bold tracking-tighter text-zinc-900 uppercase">
                            Listing<span className="text-zinc-300 italic">Garage</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300">Premium Automotive Network</p>
                    </div>
                    <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <Link href="/cars" className="hover:text-zinc-900 transition-colors">Inventory</Link>
                        <Link href="/dealer/vehicles/add" className="hover:text-zinc-900 transition-colors">Dealer Portal</Link>
                        <Link href="#" className="hover:text-zinc-900 transition-colors">Documentation</Link>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-300">© 2026 ListingGarage Enterprise</p>
                </div>
            </footer>
        </div>
    )
}

function VehicleCard({ vehicle, featured }: { vehicle: any, featured?: boolean }) {
    const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const thumb = imgs[0] || null

    return (
        <Link href={`/cars/${vehicle.id}`} className={`group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-zinc-100 transition-all duration-500 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/40 ${featured ? 'bg-zinc-50/30' : ''}`}>

            {/* Image Section */}
            <div className="h-64 relative overflow-hidden bg-zinc-100">
                {thumb ? (
                    <img src={thumb} alt={vehicle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Car className="w-16 h-16" />
                    </div>
                )}

                {/* Status Overlays */}
                <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                    {featured && (
                        <div className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-sm border border-zinc-200 text-zinc-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" /> High-End Selection
                        </div>
                    )}
                    {vehicle.pdiStatus === "Yes" && (
                        <div className="px-3 py-1 rounded-lg bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Certified PDI
                        </div>
                    )}
                </div>

                <div className="absolute top-5 left-5 z-20">
                    <WishlistButton vehicleId={vehicle.id} variant="icon" className="shadow-lg !bg-white/90" />
                </div>
            </div>

            {/* Professional Data Layout */}
            <div className="p-7 flex flex-col flex-1">

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight leading-tight group-hover:text-zinc-500 transition-colors">{vehicle.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        {vehicle.city || 'Regional Hub'}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-50">
                    <div className="text-2xl font-bold text-zinc-900 tracking-tight">₹{vehicle.price.toLocaleString('en-IN')}</div>
                    {vehicle.rcAvailable === "Yes" ? (
                        <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm transition-all hover:scale-105">RC Verified</div>
                    ) : (
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm transition-all hover:scale-105">RC Pending</div>
                    )}
                </div>

                {/* Spec Summary */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                        { icon: Calendar, val: vehicle.year, color: "text-amber-500", bg: "bg-amber-50/50" },
                        { icon: Fuel, val: vehicle.fuelType, color: "text-blue-500", bg: "bg-blue-50/50" },
                        { icon: Gauge, val: vehicle.mileage ? `${(vehicle.mileage / 1000).toFixed(0)}k km` : null, color: "text-emerald-500", bg: "bg-emerald-50/50" },
                        { icon: Zap, val: vehicle.transmission?.slice(0, 4), color: "text-purple-500", bg: "bg-purple-50/50" }
                    ].filter(b => b.val).map((bit, i) => (
                        <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 ${bit.bg} rounded-xl border border-zinc-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm hover:border-zinc-200`}>
                            <bit.icon className={`w-4 h-4 ${bit.color}`} />
                            <span className="text-xs font-bold text-zinc-700 uppercase tracking-tight">{bit.val}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">{vehicle.dealer.dealerBusinessName || vehicle.dealer.name || "Enterprise"}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                            <Eye className="w-3 h-3" />
                            {vehicle.views || 0}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 hover:shadow-md transition-all active:scale-95">
                            <MessageSquare className="w-4 h-4" /> Inquire
                        </button>
                        <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center group-hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </Link >
    )
}
