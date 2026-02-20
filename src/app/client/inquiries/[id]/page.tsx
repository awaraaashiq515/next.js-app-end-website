"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Send, Loader2, MessageSquare, RefreshCw,
    Car, Phone, Building2, Calendar, Zap,
    ChevronDown, ChevronUp, Reply
} from "lucide-react"

interface ChatMessage {
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
    createdAt: string
    vehicle: { id: string; title: string; make: string; model: string; price: number; images: string }
    dealer: { name: string; businessName: string | null; city: string | null; mobile: string | null }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

const QUICK_QUESTIONS = [
    {
        category: "⭐ Popular(5)",
        questions: [
            "Is it still available?",
            "Let's meet up?",
            "What is the current location of the car?",
            "Could you share some pictures of the interiors?",
            "Are you a dealer or an owner?",
        ],
    },
    {
        category: "📄 RC(6)",
        questions: [
            "Where is the RC registered?",
            "Could you share the RC?",
            "Which RTO is it registered in?",
            "Is it registered under a company or an individual's name?",
            "When does the registration expire?",
            "Can you share the registration number?",
        ],
    },
    {
        category: "🚗 Car Condition(5)",
        questions: [
            "Is the car accidental?",
            "Is the colour original or repainted?",
            "How old is the battery?",
            "Are all parts original?",
            "Is the inspection report available?",
        ],
    },
    {
        category: "🛡️ Insurance(5)",
        questions: [
            "Is the car insured?",
            "What is the insured value?",
            "When does the insurance expire?",
            "Could you share the insurance details?",
            "Is the insurance zero depreciation?",
        ],
    },
    {
        category: "💳 Payment Mode(3)",
        questions: ["Cash payment?", "Card payment?", "Cheque payment?"],
    },
    {
        category: "📸 Photo(2)",
        questions: [
            "Could you share some pictures of the interiors?",
            "Could you share some pictures of the exteriors?",
        ],
    },
    {
        category: "👤 User(2)",
        questions: ["Are you a dealer or an owner?", "Any particular reason for selling?"],
    },
    {
        category: "⛽ Fuel Type(2)",
        questions: ["Is the fuel type petrol, diesel or CNG?", "Is the CNG registered or not?"],
    },
    {
        category: "📊 Mileage(2)",
        questions: ["What is the mileage?", "What is the average?"],
    },
    {
        category: "🔢 Km Run(2)",
        questions: ["How much has the car driven?", "What is the meter reading?"],
    },
    {
        category: "📋 Tax(2)",
        questions: ["Is the tax paid?", "When is the tax due?"],
    },
    {
        category: "🔄 Power Steering(2)",
        questions: ["Does it have a power steering?", "Does it have a power window?"],
    },
    {
        category: "📒 Service Record(2)",
        questions: ["Is the service history available?", "Is the car company serviced?"],
    },
    {
        category: "🔧 Tyre(2)",
        questions: ["Is the spare tyre available?", "How old are the tyres?"],
    },
    {
        category: "✅ Availability(1)",
        questions: ["Is it still available?"],
    },
    {
        category: "🤝 Meetings(1)",
        questions: ["Let's meet up?"],
    },
    {
        category: "📍 Location(1)",
        questions: ["What is the current location of the car?"],
    },
    {
        category: "👥 Old Ownership(1)",
        questions: ["Any old owners of the car?"],
    },
    {
        category: "🚘 Model(1)",
        questions: ["What is the model of the car?"],
    },
    {
        category: "🔖 Variant(1)",
        questions: ["What is the variant of the car?"],
    },
    {
        category: "📝 NOC or Transfer(1)",
        questions: ["Could you share the NOC of the car?"],
    },
    {
        category: "⚙️ Gear(1)",
        questions: ["Is it automatic or manual?"],
    },
    {
        category: "🎨 Colour(1)",
        questions: ["What is the colour?"],
    },
    {
        category: "🌅 Sunroof(1)",
        questions: ["Does it have sun roof?"],
    },
    {
        category: "🔒 Safety(1)",
        questions: ["Does it have airbags?"],
    },
]

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}
function formatDate(iso: string) {
    const d = new Date(iso)
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 86400000)
    if (diff === 0) return "Today"
    if (diff === 1) return "Yesterday"
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export default function ClientInquiryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [inquiry, setInquiry] = useState<Inquiry | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState("")
    const [sending, setSending] = useState(false)

    // Tab: "questions" | "offer"
    const [activeTab, setActiveTab] = useState<"questions" | "offer">("questions")
    const [openCategory, setOpenCategory] = useState<string | null>("⭐ Popular")
    const [offerPrice, setOfferPrice] = useState("")
    const [isPanelExpanded, setIsPanelExpanded] = useState(true)
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)

    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/client/vehicle-inquiries/${id}/messages`)
            const data = await res.json()
            if (data.messages) setMessages(data.messages)
        } catch { /* silent */ }
    }, [id])

    const fetchAll = useCallback(async () => {
        try {
            const res = await fetch(`/api/client/vehicle-inquiries/${id}`)
            if (res.status === 404) { router.push("/client/inquiries"); return }
            const data = await res.json()
            setInquiry(data.inquiry)
            setMessages(data.messages || [])
        } catch { /* silent */ }
        finally { setLoading(false) }
    }, [id, router])

    useEffect(() => {
        fetchAll()
        pollingRef.current = setInterval(() => fetchMessages(), 4000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [fetchAll, fetchMessages])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async (msg?: string, msgId?: string) => {
        const payload = (msg || text).trim()
        if (!payload || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/client/vehicle-inquiries/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: payload,
                    replyToId: msgId || replyTo?.id
                }),
            })
            if (res.ok) {
                if (!msg) setText("")
                setReplyTo(null)
                await fetchMessages()
            }
        } catch { /* silent */ }
        finally { setSending(false) }
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    // Group messages by date
    const groups: { date: string; msgs: ChatMessage[] }[] = []
    messages.forEach(m => {
        const d = formatDate(m.createdAt)
        const last = groups[groups.length - 1]
        if (last && last.date === d) last.msgs.push(m)
        else groups.push({ date: d, msgs: [m] })
    })

    let thumb = ""
    try { thumb = JSON.parse(inquiry?.vehicle.images || "[]")[0] || "" } catch { /* silent */ }
    const cfg = STATUS_CONFIG[inquiry?.status || "PENDING"]
    const isClosed = inquiry?.status === "CLOSED" || inquiry?.status === "SPAM"

    // ── Make Offer calculations ──────────────────────────────────────────
    const price = inquiry?.vehicle.price || 0
    const offerNum = parseInt(offerPrice.replace(/[^0-9]/g, "")) || 0
    const pct = price > 0 ? ((price - offerNum) / price) * 100 : 0

    let offerQuality = { label: "", color: "", bg: "", icon: "" }
    if (offerNum > 0) {
        if (offerNum >= price) {
            offerQuality = { label: "Full price offer!", color: "#4ade80", bg: "rgba(74,222,128,0.12)", icon: "✅" }
        } else if (pct <= 5) {
            offerQuality = { label: "Very good offer! High chances of seller's reply.", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: "😊" }
        } else if (pct <= 10) {
            offerQuality = { label: "Good offer! Seller may accept.", color: "#e8a317", bg: "rgba(232,163,23,0.12)", icon: "👍" }
        } else if (pct <= 20) {
            offerQuality = { label: "Fair offer. Seller might negotiate.", color: "#fb923c", bg: "rgba(251,146,60,0.12)", icon: "🤝" }
        } else {
            offerQuality = { label: "Low offer. Seller may not respond.", color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: "⚠️" }
        }
    }

    // Suggested price chips
    const s1 = price
    const s2 = Math.round(price * 0.90 / 1000) * 1000
    const s3 = Math.round(price * 0.85 / 1000) * 1000

    return (
        <div className="max-w-5xl mx-auto space-y-5 pb-12">
            <Link href="/client/inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}>
                <ArrowLeft className="w-4 h-4" /> Back to My Inquiries
            </Link>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full lg:h-[calc(100vh-160px)]">

                    {/* ── LEFT: Info panel ── */}
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
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0">Your Inquiry For</p>
                                    <p className="text-xs font-bold text-white truncate">{inquiry?.vehicle.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs font-bold" style={{ color: "#e8a317" }}>
                                    ₹{inquiry?.vehicle.price?.toLocaleString("en-IN")}
                                </span>
                                <Link href={`/cars/${inquiry?.vehicle.id}`} target="_blank"
                                    className="text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white"
                                    style={{ color: "#4b5563" }}>
                                    View Car
                                </Link>
                            </div>
                        </div>

                        {/* Inquiry Info */}
                        <div className="p-4 rounded-2xl space-y-2" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h4 className="text-xs font-semibold text-white">Inquiry Details</h4>
                                {cfg && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                                        {cfg.label}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs space-y-1.5" style={{ color: "#6b7080" }}>
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                    {inquiry && new Date(inquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                </p>
                                <p className="flex items-center gap-2 font-mono">
                                    <span style={{ color: "#374151" }}># {id.slice(-8).toUpperCase()}</span>
                                </p>
                            </div>
                            {inquiry?.message && (
                                <div className="px-4 py-3 rounded-xl text-xs italic" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "#9ca3af" }}>
                                    "{inquiry.message}"
                                </div>
                            )}
                        </div>

                        {/* Dealer Info */}
                        <div className="p-4 rounded-2xl space-y-2" style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <h4 className="text-xs font-semibold text-white">Dealer</h4>
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">
                                        {inquiry?.dealer.businessName || inquiry?.dealer.name}
                                    </p>
                                    {inquiry?.dealer.city && (
                                        <p className="text-[10px]" style={{ color: "#6b7080" }}>{inquiry.dealer.city}</p>
                                    )}
                                </div>
                            </div>
                            {inquiry?.dealer.mobile && (
                                <a href={`tel:${inquiry.dealer.mobile}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                    <Phone className="w-3.5 h-3.5" /> Call Dealer
                                </a>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Chat panel ── */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden h-full lg:h-full"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>

                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <MessageSquare className="w-5 h-5 flex-shrink-0" style={{ color: "#60a5fa" }} />
                            <span className="text-sm font-semibold text-white flex-1">Chat with Dealer</span>
                            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>
                                {messages.length} msg{messages.length !== 1 ? "s" : ""}
                            </span>
                            <button onClick={fetchMessages}
                                className="p-1.5 rounded-lg transition hover:bg-white/8" style={{ color: "#6b7080" }}>
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ backgroundColor: "#0d0f14" }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-16">
                                    <MessageSquare className="w-10 h-10 mb-3 text-gray-700" />
                                    <p className="text-sm text-gray-600">No messages yet.</p>
                                    <p className="text-xs mt-1 text-gray-700">Type a message or use the options below.</p>
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
                                            const isMe = msg.senderType === "CUSTOMER"
                                            const prev = group.msgs[i - 1]
                                            const sameSender = prev && prev.senderType === msg.senderType

                                            // OLX Offer Card Detection
                                            const isOffer = isMe && msg.message.startsWith("💰 I'd like to offer")
                                            const offerPriceMatch = isOffer ? msg.message.match(/₹([0-9,]+)/)?.[1] : null

                                            return (
                                                <div key={msg.id}
                                                    className={`group relative flex ${isMe ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-3"}`}>
                                                    {!isMe && !sameSender && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5 flex-shrink-0"
                                                            style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>
                                                            D
                                                        </div>
                                                    )}
                                                    {!isMe && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                                                    <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                        {!sameSender && (
                                                            <span className="text-[11px] mb-1 px-1"
                                                                style={{ color: isMe ? "#9ca3af" : "#e8a317" }}>
                                                                {isMe ? "You" : (inquiry?.dealer.businessName || inquiry?.dealer.name || "Dealer")}
                                                            </span>
                                                        )}

                                                        {/* Quoted Message */}
                                                        {msg.replyToId && (
                                                            <div className="mb-[-8px] px-3 py-2 rounded-t-xl bg-white/5 border border-white/10 border-b-0 max-w-full overflow-hidden"
                                                                style={{ borderLeft: (msg as any).replyToSenderType === "DEALER" ? "3px solid #e8a317" : "3px solid #3b82f6" }}>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest truncate"
                                                                    style={{ color: (msg as any).replyToSenderType === "DEALER" ? "#e8a317" : "#3b82f6" }}>
                                                                    {(msg as any).replyToSenderType === "DEALER" ? (inquiry?.dealer.businessName || inquiry?.dealer.name || "Dealer") : "You"}
                                                                </p>
                                                                <p className="text-[11px] text-gray-500 truncate">{(msg as any).replyToText}</p>
                                                            </div>
                                                        )}

                                                        {isOffer ? (
                                                            <div className="flex flex-col items-center overflow-hidden"
                                                                style={{ backgroundColor: "#1e3a8a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", borderTopLeftRadius: msg.replyToId ? "0" : "12px", borderTopRightRadius: msg.replyToId ? "0" : "12px" }}>
                                                                <div className="px-5 py-4 text-center space-y-1">
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 opacity-80">Your Offer</p>
                                                                    <p className="text-2xl font-black text-white">₹{offerPriceMatch}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setOfferPrice(offerPriceMatch || "")
                                                                        setActiveTab("offer")
                                                                    }}
                                                                    className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/10"
                                                                    style={{ borderTop: "1px solid rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", color: "#93c5fd" }}>
                                                                    Edit Offer
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                                                                style={isMe ? {
                                                                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                                                                    color: "#fff", borderBottomRightRadius: "4px",
                                                                    borderTopRightRadius: msg.replyToId ? "0" : "16px",
                                                                    borderTopLeftRadius: msg.replyToId ? "0" : "16px",
                                                                } : {
                                                                    backgroundColor: "#1a1d27", color: "#e5e7eb",
                                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                                    borderBottomLeftRadius: "4px",
                                                                    borderTopLeftRadius: msg.replyToId ? "0" : "16px",
                                                                    borderTopRightRadius: msg.replyToId ? "0" : "16px",
                                                                }}>
                                                                {msg.message}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1 px-1">
                                                            <span className="text-[10px] font-medium" style={{ color: "#374151" }}>
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Quick Reply Chips (New: Attached to Dealer Messages) */}
                                                        {!isMe && (
                                                            <div className="flex items-center gap-1.5 mt-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {["Is it still available?", "Can I see the RC?", "What's the price?"].map(reply => (
                                                                    <button
                                                                        key={reply}
                                                                        onClick={() => sendMessage(reply, msg.id)}
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

                                                        {/* Floating Reply Button (kept for general reply) */}
                                                        <button
                                                            onClick={() => {
                                                                setReplyTo(msg);
                                                                textareaRef.current?.focus();
                                                            }}
                                                            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full transition-all hover:bg-white/10 active:scale-95 opacity-20 group-hover:opacity-100 ${isMe ? "-left-12" : "-right-12"}`}
                                                            title="Reply">
                                                            <Reply className="w-4 h-4 text-gray-400 hover:text-[#3b82f6]" />
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

                        {/* ── Bottom panel ─────────────────────────────── */}
                        {!isClosed && (
                            <div className="flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                {/* Quick replies removed from here as per user request */}

                                {/* 2. Collapsible Tabs Section */}
                                {isPanelExpanded && (
                                    <div className="flex flex-col animate-in slide-in-from-bottom-2 duration-300">
                                        {/* Tab bar */}
                                        <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                            <button
                                                onClick={() => setActiveTab("questions")}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                                                style={activeTab === "questions" ? {
                                                    color: "#e8a317",
                                                    borderBottom: "2px solid #e8a317",
                                                    backgroundColor: "rgba(232,163,23,0.04)",
                                                } : { color: "#6b7080" }}>
                                                <Zap className="w-3.5 h-3.5" /> Questions
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("offer")}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                                                style={activeTab === "offer" ? {
                                                    color: "#10b981",
                                                    borderBottom: "2px solid #10b981",
                                                    backgroundColor: "rgba(16,185,129,0.04)",
                                                } : { color: "#6b7080" }}>
                                                💰 Make Offer
                                            </button>
                                        </div>

                                        {/* ── QUESTIONS TAB ── */}
                                        {activeTab === "questions" && (
                                            <div className="max-h-56 overflow-y-auto" style={{ backgroundColor: "#0a0c11" }}>
                                                {/* Category chips */}
                                                <div className="flex gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar"
                                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    {QUICK_QUESTIONS.map(cat => (
                                                        <button key={cat.category}
                                                            onClick={() => setOpenCategory(cat.category === openCategory ? null : cat.category)}
                                                            className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap"
                                                            style={openCategory === cat.category ? {
                                                                background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000",
                                                            } : {
                                                                backgroundColor: "rgba(255,255,255,0.04)", color: "#6b7080",
                                                            }}>
                                                            {cat.category.split(" ").slice(0, 2).join(" ")}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Questions for active category */}
                                                {openCategory && (() => {
                                                    const cat = QUICK_QUESTIONS.find(c => c.category === openCategory)
                                                    if (!cat) return null
                                                    return (
                                                        <div className="px-3 py-3 flex flex-wrap gap-2">
                                                            {cat.questions.map(q => (
                                                                <button key={q}
                                                                    onClick={() => {
                                                                        setText(q)
                                                                        textareaRef.current?.focus()
                                                                        setIsPanelExpanded(false)
                                                                    }}
                                                                    className="text-xs px-3 py-2.5 rounded-xl text-left transition-all hover:opacity-90 active:scale-95"
                                                                    style={{
                                                                        backgroundColor: "rgba(59,130,246,0.1)",
                                                                        color: "#93c5fd",
                                                                        border: "1px solid rgba(59,130,246,0.2)",
                                                                    }}>
                                                                    {q}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )
                                                })()}

                                                {!openCategory && (
                                                    <p className="text-xs text-center py-5" style={{ color: "#374151" }}>
                                                        Select a category above
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* ── MAKE OFFER TAB ── */}
                                        {activeTab === "offer" && (() => {
                                            // Find latest offer from me
                                            const latestOfferMsg = [...messages].reverse().find(m => m.senderType === "CUSTOMER" && m.message.startsWith("💰 I'd like to offer"))
                                            const latestOfferPrice = latestOfferMsg ? latestOfferMsg.message.match(/₹([0-9,]+)/)?.[1] : null

                                            if (latestOfferPrice && !offerPrice && !sending) {
                                                return (
                                                    <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-4" style={{ backgroundColor: "#0a0c11" }}>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6b7080" }}>Your Offer:</p>
                                                            <p className="text-3xl font-black text-white">₹{latestOfferPrice}</p>
                                                            <p className="text-xs" style={{ color: "#4b5563" }}>Waiting for seller's response</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setOfferPrice(latestOfferPrice)}
                                                            className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/5"
                                                            style={{ border: "1px solid #3b82f6", color: "#3b82f6" }}>
                                                            Edit offer
                                                        </button>
                                                    </div>
                                                )
                                            }

                                            // Suggested prices: listed, -10%, -15%
                                            const s1 = price
                                            const s2 = Math.round(price * 0.90 / 1000) * 1000
                                            const s3 = Math.round(price * 0.85 / 1000) * 1000

                                            return (
                                                <div className="px-4 py-4 space-y-3" style={{ backgroundColor: "#0a0c11" }}>
                                                    {/* Suggested price chips */}
                                                    <div className="flex gap-2 flex-wrap">
                                                        {[{ v: s1, label: "" }, { v: s2, label: "-10%" }, { v: s3, label: "-15%" }].map((item, i) => (
                                                            <button key={i}
                                                                onClick={() => setOfferPrice(item.v.toLocaleString("en-IN"))}
                                                                className="text-xs px-3 py-1.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95"
                                                                style={offerPrice === item.v.toLocaleString("en-IN") ? {
                                                                    background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
                                                                } : {
                                                                    backgroundColor: "rgba(255,255,255,0.06)", color: "#9ca3af",
                                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                                }}>
                                                                ₹{item.v.toLocaleString("en-IN")}
                                                                {item.label && <span className="ml-1 opacity-70">{item.label}</span>}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Large ₹ input */}
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black"
                                                            style={{ color: "#e8a317" }}>₹</span>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={offerPrice}
                                                            onChange={e => {
                                                                const raw = e.target.value.replace(/[^0-9]/g, "")
                                                                const num = parseInt(raw)
                                                                setOfferPrice(num ? num.toLocaleString("en-IN") : "")
                                                            }}
                                                            placeholder="0"
                                                            className="w-full pl-10 pr-4 py-4 rounded-xl text-2xl font-black text-white outline-none transition-all"
                                                            style={{
                                                                backgroundColor: "#111318",
                                                                border: "1px solid rgba(255,255,255,0.12)",
                                                                letterSpacing: "0.02em",
                                                            }}
                                                            onFocus={e => (e.currentTarget.style.borderColor = "#10b981")}
                                                            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                                                        />
                                                    </div>

                                                    {/* Offer quality indicator */}
                                                    {offerNum > 0 && (
                                                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                                            style={{ backgroundColor: offerQuality.bg }}>
                                                            <span className="text-xs font-semibold" style={{ color: offerQuality.color }}>
                                                                {offerQuality.icon} {offerQuality.label}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Send Offer button */}
                                                    <button
                                                        disabled={!offerNum || sending}
                                                        onClick={async () => {
                                                            if (!offerNum) return
                                                            const msg = `💰 I'd like to offer ₹${offerPrice} for this car. Is that acceptable?`
                                                            await sendMessage(msg)
                                                            setOfferPrice("")
                                                            setActiveTab("questions")
                                                            setIsPanelExpanded(false)
                                                        }}
                                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                                                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                                                        {sending
                                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                                            : <><Send className="w-4 h-4" /> Send Offer</>}
                                                    </button>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Closed notice */}
                        {isClosed && (
                            <div className="flex-shrink-0 px-5 py-3 text-center"
                                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                <p className="text-xs" style={{ color: "#4b5563" }}>
                                    This inquiry is {inquiry?.status === "CLOSED" ? "closed" : "marked as spam"}.
                                </p>
                            </div>
                        )}

                        {/* Reply Preview */}
                        {replyTo && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border-t border-white/10 animate-in slide-in-from-bottom-1 duration-200">
                                <div className="flex-1 min-w-0 border-l-4 border-[#3b82f6] pl-3 py-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#3b82f6]">
                                        Replying to {replyTo.senderType === "DEALER" ? (inquiry?.dealer.businessName || inquiry?.dealer.name || "Dealer") : "You"}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">{replyTo.message}</p>
                                </div>
                                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}

                        {/* Text input bar */}
                        {!isClosed && (
                            <div className="flex items-end gap-3 px-4 py-3 flex-shrink-0"
                                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                <button onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/5 active:scale-95"
                                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: isPanelExpanded ? "#e8a317" : "#6b7080" }}
                                    title="Quick Questions & Offers">
                                    {isPanelExpanded ? <ChevronDown className="w-5 h-5" /> : <Zap className="w-4 h-4" />}
                                </button>
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder={activeTab === "offer"
                                        ? "Or type a custom message…"
                                        : "Type a message or pick a question above…"}
                                    rows={1}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
                                    style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "100px" }}
                                    onInput={e => {
                                        const el = e.currentTarget
                                        el.style.height = "auto"
                                        el.style.height = el.scrollHeight + "px"
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />
                                <button onClick={() => sendMessage()} disabled={!text.trim() || sending}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff" }}>
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}
