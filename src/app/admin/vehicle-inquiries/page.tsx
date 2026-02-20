"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    MessageSquare, Phone, Calendar, Car, Search, Loader2,
    Building2, Clock, CheckCircle2, XCircle, Ban
} from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)", border: "#e8a317" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "#60a5fa" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "#4ade80" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "#f87171" },
}

export default function AdminVehicleInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")

    useEffect(() => {
        fetch("/api/admin/vehicle-inquiries")
            .then(r => r.json())
            .then(d => { if (d.inquiries) setInquiries(d.inquiries) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = inquiries.filter(inq => {
        const matchStatus = filterStatus === "ALL" || inq.status === filterStatus
        const q = search.toLowerCase()
        const matchSearch = !q || (
            inq.customerName?.toLowerCase().includes(q) ||
            inq.customerMobile?.includes(q) ||
            inq.vehicle?.title?.toLowerCase().includes(q) ||
            inq.dealer?.businessName?.toLowerCase().includes(q) ||
            inq.dealer?.name?.toLowerCase().includes(q)
        )
        return matchStatus && matchSearch
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Vehicle Inquiries</h1>
                <p className="text-sm" style={{ color: "#6b7080" }}>
                    All customer inquiries submitted on dealer vehicles — see chats, update status
                </p>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 flex-wrap">
                {[{ key: "ALL", label: "Total", color: "#9ca3af" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))].map(({ key, label, color }) => {
                    const count = key === "ALL" ? inquiries.length : inquiries.filter(i => i.status === key).length
                    const active = filterStatus === key
                    const cfg = STATUS_CONFIG[key]
                    return (
                        <button key={key} onClick={() => setFilterStatus(key)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={active ? {
                                backgroundColor: cfg?.bg || "rgba(255,255,255,0.1)",
                                color: cfg?.color || "#fff",
                                border: `1px solid ${cfg?.color || "rgba(255,255,255,0.3)"}`,
                            } : {
                                backgroundColor: "#111318", color: "#6b7080",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}>
                            {label}
                            <span className="ml-2 opacity-70">{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#444" }} />
                <input
                    type="text"
                    placeholder="Search customer, vehicle, dealer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none transition-all"
                    style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#e8a317")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#444" }}>Loading Inquiries...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 rounded-[2rem] border border-dashed" style={{ backgroundColor: "#111318", borderColor: "rgba(255,255,255,0.07)" }}>
                        <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1">No Inquiries Found</h3>
                        <p className="text-sm" style={{ color: "#444" }}>
                            {search || filterStatus !== "ALL" ? "Try adjusting filters." : "No vehicle inquiries have been received yet."}
                        </p>
                    </div>
                ) : (
                    filtered.map(inq => {
                        const images = (() => { try { return JSON.parse(inq.vehicle?.images || "[]") } catch { return [] } })()
                        const thumb = images[0] || null
                        const cfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.PENDING

                        return (
                            <div key={inq.id}
                                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                                style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>

                                {/* Thumbnail */}
                                <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center">
                                    {thumb ? (
                                        <img src={thumb} alt={inq.vehicle?.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Car className="w-5 h-5 text-gray-700" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                        <span className="text-sm font-semibold text-white">{inq.customerName}</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                            style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                                            {cfg.label}
                                        </span>
                                    </div>

                                    <p className="text-xs truncate" style={{ color: "#4b5563" }}>
                                        {inq.vehicle?.make} {inq.vehicle?.model} — {inq.vehicle?.title}
                                    </p>

                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-xs flex items-center gap-1" style={{ color: "#9ca3af" }}>
                                            <Phone className="w-3 h-3" /> {inq.customerMobile}
                                        </span>
                                        <span className="text-xs flex items-center gap-1" style={{ color: "#374151" }}>
                                            <Building2 className="w-3 h-3" />
                                            {inq.dealer?.businessName || inq.dealer?.name}
                                            {inq.dealer?.city ? ` · ${inq.dealer.city}` : ""}
                                        </span>
                                        <span className="text-[11px] flex items-center gap-1" style={{ color: "#374151" }}>
                                            <Calendar className="w-3 h-3" />
                                            {new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </span>
                                    </div>

                                    {inq.message && (
                                        <p className="text-xs italic truncate mt-0.5" style={{ color: "#374151" }}>
                                            "{inq.message}"
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0">
                                    <Link href={`/admin/vehicle-inquiries/${inq.id}`}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 whitespace-nowrap"
                                        style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        View Chat
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
