"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SubmitInquiryPage() {
    const router = useRouter()
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!subject.trim() || !description.trim()) {
            setError("Please fill in all fields.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/client/service-inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, description }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit")
            router.push("/client/inquiries")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            {/* Back */}
            <Link
                href="/client/inquiries"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: "#6b7080" }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Inquiries
            </Link>

            {/* Card */}
            <div
                className="p-8 rounded-2xl"
                style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div className="mb-7">
                    <h2 className="text-xl font-bold text-white mb-1">Submit New Inquiry</h2>
                    <p className="text-sm" style={{ color: "#6b7080" }}>
                        Describe your query or service request. Our team will respond as soon as possible.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Subject / Service Name
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. Vehicle PDI Inquiry, Insurance Question..."
                            maxLength={120}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "#0d0f14",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#e8a317")}
                            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your inquiry in detail..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none transition-all"
                            style={{
                                backgroundColor: "#0d0f14",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#e8a317")}
                            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {loading ? "Submitting..." : "Submit Inquiry"}
                    </button>
                </form>
            </div>
        </div>
    )
}
