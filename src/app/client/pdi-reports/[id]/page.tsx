"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ClientPDIReportViewPage() {
    const params = useParams()
    const router = useRouter()
    const inspectionId = params.id as string

    const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (!inspectionId) return

        // Fetch inspection details to get PDF URL
        fetchInspection()
    }, [inspectionId])

    const fetchInspection = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/client/pdi-reports')
            if (!res.ok) throw new Error('Failed to fetch reports')

            const data = await res.json()
            const inspection = data.inspections.find((item: any) => item.id === inspectionId)

            if (!inspection) {
                throw new Error('Report not found')
            }

            if (!inspection.pdfUrl) {
                throw new Error('PDF is still being generated. Please check back in a moment.')
            }

            setPdfUrl(inspection.pdfUrl)
        } catch (err: any) {
            console.error('Failed to load PDF:', err)
            setError(err.message || 'Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading your inspection report...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Unable to Load Report</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={fetchInspection} className="bg-amber-500 hover:bg-amber-600 text-black">
                            Try Again
                        </Button>
                        <Link href="/client/pdi-reports">
                            <Button variant="outline" className="border-white/10 hover:bg-white/10 text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Reports
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/client/pdi-reports">
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Reports
                        </Button>
                    </Link>
                    {pdfUrl && (
                        <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </a>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-white">PDI Inspection Report</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Report ID: {inspectionId.substring(0, 8).toUpperCase()}
                </p>
            </div>

            {/* PDF Viewer */}
            {pdfUrl && (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="PDI Report PDF"
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            If the PDF doesn't display, you can {' '}
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
                                open it in a new tab
                            </a>
                            {' '} or {' '}
                            <a href={pdfUrl} download className="text-amber-500 hover:underline">
                                download it
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
