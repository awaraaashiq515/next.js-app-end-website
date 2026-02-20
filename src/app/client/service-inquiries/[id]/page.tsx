"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Loader2, MessageSquare, RefreshCw, Calendar, Clock } from "lucide-react"

interface ChatMessage {
    id: string
    senderType: string
    senderId: string
    message: string
    createdAt: string
}

interface Inquiry {
    id: string
    subject: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    IN_PROCESS: { label: "In Process", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    COMPLETED: { label: "Completed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    REJECTED: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
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

export default function ClientServiceInquiryDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [inquiry, setInquiry] = useState<Inquiry | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const fetchAll = useCallback(async (silent = false) => {
        try {
            const [inqRes, msgRes] = await Promise.all([
                fetch(`/api/client/service-inquiries/${id}`),
                fetch(`/api/client/service-inquiries/${id}/messages`),
            ])
            if (inqRes.status === 404) { router.push("/client/inquiries"); return }
            const inqData = await inqRes.json()
            const msgData = await msgRes.json()

            if (msgData.messages) setMessages(msgData.messages)
            if (!silent) {
                setInquiry(inqData.inquiry)
                setLoading(false)
            }
        } catch (e) {
            console.error(e)
            if (!silent) setLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        fetchAll()
        pollingRef.current = setInterval(() => fetchAll(true), 3000)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [fetchAll])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        if (!text.trim() || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/client/service-inquiries/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text.trim() }),
            })
            if (res.ok) {
                setText("")
                await fetchAll(true)
            }
        } catch (e) { console.error(e) }
        finally { setSending(false) }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
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

    const cfg = inquiry ? (STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.PENDING) : null

    return (
        <div className="max-w-5xl mx-auto space-y-5 pb-10">
            {/* Back */}
            <Link href="/client/inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}>
                <ArrowLeft className="w-4 h-4" />
                Back to My Inquiries
            </Link>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Inquiry Info */}
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl space-y-4"
                            style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-gray-500">
                                    Service Request
                                </span>
                                {cfg && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                                        {cfg.label}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">{inquiry?.subject}</h3>
                                <p className="text-sm mt-2 leading-relaxed" style={{ color: "#6b7080" }}>{inquiry?.description}</p>
                            </div>

                            <div className="pt-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="flex items-center justify-between text-xs">
                                    <span style={{ color: "#4b5563" }}>Submitted</span>
                                    <span className="text-gray-400 font-medium">{inquiry && formatDate(inquiry.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span style={{ color: "#4b5563" }}>Inquiry ID</span>
                                    <span className="text-gray-400 font-mono">#{id.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e8a317]/10 to-transparent border border-[#e8a317]/20">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#e8a317] mb-2">Support Note</h4>
                            <p className="text-xs leading-relaxed text-gray-400">
                                Our admin team is reviewing your inquiry. You will receive a response here in the chat.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Chat */}
                    <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)", minHeight: "600px" }}>

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-sm font-bold text-white flex-1">Support Chat</span>
                            <button onClick={() => fetchAll(true)} className="p-1.5 rounded-lg transition hover:bg-white/8 text-gray-500">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ backgroundColor: "#0d0f14" }}>
                            {groups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
                                    <MessageSquare className="w-12 h-12 mb-3" />
                                    <p className="text-sm font-bold">No messages yet</p>
                                </div>
                            ) : (
                                groups.map(group => (
                                    <div key={group.date}>
                                        <div className="flex items-center gap-3 my-6">
                                            <div className="flex-1 h-px bg-white/5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                                {group.date}
                                            </span>
                                            <div className="flex-1 h-px bg-white/5" />
                                        </div>

                                        {group.msgs.map((msg, i) => {
                                            const isMe = msg.senderType === "CLIENT"
                                            const prev = group.msgs[i - 1]
                                            const sameSender = prev && prev.senderType === msg.senderType

                                            return (
                                                <div key={msg.id}
                                                    className={`flex ${isMe ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-4"}`}>

                                                    {!isMe && !sameSender && (
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8a317] to-[#ff6b35] flex items-center justify-center text-[10px] font-bold text-black mr-2 mt-0.5 flex-shrink-0">
                                                            A
                                                        </div>
                                                    )}
                                                    {!isMe && sameSender && <div className="w-8 mr-2 flex-shrink-0" />}

                                                    <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                        {!sameSender && (
                                                            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 shadow-sm px-1"
                                                                style={{ color: isMe ? "#6b7080" : "#e8a317" }}>
                                                                {isMe ? "You" : "Admin"}
                                                            </span>
                                                        )}
                                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "rounded-br-none" : "rounded-bl-none"}`}
                                                            style={isMe ? {
                                                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                                                color: "#fff",
                                                            } : {
                                                                backgroundColor: "#1a1d27",
                                                                color: "#e5e7eb",
                                                                border: "1px solid rgba(255,255,255,0.06)",
                                                            }}>
                                                            {msg.message}
                                                        </div>
                                                        <span className="text-[10px] mt-1 text-gray-700 font-medium px-1">
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-end gap-3 bg-[#0a0c11] p-2 rounded-2xl border border-white/5">
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="flex-1 px-3 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none bg-transparent"
                                    onInput={e => {
                                        const el = e.currentTarget
                                        el.style.height = "auto"
                                        el.style.height = el.scrollHeight + "px"
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!text.trim() || sending}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#e8a317] text-black transition-all hover:opacity-90 disabled:opacity-30 disabled:grayscale"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}
