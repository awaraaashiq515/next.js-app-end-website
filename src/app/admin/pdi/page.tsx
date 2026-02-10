"use client"

import * as React from "react"
import { ClipboardCheck, Plus, Search, Filter, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PDIPage() {
    const [inspections, setInspections] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchInspections = async () => {
        try {
            const res = await fetch('/api/admin/pdi/list')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setInspections(data)
        } catch (error) {
            console.error("Failed to load inspections:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchInspections()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return { bg: "rgba(74, 222, 128, 0.1)", text: "#4ade80" }
            case "IN_PROGRESS": return { bg: "rgba(232, 163, 23, 0.1)", text: "#e8a317" }
            case "PENDING": return { bg: "rgba(96, 165, 250, 0.1)", text: "#60a5fa" }
            default: return { bg: "rgba(107, 112, 128, 0.1)", text: "#6b7080" }
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ClipboardCheck className="w-7 h-7" style={{ color: '#4ade80' }} />
                        PDI Inspections
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Manage Pre-Delivery Inspections</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/pdi/settings">
                        <button
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-white/10 text-white border border-white/10"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </Link>
                    <Link href="/admin/pdi/new">
                        <button
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                            style={{
                                background: 'linear-gradient(135deg, #e8a317, #d49510)',
                                color: '#000',
                                boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            New Inspection
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl"
                style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7080' }} />
                    <input
                        type="text"
                        placeholder="Search by VIN, vehicle, or customer..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-colors"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#d8d8d8'
                        }}
                    />
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-white/10"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#d8d8d8'
                    }}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Table */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            <p className="text-gray-500 animate-pulse">Loading inspections...</p>
                        </div>
                    ) : inspections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <ClipboardCheck className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-white font-semibold text-lg">No Inspections Found</h3>
                            <p className="text-gray-500 max-w-xs mt-2">Start by creating your first Pre-Delivery Inspection report.</p>
                            <Link href="/pdi/create" className="mt-6">
                                <Button className="bg-amber-500 hover:bg-white text-black font-bold">
                                    Create Inspection
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Vehicle</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>VIN</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: '#6b7080' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inspections.map((inspection, index) => {
                                    const statusColor = getStatusColor(inspection.status)
                                    return (
                                        <tr
                                            key={inspection.id}
                                            className="transition-colors hover:bg-white/5"
                                            style={{ borderBottom: index < inspections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
                                        >
                                            <td className="px-6 py-4 text-sm" style={{ color: '#6b7080' }}>{formatDate(inspection.inspectionDate)}</td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">
                                                {inspection.vehicleMake} {inspection.vehicleModel} {inspection.vehicleYear}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono" style={{ color: '#6b7080' }}>{inspection.vin || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: '#d8d8d8' }}>{inspection.customerName}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                                                    style={{
                                                        backgroundColor: statusColor.bg,
                                                        color: statusColor.text,
                                                        borderColor: `${statusColor.text}20`
                                                    }}
                                                >
                                                    {inspection.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/pdi/view/${inspection.id}`}>
                                                    <button className="text-sm font-bold uppercase italic hover:text-white transition-colors" style={{ color: '#e8a317' }}>
                                                        View
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
