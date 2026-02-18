"use client"

import { useState, useEffect } from "react"
import {
    User,
    Building2,
    MapPin,
    Wallet,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Smartphone,
    Info
} from "lucide-react"

export default function DealerSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        dealerBusinessName: "",
        dealerGstNumber: "",
        dealerCity: "",
        dealerState: "",
        dealerBankName: "",
        dealerAccountNum: "",
        dealerIfscCode: "",
        upiId: ""
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/dealer/profile")
            if (res.ok) {
                const data = await res.json()
                if (data.dealer) {
                    setFormData({
                        name: data.dealer.name || "",
                        email: data.dealer.email || "",
                        mobile: data.dealer.mobile || "",
                        dealerBusinessName: data.dealer.dealerBusinessName || "",
                        dealerGstNumber: data.dealer.dealerGstNumber || "",
                        dealerCity: data.dealer.dealerCity || "",
                        dealerState: data.dealer.dealerState || "",
                        dealerBankName: data.dealer.dealerBankName || "",
                        dealerAccountNum: data.dealer.dealerAccountNum || "",
                        dealerIfscCode: data.dealer.dealerIfscCode || "",
                        upiId: data.dealer.upiId || ""
                    })
                }
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/dealer/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" })
            } else {
                const data = await res.json()
                throw new Error(data.error || "Failed to update profile")
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Something went wrong" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-12">
                <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2 uppercase">
                    Account <span className="text-white">Settings</span>
                </h1>
                <p className="text-[#888] text-sm">Manage your business details and bank information.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Business Details */}
                <section className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-white" /> Business Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Business / Agency Name</label>
                            <input
                                name="dealerBusinessName"
                                value={formData.dealerBusinessName}
                                onChange={handleChange}
                                placeholder="Super Cars Pvt Ltd"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">GST Number</label>
                            <input
                                name="dealerGstNumber"
                                value={formData.dealerGstNumber}
                                onChange={handleChange}
                                placeholder="22AAAAA0000A1Z5"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Contact Person Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Mobile Number</label>
                            <input
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Email Address (Read Only)</label>
                            <input
                                value={formData.email}
                                disabled
                                className="w-full bg-black/10 border border-white/5 rounded-2xl p-4 text-[#555] cursor-not-allowed font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">City</label>
                            <input
                                name="dealerCity"
                                value={formData.dealerCity}
                                onChange={handleChange}
                                placeholder="Mumbai"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">State</label>
                            <input
                                name="dealerState"
                                value={formData.dealerState}
                                onChange={handleChange}
                                placeholder="Maharashtra"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                    </div>
                </section>

                {/* Bank Details */}
                <section className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-white" /> Payout & Bank Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Bank Name</label>
                            <input
                                name="dealerBankName"
                                value={formData.dealerBankName}
                                onChange={handleChange}
                                placeholder="HDFC Bank"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">Account Number</label>
                            <input
                                name="dealerAccountNum"
                                value={formData.dealerAccountNum}
                                onChange={handleChange}
                                placeholder="000123456789"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">IFSC Code</label>
                            <input
                                name="dealerIfscCode"
                                value={formData.dealerIfscCode}
                                onChange={handleChange}
                                placeholder="HDFC0000123"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b0b0b0] uppercase tracking-wider">UPI ID (Optional)</label>
                            <input
                                name="upiId"
                                value={formData.upiId}
                                onChange={handleChange}
                                placeholder="business@upi"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <Info className="w-5 h-5 text-[#888] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#888] leading-relaxed">
                            These details will be used for transferring your earnings and verifying your business. Please ensure they are accurate.
                        </p>
                    </div>
                </section>

                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
                        }`}>
                        {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 ${saving
                            ? "bg-white/5 text-[#444]"
                            : "bg-white text-black hover:bg-gray-200 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                            }`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Settings</>}
                    </button>
                </div>
            </form>
        </div>
    )
}
