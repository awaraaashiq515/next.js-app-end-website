"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, Clock, ChevronRight, Loader2, Users, Filter } from "lucide-react"

interface Inquiry {
    id: string
    subject: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
    user: { id: string; name: string; email: string; mobile?: string }
    _count: { messages: number }
    messages: { message: string; senderType: string; createdAt: string }[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    IN_PROCESS: { label: "In Process", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    COMPLETED: { label: "Completed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    REJECTED: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
        </span>
    )
}

export default function AdminServiceInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("ALL")

    const statuses = ["ALL", "PENDING", "IN_PROCESS", "COMPLETED", "REJECTED"]

    useEffect(() => {
        const url = filter !== "ALL"
            ? `/api/admin/service-inquiries?status=${filter}`
            : "/api/admin/service-inquiries"
        fetch(url)
            .then(r => r.json())
            .then(d => setInquiries(d.inquiries || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [filter])

    const counts: Record<string, number> = { ALL: inquiries.length }
    inquiries.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Service Inquiries</h2>
                    <p className="text-sm" style={{ color: "#6b7080" }}>
                        Manage and respond to client inquiries.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Users className="w-4 h-4" style={{ color: "#60a5fa" }} />
                    <span className="text-sm font-semibold text-white">{inquiries.length}</span>
                    <span className="text-sm" style={{ color: "#6b7080" }}>total</span>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {statuses.map(s => {
                    const active = filter === s
                    const cfg = s !== "ALL" ? STATUS_CONFIG[s] : null
                    return (
                        <button
                            key={s}
                            onClick={() => { setLoading(true); setFilter(s) }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={active ? {
                                backgroundColor: cfg?.bg || "rgba(255,255,255,0.1)",
                                color: cfg?.color || "#fff",
                                border: `1px solid ${cfg?.color || "rgba(255,255,255,0.2)"}`,
                            } : {
                                backgroundColor: "#111318",
                                color: "#6b7080",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <Filter className="w-3 h-3" />
                            {s === "ALL" ? "All" : STATUS_CONFIG[s].label}
                            {counts[s] !== undefined && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                                    style={{ backgroundColor: active ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)" }}>
                                    {counts[s]}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Table / List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                </div>
            ) : inquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed"
                    style={{ backgroundColor: "#111318", borderColor: "rgba(255,255,255,0.08)" }}>
                    <MessageSquare className="w-10 h-10 mb-3 text-gray-700" />
                    <p className="text-sm text-gray-500">No inquiries found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map(inq => {
                        const lastMsg = inq.messages?.[0]
                        return (
                            <Link
                                key={inq.id}
                                href={`/admin/service-inquiries/${inq.id}`}
                                className="group flex items-center gap-4 p-5 rounded-2xl transition-all hover:translate-y-[-1px] block"
                                style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
                            >
                                {/* Client avatar */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                    {inq.user.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                        <span className="text-sm font-semibold text-white">{inq.user.name}</span>
                                        <StatusBadge status={inq.status} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-300 truncate">{inq.subject}</p>
                                    {lastMsg && (
                                        <p className="text-xs truncate mt-0.5" style={{ color: "#6b7080" }}>
                                            <span style={{ color: lastMsg.senderType === "ADMIN" ? "#e8a317" : "#9ca3af" }}>
                                                {lastMsg.senderType === "ADMIN" ? "You: " : `${inq.user.name}: `}
                                            </span>
                                            {lastMsg.message}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[11px] flex items-center gap-1" style={{ color: "#4b5563" }}>
                                            <Clock className="w-3 h-3" />
                                            {new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </span>
                                        {inq._count.messages > 0 && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                                {inq._count.messages} msg{inq._count.messages !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                        <span className="text-[11px] font-mono" style={{ color: "#374151" }}>
                                            #{inq.id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 flex-shrink-0 text-gray-700 group-hover:text-[#e8a317] group-hover:translate-x-1 transition-all" />
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
