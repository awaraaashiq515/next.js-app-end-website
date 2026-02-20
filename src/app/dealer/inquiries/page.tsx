"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare, User as UserIcon, Phone, Calendar, Car,
    ChevronRight, Search, Loader2, Clock, CheckCircle2, XCircle, Ban
} from "lucide-react"
import Link from "next/link"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

export default function DealerInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")

    useEffect(() => {
        fetch("/api/dealer/inquiries")
            .then(r => r.json())
            .then(d => { if (d.inquiries) setInquiries(d.inquiries) })
            .catch(e => console.error(e))
            .finally(() => setLoading(false))
    }, [])

    const filtered = inquiries.filter(inq => {
        const matchSearch = (
            inq.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.vehicle?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.customerMobile?.includes(searchTerm)
        )
        const matchStatus = filterStatus === "ALL" || inq.status === filterStatus
        return matchSearch && matchStatus
    })

    return (
        <div className="space-y-7 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Customer Inquiries</h1>
                <p className="text-sm" style={{ color: "#6b7080" }}>
                    Manage incoming leads — chat, call, and update status
                </p>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#444" }} />
                    <input
                        type="text"
                        placeholder="Search by name, vehicle or mobile..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none transition-all"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.1)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#e8a317")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {["ALL", ...Object.keys(STATUS_CONFIG)].map(s => {
                        const cfg = STATUS_CONFIG[s]
                        const active = filterStatus === s
                        return (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={active ? {
                                    backgroundColor: cfg?.bg || "rgba(255,255,255,0.1)",
                                    color: cfg?.color || "#fff",
                                    border: `1px solid ${cfg?.color || "rgba(255,255,255,0.2)"}`,
                                } : {
                                    backgroundColor: "#111318", color: "#6b7080",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}>
                                {s === "ALL" ? "All" : cfg?.label}
                                {s !== "ALL" && (
                                    <span className="ml-1.5 opacity-60">
                                        {inquiries.filter(i => i.status === s).length}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#444" }}>Loading Leads...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map(inquiry => {
                        const images = (() => { try { return JSON.parse(inquiry.vehicle?.images || "[]") } catch { return [] } })()
                        const thumb = images[0] || null
                        const cfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.PENDING

                        return (
                            <div key={inquiry.id}
                                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:border-white/12"
                                style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>

                                {/* Thumbnail */}
                                <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center">
                                    {thumb ? (
                                        <img src={thumb} alt={inquiry.vehicle?.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Car className="w-5 h-5 text-gray-700" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span className="text-sm font-semibold text-white truncate">{inquiry.customerName}</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <p className="text-xs truncate" style={{ color: "#4b5563" }}>
                                        {inquiry.vehicle?.title} · {inquiry.vehicle?.make} {inquiry.vehicle?.model}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <a href={`tel:${inquiry.customerMobile}`}
                                            className="text-xs flex items-center gap-1 transition-colors hover:text-[#e8a317]"
                                            style={{ color: "#6b7080" }}>
                                            <Phone className="w-3 h-3" /> {inquiry.customerMobile}
                                        </a>
                                        <span className="text-xs flex items-center gap-1" style={{ color: "#374151" }}>
                                            <Calendar className="w-3 h-3" />
                                            {new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                        </span>
                                    </div>
                                    {inquiry.message && (
                                        <p className="text-xs italic truncate mt-0.5" style={{ color: "#374151" }}>
                                            "{inquiry.message}"
                                        </p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                                    <a href={`tel:${inquiry.customerMobile}`}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                        style={{ backgroundColor: "rgba(74,222,128,0.12)", color: "#4ade80" }}>
                                        <Phone className="w-4 h-4" />
                                    </a>
                                    <Link href={`/dealer/inquiries/${inquiry.id}`}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                                        style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        View / Chat
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-24 rounded-[2rem] border border-dashed" style={{ backgroundColor: "#111318", borderColor: "rgba(255,255,255,0.08)" }}>
                        <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1">No Inquiries Found</h3>
                        <p className="text-sm" style={{ color: "#444" }}>
                            {searchTerm || filterStatus !== "ALL" ? "Try adjusting your search or filter." : "When customers enquire about your vehicles, they will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
