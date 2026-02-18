"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    ChevronLeft, Share2, MapPin, Calendar, Gauge, Fuel, Zap,
    ShieldCheck, Activity, Wrench, CheckCircle2, Phone, MessageSquare,
    Send, Loader2, Play, Sparkles, Star
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)

    // Inquiry Form State
    const [inquiry, setInquiry] = useState({ name: "", mobile: "", message: "" })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        fetch(`/api/vehicles/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.vehicle) setVehicle(data.vehicle)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [id])

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleId: id,
                    customerName: inquiry.name,
                    customerMobile: inquiry.mobile,
                    message: inquiry.message
                })
            })
            if (res.ok) setSent(true)
        } catch (error) {
            console.error("Inquiry failed", error)
        } finally {
            setSending(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#e8a317]" />
        </div>
    )

    if (!vehicle) return (
        <div className="min-h-screen bg-[#08090c] flex items-center justify-center text-white">
            Vehicle not found
        </div>
    )

    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const metadata = (() => { try { return JSON.parse(vehicle.metadata || '{}') } catch { return {} } })()
    const safetyFeatures = metadata.safetyFeatures || []
    const comfortFeatures = metadata.comfortFeatures || []

    return (
        <div className="min-h-screen bg-[#08090c] text-white selection:bg-[#e8a317] selection:text-black">
            <Navbar />

            <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: Media & Details */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#555]">
                        <Link href="/cars" className="hover:text-white transition-colors">Inventory</Link>
                        <ChevronLeft className="w-3 h-3 rotate-180" />
                        <span className="text-[#e8a317]">{vehicle.make} {vehicle.model}</span>
                    </div>

                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                            {images[activeImage] ? (
                                <img src={images[activeImage]} alt={vehicle.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#333]">No Image</div>
                            )}
                            <div className="absolute top-6 right-6">
                                {vehicle.isFeatured && (
                                    <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#e8a317]/30 text-[#e8a317] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#e8a317] animate-pulse"></span>
                                        Premium Selection
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setActiveImage(idx)}
                                    className={`relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden border transition-all ${activeImage === idx ? "border-[#e8a317]" : "border-white/10 opacity-60 hover:opacity-100"}`}>
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Calendar, label: "Year", value: vehicle.year },
                            { icon: Gauge, label: "Mileage", value: `${vehicle.mileage?.toLocaleString()} km` },
                            { icon: Fuel, label: "Fuel", value: vehicle.fuelType },
                            { icon: Zap, label: "Trans", value: vehicle.transmission },
                        ].map((item, i) => (
                            <div key={i} className="bg-[#111] p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                                <item.icon className="w-5 h-5 text-[#e8a317]" />
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#555]">{item.label}</div>
                                    <div className="font-bold text-sm mt-1">{item.value || "N/A"}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mechanical Pulse (Grading) */}
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-64 h-64" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                                <span className="w-8 h-1 bg-[#e8a317]"></span>
                                Mechanical Pulse
                            </h2>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-[#555]">
                                Diagnostic Report
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                            {[
                                { label: "Engine", grade: vehicle.engineGrade },
                                { label: "Transmission", grade: vehicle.transmissionGrade },
                                { label: "Exterior", grade: vehicle.exteriorGrade },
                                { label: "Interior", grade: vehicle.interiorGrade },
                            ].map((g, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full border-4 border-[#e8a317]/20 flex items-center justify-center text-2xl font-black relative mb-4 shadow-[0_0_30px_rgba(232,163,23,0.1)]">
                                        {g.grade || "-"}
                                        <div className="absolute inset-0 rounded-full border-t-4 border-[#e8a317] rotate-45"></div>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#888]">{g.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hardware Health & Safety */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Hardware Pulse */}
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#444] mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#e8a317]" /> Hardware Pulse
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#666] mb-2">
                                        <span>Tyre Life remaining</span>
                                        <span className="text-white">{vehicle.tyreLife || "N/A"}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#e8a317] rounded-full transition-all duration-1000"
                                            style={{ width: vehicle.tyreLife?.includes('%') ? vehicle.tyreLife.split('(')[1]?.replace(')', '') : '50%' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-xs font-bold text-[#888]">Battery Status</span>
                                    <span className="px-3 py-1 rounded-lg bg-[#e8a317]/10 text-[#e8a317] text-[10px] font-black uppercase tracking-widest">
                                        {vehicle.batteryStatus || "Good"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Safety Integrity */}
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#444] mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#e8a317]" /> Safety Integrity
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`flex items-center justify-between p-4 rounded-2xl border ${vehicle.accidentFree ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                                    <span className="text-xs font-bold text-[#888]">Accident History</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${vehicle.accidentFree ? "text-green-500" : "text-red-500"}`}>
                                        {vehicle.accidentFree ? "Accident Free" : "Reported Issues"}
                                    </span>
                                </div>
                                <div className={`flex items-center justify-between p-4 rounded-2xl border ${!vehicle.floodAffected ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                                    <span className="text-xs font-bold text-[#888]">Flood Damage</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${!vehicle.floodAffected ? "text-green-500" : "text-red-500"}`}>
                                        {!vehicle.floodAffected ? "Non-Affected" : "Flood Affected"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Documentation Registry */}
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#444] mb-8 flex items-center gap-2">
                            Documentation Registry
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: "RTO Location", value: vehicle.rtoLocation, icon: MapPin },
                                { label: "Spare Key", value: vehicle.spareKey, icon: Zap },
                                { label: "Last Service", value: vehicle.lastServiceDate ? `${new Date(vehicle.lastServiceDate).toLocaleDateString()} (${vehicle.lastServiceKM} KM)` : "N/A", icon: Wrench },
                                { label: "Insurance", value: vehicle.insuranceCompany || "N/A", icon: ShieldCheck },
                                { label: "Ins. Expiry", value: vehicle.insuranceExpiry || "N/A", icon: Calendar },
                                { label: "Service Count", value: vehicle.serviceCount ? `${vehicle.serviceCount} Records` : "N/A", icon: Activity },
                            ].map((doc, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <doc.icon className="w-4 h-4 text-[#e8a317]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] mb-1">{doc.label}</p>
                                        <p className="text-xs font-bold text-white">{doc.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium Features & Comfort */}
                    {(safetyFeatures.length > 0 || comfortFeatures.length > 0) && (
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#444] mb-8 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#e8a317]" /> Premium Features
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {safetyFeatures.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-4">Safety</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {safetyFeatures.map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {comfortFeatures.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-4">Comfort & Luxury</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {comfortFeatures.map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Modification Registry */}
                    {vehicle.modifications && (
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8">
                            <h2 className="text-xl font-black uppercase tracking-widest italic mb-8 flex items-center gap-3">
                                <span className="w-8 h-1 bg-white"></span>
                                Modification Registry
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {(() => {
                                    try {
                                        const mods = JSON.parse(vehicle.modifications)
                                        return Array.isArray(mods) && mods.length > 0 ? mods.map((m: string, i: number) => (
                                            <span key={i} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-[#e8a317]"></div>
                                                {m}
                                            </span>
                                        )) : <p className="text-xs text-[#444] font-bold uppercase tracking-widest">No Bespoke Modifications Registered</p>
                                    } catch { return null }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Professional Description */}
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#444] mb-6">Expert Evaluation</h3>
                        <p className="text-[#888] leading-[1.8] text-sm font-medium">{vehicle.description || "No expert evaluation provided for this premium listing."}</p>
                    </div>

                </div>

                {/* RIGHT COLUMN: Action & Inquiry */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Price Card */}
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8a317]/10 blur-[50px] rounded-full"></div>
                        <h1 className="text-3xl font-bold mb-2">{vehicle.title}</h1>
                        <p className="text-[#666] text-sm uppercase font-bold tracking-widest mb-8">{vehicle.variant || "Standard Edition"}</p>

                        <div className="text-4xl font-black text-[#e8a317] mb-2">₹{vehicle.price?.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-[#555] font-bold uppercase tracking-widest mb-8">Ex-Showroom / Fixed Price</p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#666]">Location</span>
                                <span className="text-sm font-bold">{vehicle.city}, {vehicle.state}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#666]">Ownership</span>
                                <span className="text-sm font-bold">{vehicle.ownerType || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div className="bg-white text-black rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Make an Offer</h3>

                        {!sent ? (
                            <form onSubmit={handleInquirySubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-1.5 block">Your Name</label>
                                    <input
                                        type="text" required
                                        value={inquiry.name} onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                                        className="w-full bg-[#f4f4f4] border-0 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-black placeholder:text-[#aaa]"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-1.5 block">Mobile Number</label>
                                    <input
                                        type="tel" required
                                        value={inquiry.mobile} onChange={e => setInquiry({ ...inquiry, mobile: e.target.value })}
                                        className="w-full bg-[#f4f4f4] border-0 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-black placeholder:text-[#aaa]"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-1.5 block">Message (Optional)</label>
                                    <textarea
                                        value={inquiry.message} onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                                        className="w-full bg-[#f4f4f4] border-0 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-black placeholder:text-[#aaa] resize-none"
                                        rows={3}
                                        placeholder="I'm interested in this car..."
                                    />
                                </div>
                                <button type="submit" disabled={sending} className="w-full bg-[#e8a317] hover:bg-[#d69615] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#e8a317]/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Inquiry</>}
                                </button>
                                <p className="text-[10px] text-center text-[#888] font-medium leading-relaxed">
                                    By clicking send, you agree to share your contact details with the verified dealer.
                                </p>
                            </form>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black mb-2">Request Sent!</h4>
                                <p className="text-sm text-[#666] mb-6">The dealer has been notified and will contact you shortly.</p>
                                <button onClick={() => setSent(false)} className="text-xs font-bold uppercase underline">Send another</button>
                            </div>
                        )}
                    </div>

                    {/* Dealer Info */}
                    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-[#e8a317]" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#555]">Sold By</div>
                            <div className="font-bold text-white">{vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name || "Verified Dealer"}</div>
                            <div className="text-xs text-[#888] flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {vehicle.dealer?.dealerCity || "Indore"}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
