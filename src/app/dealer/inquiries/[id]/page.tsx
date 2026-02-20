"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Send, Loader2, MessageSquare, RefreshCw, Save,
    Phone, Car, Calendar, CheckCircle2, Ban, XCircle, Clock,
    ChevronDown, ChevronUp, Reply, Zap
} from "lucide-react"

interface Message {
    id: string
    senderType: string
    senderId: string
    message: string
    createdAt: string
}

interface Inquiry {
    id: string
    customerName: string
    customerMobile: string
    message: string | null
    status: string
    adminNotes: string | null
    createdAt: string
    vehicle: { id: string; title: string; make: string; model: string; price: number; images: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)", border: "#e8a317" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "#60a5fa" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "#4ade80" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "#f87171" },
}

const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock,
    CONTACTED: CheckCircle2,
    CLOSED: Ban,
    SPAM: XCircle,
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Today"
    if (diff === 1) return "Yesterday"
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function DealerInquiryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [inquiry, setInquiry] = useState<Inquiry | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState("")
    const [sending, setSending] = useState(false)
    const [newStatus, setNewStatus] = useState("PENDING")
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState("")
    const [replyTo, setReplyTo] = useState<Message | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const fetchMessages = useCallback(async (silent = false) => {
        try {
            const res = await fetch(`/api/dealer/inquiries/${id}/messages`)
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
        } catch { }
    }, [id])

    const fetchAll = useCallback(async () => {
        try {
            const res = await fetch(`/api/dealer/inquiries/${id}`)
            if (res.status === 404) { router.push("/dealer/inquiries"); return }
            const data = await res.json()
            setInquiry(data.inquiry)
            setMessages(data.messages || [])
            setNewStatus(data.inquiry?.status || "PENDING")
            setNotes(data.inquiry?.adminNotes || "")
        } catch { } finally { setLoading(false) }
    }, [id, router])

    useEffect(() => {
        fetchAll()
        pollingRef.current = setInterval(() => fetchMessages(true), 4000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [fetchAll, fetchMessages])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const saveStatus = async () => {
        setSaving(true); setSaveMsg("")
        try {
            const res = await fetch(`/api/dealer/inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, adminNotes: notes }),
            })
            if (!res.ok) throw new Error()
            setInquiry(prev => prev ? { ...prev, status: newStatus, adminNotes: notes } : prev)
            setSaveMsg("Saved!")
            setTimeout(() => setSaveMsg(""), 2500)
        } catch { setSaveMsg("Save failed") }
        finally { setSaving(false) }
    }

    const sendMessage = async (customMsg?: string, forceReplyId?: string) => {
        const payload = (customMsg || text).trim()
        if (!payload || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/dealer/inquiries/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: payload,
                    replyToId: forceReplyId || replyTo?.id
                }),
            })
            if (res.ok) {
                if (!customMsg) setText("")
                setReplyTo(null)
                await fetchMessages(true)
            }
        } catch { } finally { setSending(false) }
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    // Group messages by date
    const groups: { date: string; msgs: Message[] }[] = []
    messages.forEach(m => {
        const d = formatDate(m.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.date === d) last.msgs.push(m)
        else groups.push({ date: d, msgs: [m] })
    })

    let thumb = ""
    try { thumb = JSON.parse(inquiry?.vehicle.images || "[]")[0] || "" } catch { }

    const cfg = STATUS_CONFIG[inquiry?.status || "PENDING"]

    const [activeTab, setActiveTab] = useState<"questions" | "offer">("questions")
    const [openCategory, setOpenCategory] = useState<string | null>("⭐ Popular(5)")
    const [counterPrice, setCounterPrice] = useState("")
    const [isPanelExpanded, setIsPanelExpanded] = useState(true)

    const dealerCategories = [
        {
            name: "⭐ Popular(5)", questions: [
                "What is the current location of the car?",
                "Are you a dealer or an owner?",
                "Cash payment?",
                "Card payment?",
                "Cheque payment?"
            ]
        },
        {
            name: "💳 Payment Mode(3)", questions: [
                "Cash payment?",
                "Card payment?",
                "Cheque payment?"
            ]
        },
        {
            name: "📍 Location(1)", questions: [
                "What is the current location of the car?"
            ]
        },
        {
            name: "👤 User(1)", questions: [
                "Are you a dealer or an owner?"
            ]
        },
        {
            name: "🤝 Meetings(1)", questions: [
                "Would you like to book a test drive?"
            ]
        }
    ]

    const handleOfferAction = async (m: string, forceReplyId?: string) => {
        setSending(true)
        try {
            const latestCustomerMsg = [...messages].reverse().find(msg => msg.senderType === "CUSTOMER")
            const res = await fetch(`/api/dealer/inquiries/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: m,
                    replyToId: forceReplyId || latestCustomerMsg?.id
                }),
            })
            if (res.ok) { await fetchMessages(true) }
        } catch { } finally { setSending(false) }
    }

    // Input area + Tabs
    const renderBottomPanel = () => {
        // Find latest customer offer
        const latestOfferMsg = [...messages].reverse().find(m => m.senderType === "CUSTOMER" && m.message.startsWith("💰 I'd like to offer"))
        const latestOfferPrice = latestOfferMsg ? latestOfferMsg.message.match(/₹([0-9,]+)/)?.[1] : null

        return (
            <div className="flex flex-col flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Fixed bottom chips removed for consistency with client view */}

                {/* 2. Collapsible Tabs Section */}
                {isPanelExpanded && (
                    <div className="flex flex-col animate-in slide-in-from-bottom-2 duration-300">
                        {/* Tabs Header */}
                        <div className="flex bg-[#0a0c11]">
                            <button
                                onClick={() => setActiveTab("questions")}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "questions" ? "text-[#e8a317]" : "text-gray-500"}`}
                                style={{ borderBottom: activeTab === "questions" ? "2px solid #e8a317" : "1px solid rgba(255,255,255,0.07)" }}>
                                Questions
                            </button>
                            <button
                                onClick={() => setActiveTab("offer")}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === "offer" ? "text-[#e8a317]" : "text-gray-500"}`}
                                style={{ borderBottom: activeTab === "offer" ? "2px solid #e8a317" : "1px solid rgba(255,255,255,0.07)" }}>
                                Offer
                            </button>
                        </div>

                        {activeTab === "questions" && (
                            <div className="bg-[#0a0c11] border-b border-white/5">
                                {/* Categories Horizontal Scroll */}
                                <div className="flex gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar">
                                    {dealerCategories.map(cat => (
                                        <button
                                            key={cat.name}
                                            onClick={() => setOpenCategory(openCategory === cat.name ? null : cat.name)}
                                            className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all"
                                            style={openCategory === cat.name ? {
                                                backgroundColor: "rgba(232,163,23,0.15)", color: "#e8a317", border: "1px solid #e8a317"
                                            } : {
                                                backgroundColor: "rgba(255,255,255,0.04)", color: "#6b7080", border: "1px solid rgba(255,255,255,0.08)"
                                            }}>
                                            {cat.name.split("(")[0]}
                                        </button>
                                    ))}
                                </div>

                                {/* Questions for open category */}
                                {openCategory && (
                                    <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
                                        {dealerCategories.find(c => c.name === openCategory)?.questions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setText(q);
                                                    setIsPanelExpanded(false);
                                                }}
                                                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10 active:scale-95"
                                                style={{ backgroundColor: "#111318", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.08)" }}>
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "offer" && (
                            <div className="bg-[#0a0c11] p-4 space-y-4">
                                {latestOfferPrice ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Latest Client Offer</p>
                                                <p className="text-xl font-black text-white">₹{latestOfferPrice}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOfferAction(`✅ I accept your offer for ₹${latestOfferPrice}. Let's discuss the next steps.`)}
                                                    disabled={sending}
                                                    className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-green-500 text-black hover:bg-green-400 disabled:opacity-50">
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleOfferAction(`❌ I'm sorry, ₹${latestOfferPrice} is too low. Can you do a better price?`)}
                                                    disabled={sending}
                                                    className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-400 disabled:opacity-50">
                                                    Decline
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#e8a317]">₹</span>
                                            <input
                                                type="text"
                                                placeholder="Enter your counter offer..."
                                                value={counterPrice}
                                                onChange={e => {
                                                    const raw = e.target.value.replace(/[^0-9]/g, "")
                                                    const num = parseInt(raw)
                                                    setCounterPrice(num ? num.toLocaleString("en-IN") : "")
                                                }}
                                                className="w-full pl-8 pr-32 py-3 rounded-xl text-sm font-bold text-white outline-none"
                                                style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.1)" }}
                                            />
                                            <button
                                                disabled={!counterPrice || sending}
                                                onClick={() => {
                                                    handleOfferAction(`🤝 I would like to propose a counter offer of ₹${counterPrice}. What do you think?`)
                                                    setCounterPrice("")
                                                }}
                                                className="absolute right-2 top-1.5 bottom-1.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/10 disabled:opacity-30"
                                                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8a317" }}>
                                                Counter
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                                            <Clock className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">No Offers Yet</p>
                                            <p className="text-[10px] text-gray-500">Wait for the client to send a price offer.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Reply Preview */}
                {replyTo && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border-t border-white/10 animate-in slide-in-from-bottom-1 duration-200">
                        <div className="flex-1 min-w-0 border-l-4 border-[#e8a317] pl-3 py-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8a317]">
                                Replying to {replyTo.senderType === "CUSTOMER" ? inquiry?.customerName : "You"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{replyTo.message}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {/* 3. Main Text Input */}
                <div className="flex items-end gap-3 px-4 py-3 flex-shrink-0 bg-[#0d0f14]">
                    <button onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/5 active:scale-95"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", color: isPanelExpanded ? "#e8a317" : "#6b7080" }}>
                        {isPanelExpanded ? <ChevronDown className="w-5 h-5" /> : <Zap className="w-4 h-4" />}
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Type a message to the customer… (Enter to send)"
                        rows={1}
                        className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
                        style={{ backgroundColor: "#0a0c11", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "100px" }}
                        onInput={e => {
                            const el = e.currentTarget
                            el.style.height = "auto"
                            el.style.height = el.scrollHeight + "px"
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#e8a317")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                    />
                    <button onClick={() => sendMessage()} disabled={!text.trim() || sending}
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <Link href="/dealer/inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}>
                <ArrowLeft className="w-4 h-4" /> Back to Inquiries
            </Link>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full lg:h-[calc(100vh-160px)]">

                    {/* LEFT PANEL */}
                    <div className="space-y-4 lg:overflow-y-auto pr-1 custom-scrollbar">
                        {/* Vehicle card */}
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="relative aspect-video bg-black">
                                {thumb ? (
                                    <img src={thumb} alt={inquiry?.vehicle.title} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Car className="w-10 h-10 text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-2 left-3 right-3">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0">Inquiry For</p>
                                    <p className="text-xs font-bold text-white truncate">{inquiry?.vehicle.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs font-bold" style={{ color: "#e8a317" }}>
                                    ₹{inquiry?.vehicle.price?.toLocaleString("en-IN")}
                                </span>
                                <Link href={`/cars/${inquiry?.vehicle.id}`} target="_blank"
                                    className="text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white flex items-center gap-1"
                                    style={{ color: "#4b5563" }}>
                                    View Live
                                </Link>
                            </div>
                        </div>

                        {/* Customer info */}
                        <div className="p-4 rounded-2xl space-y-2" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                    {inquiry?.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">{inquiry?.customerName}</p>
                                    <p className="text-[10px]" style={{ color: "#4b5563" }}>
                                        <Calendar className="w-2.5 h-2.5 inline mr-1" />
                                        {inquiry && new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            <a href={`tel:${inquiry?.customerMobile}`}
                                className="flex items-center gap-2 w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                <Phone className="w-3.5 h-3.5" /> {inquiry?.customerMobile}
                            </a>

                            {inquiry?.message && (
                                <div className="px-3 py-2 rounded-xl text-xs italic" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#9ca3af" }}>
                                    "{inquiry.message}"
                                </div>
                            )}

                            {/* Current status badge */}
                            {cfg && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                    {cfg.label}
                                </div>
                            )}
                        </div>

                        {/* Status control */}
                        <div className="p-4 rounded-2xl space-y-3" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-xs font-semibold text-white">Update Status</h4>

                            <div className="grid grid-cols-2 gap-1.5">
                                {Object.entries(STATUS_CONFIG).map(([key, c]) => {
                                    const active = newStatus === key
                                    const Icon = STATUS_ICONS[key]
                                    return (
                                        <button key={key}
                                            onClick={() => setNewStatus(key)}
                                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                                            style={active ? {
                                                backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
                                            } : {
                                                backgroundColor: "rgba(255,255,255,0.03)", color: "#6b7080",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}>
                                            <Icon className="w-2.5 h-2.5" /> {c.label}
                                        </button>
                                    )
                                })}
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-white mb-1">Internal Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                    placeholder="Private notes..."
                                    rows={2}
                                    className="w-full px-2 py-1.5 rounded-lg text-[10px] text-white placeholder-gray-600 outline-none resize-none"
                                    style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>

                            <button onClick={saveStatus} disabled={saving}
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            {saveMsg && (
                                <p className="text-xs text-center" style={{ color: saveMsg === "Saved!" ? "#4ade80" : "#f87171" }}>
                                    {saveMsg}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Chat Panel */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden h-full lg:h-full"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>

                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <MessageSquare className="w-5 h-5 flex-shrink-0" style={{ color: "#60a5fa" }} />
                            <span className="text-sm font-semibold text-white flex-1">
                                Chat with {inquiry?.customerName}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                {messages.length} message{messages.length !== 1 ? "s" : ""}
                            </span>
                            <button onClick={() => fetchMessages(true)}
                                className="p-1.5 rounded-lg transition hover:bg-white/8" style={{ color: "#6b7080" }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ backgroundColor: "#0d0f14" }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <MessageSquare className="w-10 h-10 mb-3 text-gray-700" />
                                    <p className="text-sm text-gray-600">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                groups.map(group => (
                                    <div key={group.date}>
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                                            <span className="text-[11px] px-3 py-1 rounded-full"
                                                style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#4b5563" }}>
                                                {group.date}
                                            </span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                                        </div>

                                        {group.msgs.map((msg, i) => {
                                            const isDealer = msg.senderType === "DEALER"
                                            const prev = group.msgs[i - 1]
                                            const sameSender = prev && prev.senderType === msg.senderType

                                            // Detect Offer from Customer
                                            const isOfferFromCustomer = !isDealer && msg.message.startsWith("💰 I'd like to offer")
                                            const offerPriceMatch = isOfferFromCustomer ? msg.message.match(/₹([0-9,]+)/)?.[1] : null

                                            return (
                                                <div key={msg.id}
                                                    className={`group relative flex ${isDealer ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-3"}`}>
                                                    {!isDealer && !sameSender && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 flex-shrink-0"
                                                            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                                            {inquiry?.customerName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {!isDealer && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                                                    <div className={`max-w-[72%] flex flex-col ${isDealer ? "items-end" : "items-start"}`}>
                                                        {!sameSender && (
                                                            <span className="text-[11px] mb-1 px-1"
                                                                style={{ color: isDealer ? "#e8a317" : "#9ca3af" }}>
                                                                {isDealer ? "You" : inquiry?.customerName}
                                                            </span>
                                                        )}

                                                        {/* Quoted Message */}
                                                        {(msg as any).replyToId && (
                                                            <div className="mb-[-8px] px-3 py-2 rounded-t-xl bg-white/5 border border-white/10 border-b-0 max-w-full overflow-hidden"
                                                                style={{ borderLeft: (msg as any).replyToSenderType === "CUSTOMER" ? "3px solid #3b82f6" : "3px solid #e8a317" }}>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest truncate"
                                                                    style={{ color: (msg as any).replyToSenderType === "CUSTOMER" ? "#3b82f6" : "#e8a317" }}>
                                                                    {(msg as any).replyToSenderType === "CUSTOMER" ? inquiry?.customerName : "You"}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 truncate">{(msg as any).replyToText}</p>
                                                            </div>
                                                        )}

                                                        {isOfferFromCustomer ? (
                                                            <div className="flex flex-col items-center overflow-hidden"
                                                                style={{ backgroundColor: "#1e3a8a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", borderTopLeftRadius: (msg as any).replyToId ? "0" : "12px", borderTopRightRadius: (msg as any).replyToId ? "0" : "12px" }}>
                                                                <div className="px-5 py-4 text-center space-y-1">
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 opacity-80">OFFER RECEIVED</p>
                                                                    <p className="text-2xl font-black text-white">₹{offerPriceMatch}</p>
                                                                </div>
                                                                <div className="flex w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                                                                    <button
                                                                        onClick={() => handleOfferAction(`✅ I accept your offer for ₹${offerPriceMatch}. Let's discuss the next steps.`)}
                                                                        className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-green-500/20"
                                                                        style={{ color: "#4ade80", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOfferAction(`❌ I'm sorry, ₹${offerPriceMatch} is too low. Can you do a better price?`)}
                                                                        className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-red-500/20"
                                                                        style={{ color: "#f87171" }}>
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                                                style={isDealer ? {
                                                                    background: "linear-gradient(135deg, #e8a317, #d49510)",
                                                                    color: "#000", borderBottomRightRadius: "4px",
                                                                    borderTopRightRadius: (msg as any).replyToId ? "0" : "16px",
                                                                    borderTopLeftRadius: (msg as any).replyToId ? "0" : "16px",
                                                                } : {
                                                                    backgroundColor: "#1a1d27", color: "#e5e7eb",
                                                                    border: "1px solid rgba(255,255,255,0.06)", borderBottomLeftRadius: "4px",
                                                                    borderTopLeftRadius: (msg as any).replyToId ? "0" : "16px",
                                                                    borderTopRightRadius: (msg as any).replyToId ? "0" : "16px",
                                                                }}>
                                                                {msg.message}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1 px-1">
                                                            <span className="text-[10px] font-medium" style={{ color: "#374151" }}>
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Quick Reply Chips (Attached to Customer Messages) */}
                                                        {!isDealer && (
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {["Ok", "Yes It's Available", "Sorry! It's Sold"].map(reply => (
                                                                    <button
                                                                        key={reply}
                                                                        onClick={() => handleOfferAction(reply, msg.id)}
                                                                        className="whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:bg-white/10 active:scale-95"
                                                                        style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                                        {reply}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    onClick={() => {
                                                                        setReplyTo(msg);
                                                                        setIsPanelExpanded(true);
                                                                        setActiveTab("questions");
                                                                        textareaRef.current?.focus();
                                                                    }}
                                                                    className="whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:bg-white/10 flex items-center gap-1"
                                                                    style={{ backgroundColor: "rgba(232,163,23,0.08)", color: "#e8a317", border: "1px solid rgba(232,163,23,0.2)" }}>
                                                                    | Reply...
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Floating Reply Button */}
                                                        <button
                                                            onClick={() => {
                                                                setReplyTo(msg);
                                                                textareaRef.current?.focus();
                                                            }}
                                                            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:bg-white/10 active:scale-95 opacity-20 group-hover:opacity-100 ${isDealer ? "-left-12" : "-right-12"}`}
                                                            title="Reply">
                                                            <Reply className="w-4 h-4 text-gray-400 hover:text-[#e8a317]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Bottom Panel (Tabs + Input) */}
                        {renderBottomPanel()}
                    </div>
                </div>
            )}
        </div>
    )
}
