"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    ChevronRight,
    QrCode,
    Copy,
    Check,
    Clock,
    IndianRupee,
    Smartphone,
    Info
} from "lucide-react"

interface DealerPackage {
    id: string
    name: string
    type: string
    price: number
    description: string | null
    durationDays: number
}

interface PaymentSettings {
    upiId: string | null
    upiName: string | null
    qrCodePath: string | null
}

export default function PackageCheckoutPage({ params: paramsPromise }: { params: Promise<{ packageId: string }> }) {
    const params = use(paramsPromise)
    const packageId = params.packageId
    const router = useRouter()

    const [packageData, setPackageData] = useState<DealerPackage | null>(null)
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH" | "PAY_LATER">("UPI")
    const [upiTransactionId, setUpiTransactionId] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchData()
    }, [packageId])

    const fetchData = async () => {
        try {
            // Fetch package details
            const pkgRes = await fetch(`/api/dealer/packages/${packageId}`)
            if (!pkgRes.ok) throw new Error("Failed to load package details")
            const pkgJson = await pkgRes.json()
            setPackageData(pkgJson.package)

            // Fetch payment settings with dynamic QR based on package price
            const settingsRes = await fetch(`/api/admin/settings/payment?amount=${pkgJson.package.price}`)
            if (settingsRes.ok) {
                const settingsJson = await settingsRes.json()
                setPaymentSettings(settingsJson.settings)
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyUPI = () => {
        if (paymentSettings?.upiId) {
            navigator.clipboard.writeText(paymentSettings.upiId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (paymentMethod === "UPI" && !upiTransactionId) {
            setError("Please enter the UPI Transaction ID")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const res = await fetch("/api/dealer/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId,
                    paymentMethod,
                    upiTransactionId: paymentMethod === "UPI" ? upiTransactionId : null,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/dealer/packages")
                }, 5000)
            } else {
                throw new Error(data.error || "Failed to process payment")
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit payment")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <div className="bg-[#111] border border-white/20 rounded-[3rem] p-12 md:p-20 shadow-[0_20px_50px_rgba(255,255,255,0.05)]">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-10 text-emerald-500 border border-emerald-500/30">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Payment Submitted!</h1>
                    <p className="text-[#b0b0b0] text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                        {paymentMethod === "UPI"
                            ? "Your subscription has been activated instantly. You can now use all the features of your plan."
                            : "Your request is pending. Our team will verify the payment and activate your subscription shortly."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push("/dealer/packages")}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Go to Packages
                        </button>
                        <button
                            onClick={() => router.push("/dealer")}
                            className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-xl font-bold"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Summary & Payment Options */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <button
                                onClick={() => router.back()}
                                className="text-sm text-[#888] hover:text-white flex items-center gap-2 mb-6 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Packages
                            </button>
                            <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2 uppercase italic text-white">
                                Complete Your <span className="text-gray-400">Registration</span>
                            </h1>
                            <p className="text-[#888] text-sm">Review your plan and choose a payment method below.</p>
                        </div>

                        {/* Package Summary Mobile Hidden (shows only on left on desktop) */}
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{packageData?.name}</h3>
                                    <p className="text-xs text-[#888] uppercase tracking-widest">{packageData?.durationDays} Days Plan</p>
                                </div>
                                <span className="text-2xl font-bold text-white">₹{packageData?.price}</span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-white" /> Select Payment Method
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "UPI", label: "Instant UPI", icon: Smartphone, desc: "Fast & Instant" },
                                    { id: "CASH", label: "Cash Payment", icon: IndianRupee, desc: "Manual Approval" },
                                    { id: "PAY_LATER", label: "Pay Later", icon: Clock, desc: "Admin Review" }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden ${paymentMethod === method.id
                                            ? "bg-white/10 border-white/50 ring-1 ring-white/50"
                                            : "bg-[#111] border-white/5 hover:border-white/10"
                                            }`}
                                    >
                                        <method.icon className={`w-8 h-8 mb-4 ${paymentMethod === method.id ? "text-white" : "text-[#444]"}`} />
                                        <div className="font-bold text-sm block mb-1">{method.label}</div>
                                        <div className={`text-[10px] uppercase tracking-widest ${paymentMethod === method.id ? "text-white/70" : "text-[#666]"}`}>
                                            {method.desc}
                                        </div>
                                        {paymentMethod === method.id && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Detail Section */}
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                            {paymentMethod === "UPI" && (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        {/* QR Code */}
                                        <div className="flex-shrink-0">
                                            <div className="bg-white p-4 rounded-3xl inline-block shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-4 border-white">
                                                {paymentSettings?.qrCodePath ? (
                                                    <img
                                                        src={paymentSettings.qrCodePath}
                                                        alt="UPI QR Code"
                                                        className="w-48 h-48 md:w-56 md:h-56"
                                                    />
                                                ) : (
                                                    <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <QrCode className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-center mt-4 text-[#888] font-bold uppercase tracking-widest">Scan to Pay Instantly</p>
                                        </div>

                                        {/* Payment Instructions */}
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                                    Pay via UPI ID
                                                </h3>
                                                <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl">
                                                    <code className="text-white font-mono flex-1 font-bold">{paymentSettings?.upiId || "N/A"}</code>
                                                    <button
                                                        onClick={handleCopyUPI}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#888] hover:text-white"
                                                    >
                                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-sm font-bold text-[#b0b0b0]">Enter Transaction/UTR ID <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={upiTransactionId}
                                                    onChange={(e) => setUpiTransactionId(e.target.value)}
                                                    placeholder="12-digit UPI UTR Number"
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-white/30 transition-all font-mono"
                                                />
                                                <p className="text-[10px] text-[#666] flex items-center gap-2">
                                                    <Info className="w-3 h-3" /> Note: Incorrect UTR may delay activation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(paymentMethod === "CASH" || paymentMethod === "PAY_LATER") && (
                                <div className="text-center py-10 space-y-6 max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mx-auto">
                                        {paymentMethod === "CASH" ? <IndianRupee className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                                    </div>
                                    <h3 className="text-2xl font-bold">
                                        {paymentMethod === "CASH" ? "Manual Cash Verification" : "Pay Later (Request Approval)"}
                                    </h3>
                                    <p className="text-[#888] text-sm leading-relaxed">
                                        {paymentMethod === "CASH"
                                            ? "Please visit our office to pay in cash. Once received, our admin will activate your subscription."
                                            : "Choosing Pay Later sends a request to our admin. We'll contact you for further details."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">!</div>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`w-full py-6 rounded-3xl font-bold uppercase tracking-[4px] text-[15px] flex items-center justify-center gap-3 transition-all duration-300 ${submitting
                                ? "bg-white/5 text-[#444]"
                                : "bg-white text-black hover:bg-gray-200 shadow-[0_20px_50px_rgba(255,255,255,0.15)]"
                                }`}
                        >
                            {submitting ? "Processing..." : "Submit Payment"}
                            {!submitting && <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Right Column: Sticky Summary Box (Desktop Only) */}
                    <div className="hidden lg:block w-[380px]">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4A9FFF]/5 rounded-full blur-3xl"></div>

                                <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                        <IndianRupee className="w-4 h-4" />
                                    </div>
                                    Summary
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-start pb-6 border-b border-white/5">
                                        <div>
                                            <div className="text-white font-bold text-xl">{packageData?.name}</div>
                                            <div className="text-[#666] text-xs uppercase tracking-widest mt-1">{packageData?.durationDays} Days Membership</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#888]">Subtotal</span>
                                            <span className="text-white font-medium">₹{packageData?.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#888]">Platform Fee</span>
                                            <span className="text-emerald-500 font-medium font-mono text-xs uppercase tracking-wide">Free</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                        <span className="text-[#b0b0b0] font-bold">Total Amount</span>
                                        <div className="text-3xl font-extrabold text-white tracking-tighter">₹{packageData?.price}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/5">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Encrypted Checkout</h4>
                                    <p className="text-[10px] text-[#555]">All transactions are secure and encrypted.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
