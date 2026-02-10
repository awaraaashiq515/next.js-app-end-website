'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Plus, RefreshCw, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    claimType: string
    estimatedDamage: number | null
    status: string
    createdAt: string
    pdfUrl?: string
}

export default function MyRequestsPage() {
    const router = useRouter()
    const [claims, setClaims] = useState<InsuranceClaim[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchClaims = async () => {
        try {
            setLoading(true)
            // Fetch only ONLINE submitted claims
            const response = await fetch(`/api/insurance-claims?page=${page}&pageSize=10&source=ONLINE`)
            const data = await response.json()

            if (response.ok) {
                setClaims(data.claims || [])
                setTotalPages(data.pagination?.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching claims:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClaims()
    }, [page])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
                return { bg: "rgba(74, 222, 128, 0.1)", text: "#4ade80" }
            case "UNDER_REVIEW":
                return { bg: "rgba(232, 163, 23, 0.1)", text: "#e8a317" }
            case "PENDING_DOCUMENTS":
                return { bg: "rgba(96, 165, 250, 0.1)", text: "#60a5fa" }
            case "REJECTED":
                return { bg: "rgba(248, 113, 113, 0.1)", text: "#f87171" }
            case "SUBMITTED":
                return { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" }
            default:
                return { bg: "rgba(107, 112, 128, 0.1)", text: "#6b7080" }
        }
    }

    const formatCurrency = (amount: number | null) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Send className="w-7 h-7" style={{ color: '#e8a317' }} />
                        My Requests
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Claims you submitted online</p>
                </div>
                <button
                    onClick={() => router.push('/insurance-claim')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                    style={{
                        background: 'linear-gradient(135deg, #e8a317, #d49510)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Submit New Request
                </button>
            </div>

            {/* Claims List */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#e8a317' }} />
                    </div>
                ) : claims.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Send className="w-12 h-12 mb-4" style={{ color: '#6b7080' }} />
                        <p className="text-lg font-medium text-white">No requests yet</p>
                        <p className="text-sm mb-6" style={{ color: '#6b7080' }}>Submit your first claim request online</p>
                        <button
                            onClick={() => router.push('/insurance-claim')}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                            style={{
                                background: 'linear-gradient(135deg, #e8a317, #d49510)',
                                color: '#000'
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Submit New Request
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {claims.map((claim) => {
                                const statusColor = getStatusColor(claim.status)
                                return (
                                    <div
                                        key={claim.id}
                                        className="p-4 rounded-lg"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-medium" style={{ color: '#60a5fa' }}>{claim.claimNumber}</p>
                                                <p className="text-sm text-white">{claim.vehicleMake} {claim.vehicleModel}</p>
                                            </div>
                                            <span
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                            >
                                                {claim.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-3">
                                            <span style={{ color: '#6b7080' }}>{claim.claimType}</span>
                                            <span style={{ color: '#e8a317' }}>{formatCurrency(claim.estimatedDamage)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs" style={{ color: '#6b7080' }}>{formatDate(claim.createdAt)}</span>
                                            <div className="flex gap-2">
                                                {claim.pdfUrl && (
                                                    <a
                                                        href={claim.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg"
                                                        style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/client/my-requests/${claim.id}`)}
                                                    className="p-2 rounded-lg"
                                                    style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)', color: '#e8a317' }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Claim ID</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Vehicle</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Type</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Amount</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Date</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {claims.map((claim, index) => {
                                        const statusColor = getStatusColor(claim.status)
                                        return (
                                            <tr
                                                key={claim.id}
                                                className="transition-colors hover:bg-white/5"
                                                style={{ borderBottom: index < claims.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium" style={{ color: '#60a5fa' }}>{claim.claimNumber}</td>
                                                <td className="px-6 py-4 text-sm text-white">
                                                    {claim.vehicleMake} {claim.vehicleModel}
                                                    <span className="block text-xs" style={{ color: '#6b7080' }}>{claim.vehicleYear}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: '#d8d8d8' }}>{claim.claimType}</td>
                                                <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#e8a317' }}>{formatCurrency(claim.estimatedDamage)}</td>
                                                <td className="px-6 py-4 text-sm" style={{ color: '#6b7080' }}>{formatDate(claim.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                                    >
                                                        {claim.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {claim.pdfUrl && (
                                                            <a
                                                                href={claim.pdfUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm flex items-center gap-1 transition-colors"
                                                                style={{ color: '#4ade80' }}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                PDF
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => router.push(`/client/my-requests/${claim.id}`)}
                                                            className="text-sm hover:text-white transition-colors flex items-center gap-1"
                                                            style={{ color: '#e8a317' }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div
                                className="flex items-center justify-between px-6 py-4"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <p className="text-sm" style={{ color: '#6b7080' }}>
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ border: '1px solid rgba(255,255,255,0.07)', color: '#d8d8d8' }}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ border: '1px solid rgba(255,255,255,0.07)', color: '#d8d8d8' }}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
