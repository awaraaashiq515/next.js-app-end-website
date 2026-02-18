"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    ExternalLink,
    ChevronRight,
    User,
    Building2,
    Calendar,
    IndianRupee,
    Loader2,
    Check,
    X,
    MessageSquare
} from "lucide-react"
import { format } from "date-fns"
import { formatCurrency, getPaymentStatusColor } from "@/lib/payment-utils"

interface Payment {
    id: string
    amount: number
    method: string
    status: string
    transactionId: string | null
    createdAt: string
    package: {
        name: string
    }
    subscription?: {
        dealer: {
            name: string
            email: string
            dealerBusinessName: string | null
        }
    }
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/admin/payments")
            if (res.ok) {
                const data = await res.json()
                setPayments(data.payments || [])
            }
        } catch (err) {
            console.error("Failed to fetch payments:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setProcessingId(id)
        try {
            const adminNotes = prompt(`Enter notes for ${action}:`) || `Action performed via admin panel`
            const res = await fetch(`/api/admin/payments/${id}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNotes }),
            })

            if (res.ok) {
                fetchPayments()
            } else {
                const data = await res.json()
                alert(data.error || `Failed to ${action} payment`)
            }
        } catch (err) {
            console.error(`Error during payment ${action}:`, err)
        } finally {
            setProcessingId(null)
        }
    }

    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.subscription?.dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.subscription?.dealer.dealerBusinessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter

        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#4A9FFF] animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#4A9FFF] selection:text-black">
            <Navbar />

            <main className="pt-32 pb-24 container px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-display text-5xl font-extrabold tracking-tight mb-2 uppercase italic">
                            Payment <span className="text-[#4A9FFF]">Records</span>
                        </h1>
                        <p className="text-[#888] text-sm tracking-widest uppercase font-medium">Manage dealer subscriptions and transactions</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-[#4A9FFF] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Dealer or UTR..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#111] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-[#4A9FFF]/50 transition-all w-full sm:w-64"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-[#4A9FFF] transition-colors" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-[#111] border border-white/5 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:border-[#4A9FFF]/50 transition-all appearance-none w-full cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments Table/Grid */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-[#111] border border-dashed border-white/10 rounded-[2.5rem] py-20 text-center">
                        <CreditCard className="w-12 h-12 text-[#222] mx-auto mb-4" />
                        <div className="text-[#444] font-medium uppercase tracking-[3px]">No matching records found</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredPayments.map((payment) => (
                            <PaymentRow
                                key={payment.id}
                                payment={payment}
                                onApprove={() => handleAction(payment.id, "approve")}
                                onReject={() => handleAction(payment.id, "reject")}
                                isProcessing={processingId === payment.id}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

function PaymentRow({
    payment,
    onApprove,
    onReject,
    isProcessing
}: {
    payment: Payment,
    onApprove: () => void,
    onReject: () => void,
    isProcessing: boolean
}) {
    const isPending = payment.status === "PENDING"
    const isUPI = payment.method === "UPI"

    return (
        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 transition-all duration-300 hover:border-white/10 group">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

                {/* Dealer Info */}
                <div className="w-full lg:w-1/4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#4A9FFF]/10 flex items-center justify-center text-[#4A9FFF] border border-[#4A9FFF]/20">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-white group-hover:text-[#4A9FFF] transition-colors">
                                {payment.subscription?.dealer.dealerBusinessName || payment.subscription?.dealer.name}
                            </div>
                            <div className="text-[10px] text-[#666] font-medium truncate max-w-[150px]">{payment.subscription?.dealer.email}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#444] font-bold uppercase tracking-widest pl-16">
                        {payment.subscription?.dealer.name}
                    </div>
                </div>

                {/* Package & Payment Info */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-2">Package</div>
                        <div className="text-sm font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4A9FFF]"></span>
                            {payment.package.name}
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-2">Amount</div>
                        <div className="text-sm font-extrabold text-white">{formatCurrency(payment.amount)}</div>
                    </div>

                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-2">Method</div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isUPI ? "bg-purple-500/10 border-purple-500/20 text-purple-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                }`}>
                                {payment.method}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-2">Status</div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {payment.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                            {payment.status === "FAILED" && <XCircle className="w-3 h-3" />}
                            {payment.status}
                        </div>
                    </div>
                </div>

                {/* Transaction & Date */}
                <div className="w-full lg:w-1/5 space-y-4">
                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-1">Transaction ID</div>
                        <div className="text-[11px] font-mono text-[#888] truncate">{payment.transactionId || "N/A"}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold mb-1">Date</div>
                        <div className="text-[11px] text-[#666]">{format(new Date(payment.createdAt), "dd MMM yyyy, hh:mm a")}</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full lg:w-auto flex lg:flex-col gap-2">
                    {isPending ? (
                        <>
                            <button
                                disabled={isProcessing}
                                onClick={onApprove}
                                className="flex-1 lg:w-full px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-2xl border border-emerald-500/20 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                            >
                                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Approve</>}
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={onReject}
                                className="flex-1 lg:w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                            >
                                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3" /> Reject</>}
                            </button>
                        </>
                    ) : (
                        <button className="flex items-center gap-2 text-[10px] text-[#444] font-bold uppercase tracking-widest hover:text-[#4A9FFF] transition-colors p-2">
                            Details <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
