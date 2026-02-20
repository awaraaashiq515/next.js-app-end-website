"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/layout/navbar"
import {
    ChevronLeft, Share2, MapPin, Calendar, Gauge, Fuel, Zap,
    ShieldCheck, Activity, Wrench, CheckCircle2, Phone, MessageSquare,
    Send, Loader2, Play, Sparkles, Star, Eye, FileText, Download,
    Award, Shield, Cog, Droplets, Info
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WishlistButton } from "@/components/shared/WishlistButton"
import { EMICalculator } from "@/components/shared/EMICalculator"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [currentUser, setCurrentUser] = useState<{ name: string; mobile?: string } | null>(null)

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

        // Auto-detect logged in user
        fetch("/api/auth/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user && data.user.role === "CLIENT") {
                    setCurrentUser(data.user)
                    setInquiry(prev => ({
                        ...prev,
                        name: data.user.name || "",
                        mobile: data.user.mobile || "",
                    }))
                }
            })
            .catch(() => { })
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
        <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
        </div>
    )

    if (!vehicle) return (
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 font-bold">
            Asset not found
        </div>
    )

    const images = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
    const metadata = (() => { try { return JSON.parse(vehicle.metadata || '{}') } catch { return {} } })()

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6 px-1">
                            <Link href="/cars" className="hover:text-indigo-600 transition-colors">Inventory</Link>
                            <ChevronLeft className="w-3 h-3 rotate-180" />
                            <span className="text-slate-400">{vehicle.make}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-none">
                            {vehicle.title}
                        </h1>
                        <p className="text-lg font-medium text-slate-500 italic uppercase tracking-widest">{vehicle.variant || "Executive Limited"}</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-6">
                        <div className="flex items-center gap-6">
                            <div className="text-left md:text-right">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Retail Price</div>
                                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">₹{vehicle.price?.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="h-12 w-[1px] bg-slate-100 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <WishlistButton vehicleId={vehicle.id} variant="default" className="bg-white border-slate-200 shadow-sm hover:border-indigo-600 transition-all font-bold px-6 py-4" />
                                <button className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left Side: Media & Details */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Interactive Gallery */}
                        <div className="space-y-6">
                            <div className="relative aspect-[16/9] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
                                {images[activeImage] ? (
                                    <img src={images[activeImage]} alt={vehicle.title} className="w-full h-full object-cover transition-opacity duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 italic">No Media Available</div>
                                )}

                                {/* Premium Badges */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3">
                                    {vehicle.isFeatured && (
                                        <div className="px-5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5">
                                            <Award className="w-4 h-4" /> Premium Selection
                                        </div>
                                    )}
                                    {vehicle.pdiStatus === "Yes" && (
                                        <div className="px-5 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-xl">
                                            <ShieldCheck className="w-4 h-4" /> PDI Certified
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative w-28 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? "border-indigo-600 scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100"}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attribute Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: Calendar, label: "Model Year", value: vehicle.year },
                                { icon: Gauge, label: "Odometer", value: `${vehicle.mileage?.toLocaleString()} km` },
                                { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
                                { icon: Cog, label: "Transmission", value: vehicle.transmission },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</div>
                                    <div className="font-bold text-slate-900">{item.value || "N/A"}</div>
                                </div>
                            ))}
                        </div>

                        {/* Integrity Report */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-14 shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4 italic uppercase">
                                        Mechanical Integrity
                                    </h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Certified Diagnostic Report</p>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Certified 2026</div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                                {[
                                    { label: "Engine", grade: vehicle.engineGrade },
                                    { label: "Transmission", grade: vehicle.transmissionGrade },
                                    { label: "Exterior", grade: vehicle.exteriorGrade },
                                    { label: "Interior", grade: vehicle.interiorGrade },
                                ].map((g, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full border-[6px] border-slate-50 flex items-center justify-center text-2xl font-black text-slate-900 relative mb-5">
                                            {g.grade || "A"}
                                            <div className="absolute inset-[-6px] rounded-full border-t-[6px] border-indigo-600 rotate-[45deg]"></div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Extended Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 flex items-center gap-3 italic">
                                    <Zap className="w-4 h-4 text-indigo-600" /> System Health
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: "Tyre Life", val: vehicle.tyreLife || "85%" },
                                        { label: "Insurance", val: vehicle.insuranceStatus || "Valid" },
                                        { label: "Ownership", val: vehicle.owner || "1st Owner" },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
                                            <span className="text-sm font-bold text-slate-900">{s.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 flex items-center gap-3 italic">
                                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Documentation
                                </h3>
                                <div className="space-y-4">
                                    <div className={`p-5 rounded-2xl flex items-center justify-between border ${vehicle.rcAvailable === "Yes" ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">RC Status</span>
                                        </div>
                                        <span className="text-[10px] font-bold">{vehicle.rcAvailable === "Yes" ? "AVAILABLE" : "PENDING"}</span>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-400 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <Award className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Service History</span>
                                        </div>
                                        <span className="text-[10px] font-bold">DIGITAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Functional Modules */}
                        <div id="calculator-section">
                            <EMICalculator price={vehicle.price} className="!p-10 md:!p-14 !rounded-[2.5rem]" />
                        </div>
                    </div>

                    {/* Right Side: Action Console */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Summary Sticky */}
                        <div className="sticky top-12 space-y-8">

                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-all duration-700">
                                    <Sparkles className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-3">Final Offer</div>
                                    <div className="text-5xl font-black text-white mb-8 tracking-tighter italic">₹{vehicle.price?.toLocaleString('en-IN')}</div>

                                    <div className="space-y-5 mb-10 pb-10 border-b border-white/5">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            <span>Asset ID</span>
                                            <span className="text-white">#AV-{vehicle.id?.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            <span>Views</span>
                                            <span className="text-white flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {vehicle.views || 0}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20">
                                            Book Now
                                        </button>
                                        <p className="text-[9px] text-center text-white/30 uppercase tracking-widest font-medium">Terms apply</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inquiry Console */}
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-8 italic">Send Inquiry</h3>
                                {sent ? (
                                    <div className="text-center py-10 bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                                        <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Inquiry Sent!</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInquirySubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <input
                                                required
                                                placeholder="Your Name"
                                                value={inquiry.name}
                                                onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                            />
                                            <input
                                                required
                                                placeholder="Mobile Number"
                                                value={inquiry.mobile}
                                                onChange={e => setInquiry({ ...inquiry, mobile: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                            />
                                            <textarea
                                                placeholder="Message (Optional)..."
                                                rows={4}
                                                value={inquiry.message}
                                                onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none resize-none transition-all"
                                            />
                                        </div>
                                        <button
                                            disabled={sending}
                                            className="w-full py-5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Submit Inquiry
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Custodian Segment */}
                            <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 flex items-center gap-5">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100">
                                    <Award className="w-6 h-6 text-slate-300" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dealer Info</div>
                                    <div className="text-sm font-bold text-slate-900 lowercase italic line-clamp-1">{vehicle.dealer?.dealerBusinessName || vehicle.dealer?.name || "Enterprise"}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 md:hidden z-50 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                    Reserve Now
                </button>
                <button className="w-14 h-14 bg-slate-900 text-white border border-slate-900 rounded-2xl flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                </button>
            </div>

        </div>
    )
}
