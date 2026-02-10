"use client"

import * as React from "react"
import { FileText, Download, Eye, Calendar, Car, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PDIReport {
    id: string
    vehicleMake: string
    vehicleModel: string
    vehicleColor: string
    vehicleYear?: string
    vin?: string
    customerName: string
    inspectionDate: string
    inspectedBy?: string
    status: string
    pdfUrl?: string
    createdAt: string
}

export default function ClientPDIReportsPage() {
    const [reports, setReports] = React.useState<PDIReport[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch('/api/client/pdi-reports')

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to fetch reports')
            }

            const data = await res.json()
            setReports(data.inspections || [])
        } catch (err: any) {
            console.error('Failed to fetch PDI reports:', err)
            setError(err.message || 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    const getStatusBadge = (status: string) => {
        const colors = {
            COMPLETED: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80', border: '#4ade8020' },
            IN_PROGRESS: { bg: 'rgba(232, 163, 23, 0.1)', text: '#e8a317', border: '#e8a31720' },
            PENDING: { bg: 'rgba(96, 165, 250, 0.1)', text: '#60a5fa', border: '#60a5fa20' },
        }
        const color = colors[status as keyof typeof colors] || colors.PENDING

        return (
            <span
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
                style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    borderColor: color.border
                }}
            >
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading your PDI reports...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Reports</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={fetchReports} className="bg-amber-500 hover:bg-amber-600 text-black">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-7 h-7" style={{ color: '#4ade80' }} />
                        My PDI Reports
                    </h2>
                    <p className="mt-1 text-gray-400">
                        View and download your vehicle inspection reports
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
                </div>
            </div>

            {/* Reports List */}
            {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">No Reports Yet</h3>
                    <p className="text-gray-500 max-w-xs mt-2">
                        Your PDI inspection reports will appear here once they're completed.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl overflow-hidden hover:border-white/20 transition-all group"
                        >
                            <div className="p-6 space-y-4">
                                {/* Vehicle Info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Car className="w-4 h-4 text-amber-500" />
                                            <h3 className="font-bold text-white text-lg">
                                                {report.vehicleMake} {report.vehicleModel}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {report.vehicleColor} {report.vehicleYear && `• ${report.vehicleYear}`}
                                        </p>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(report.inspectionDate)}</span>
                                    </div>
                                    {report.vin && (
                                        <div className="text-gray-500 font-mono text-xs truncate">
                                            VIN: {report.vin}
                                        </div>
                                    )}
                                    {report.inspectedBy && (
                                        <div className="text-gray-500 text-xs">
                                            Inspected by: {report.inspectedBy}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-white/5 flex gap-2">
                                    {report.pdfUrl ? (
                                        <>
                                            <Link href={`/client/pdi-reports/${report.id}`} className="flex-1">
                                                <Button
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                                                    size="sm"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View PDF
                                                </Button>
                                            </Link>
                                            <a href={report.pdfUrl} download target="_blank" rel="noopener noreferrer">
                                                <Button
                                                    variant="outline"
                                                    className="border-white/10 hover:bg-white/10 text-white"
                                                    size="sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-sm text-gray-500 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                            Generating PDF...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
