'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Plus, Search, Filter, FileText, RefreshCw, ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    policyNumber: string
    claimType: string
    estimatedDamage: number | null
    status: string
    createdAt: string
    source: string
    user?: {
        name: string
        email: string
    }
}

interface ClaimStats {
    total: number
    submitted: number
    underReview: number
    approved: number
    rejected: number
    completed: number
}

export default function InsurancePage() {
    const router = useRouter()
    const [claims, setClaims] = useState<InsuranceClaim[]>([])
    const [stats, setStats] = useState<ClaimStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showFilters, setShowFilters] = useState(false)

    const fetchClaims = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '10',
                source: 'WALK_IN'
            })
            if (search) params.append('search', search)
            if (statusFilter) params.append('status', statusFilter)

            const response = await fetch(`/api/admin/insurance-claims?${params}`)
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

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/insurance-claims?statsOnly=true')
            const data = await response.json()
            if (response.ok) {
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    useEffect(() => {
        fetchClaims()
        fetchStats()
    }, [page, statusFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchClaims()
    }

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

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ')
    }

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'PENDING_DOCUMENTS', label: 'Pending Documents' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'COMPLETED', label: 'Completed' },
    ]

    const statCards = [
        { label: "Total Claims", value: stats?.total || 0 },
        { label: "Submitted", value: stats?.submitted || 0 },
        { label: "Under Review", value: stats?.underReview || 0 },
        { label: "Approved", value: stats?.approved || 0 },
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        Insurance - Walk-in Claims
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Manage walk-in insurance claims created by admin</p>
                </div>
                <button
                    onClick={() => router.push('/admin/insurance/new')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                    style={{
                        background: 'linear-gradient(135deg, #e8a317, #d49510)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                    }}
                >
                    <Plus className="w-5 h-5" />
                    New Walk-in Claim
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                        <p className="text-sm" style={{ color: '#6b7080' }}>{stat.label}</p>
                        <div className="flex items-end gap-2 mt-2">
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl"
                style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7080' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by claim ID, policy, vehicle, or customer..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-colors"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#d8d8d8'
                        }}
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#d8d8d8'
                    }}
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value} style={{ backgroundColor: '#111318' }}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => { setPage(1); fetchClaims(); fetchStats(); }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-white/10"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#d8d8d8'
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Table */}
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
                        <Shield className="w-12 h-12 mb-4" style={{ color: '#6b7080' }} />
                        <p className="text-lg font-medium text-white">No claims found</p>
                        <p className="text-sm" style={{ color: '#6b7080' }}>Create a walk-in claim or wait for online submissions</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Claim ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Vehicle</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Policy</th>
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
                                            className="transition-colors hover:bg-white/5 cursor-pointer"
                                            style={{ borderBottom: index < claims.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                                            onClick={() => router.push(`/admin/insurance/${claim.id}`)}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#60a5fa' }}>{claim.claimNumber}</td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {claim.user?.name || '-'}
                                                <span className="block text-xs" style={{ color: '#6b7080' }}>{claim.user?.email}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {claim.vehicleMake} {claim.vehicleModel}
                                                <span className="block text-xs" style={{ color: '#6b7080' }}>{claim.vehicleYear}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono" style={{ color: '#6b7080' }}>{claim.policyNumber}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#d8d8d8' }}>{claim.claimType}</td>
                                            <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#e8a317' }}>{formatCurrency(claim.estimatedDamage)}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#6b7080' }}>{formatDate(claim.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                                                >
                                                    {formatStatus(claim.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => router.push(`/admin/insurance/${claim.id}`)}
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
                )}

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
            </div>
        </div>
    )
}
