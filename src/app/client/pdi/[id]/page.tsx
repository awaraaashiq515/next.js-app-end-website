"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Loader2, FileText, Car, User, Download, CheckCircle2, XCircle, AlertTriangle, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface InspectionData {
    id: string
    vehicleMake: string
    vehicleModel: string
    vehicleColor: string
    vehicleYear: string
    vin: string
    engineNumber: string
    odometer: string
    customerName: string
    customerEmail: string
    customerPhone: string
    inspectionDate: string
    inspectedBy: string
    adminComments: string
    status: string
    pdfUrl: string
    responses: Array<{
        id: string
        status: string
        notes: string
        item: {
            label: string
            section: {
                name: string
            }
        }
    }>
    leakageResponses: Array<{
        id: string
        found: boolean
        notes: string
        leakageItem: {
            label: string
        }
    }>
}

export default function ClientPDIViewPage() {
    const params = useParams()
    const id = params.id as string
    const [inspection, setInspection] = React.useState<InspectionData | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        async function loadInspection() {
            try {
                const res = await fetch(`/api/client/pdi/${id}`)
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Inspection not found")
                    }
                    if (res.status === 403) {
                        throw new Error("You don't have access to this inspection")
                    }
                    throw new Error("Failed to load inspection")
                }
                const data = await res.json()
                setInspection(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadInspection()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-gray-400">Loading inspection report...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{error}</h2>
                    <Link href="/client">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!inspection) return null

    // Group responses by section
    const sectionMap = new Map<string, typeof inspection.responses>()
    inspection.responses.forEach(res => {
        const sectionName = res.item.section.name
        if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, [])
        }
        sectionMap.get(sectionName)!.push(res)
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASS':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'FAIL':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'WARN':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-[#08090c] pb-12">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">PDI Inspection Report</h1>
                            <p className="text-sm text-gray-500">Inspection Date: {formatDate(inspection.inspectionDate)}</p>
                        </div>
                    </div>

                    {inspection.pdfUrl && (
                        <a href={inspection.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </a>
                    )}
                </div>

                {/* Customer & Vehicle Details */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    {/* Customer Details */}
                    <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500/20 to-transparent px-6 py-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Customer Details</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Name</span>
                                <span className="text-white font-medium">{inspection.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mobile</span>
                                <span className="text-white">{inspection.customerPhone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-white">{inspection.customerEmail || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500/20 to-transparent px-6 py-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Car className="w-5 h-5 text-blue-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Vehicle Details</h3>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-xs text-gray-500">Make</span>
                                <p className="text-white font-medium">{inspection.vehicleMake}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Model</span>
                                <p className="text-white font-medium">{inspection.vehicleModel}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Color</span>
                                <p className="text-white">{inspection.vehicleColor}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Year</span>
                                <p className="text-white">{inspection.vehicleYear || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Engine No.</span>
                                <p className="text-white font-mono text-sm">{inspection.engineNumber || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Chassis No.</span>
                                <p className="text-white font-mono text-sm">{inspection.vin || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-gray-500">Odometer</span>
                                <p className="text-white">{inspection.odometer ? `${inspection.odometer} KM` : '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection Results */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-white">Inspection Results</h2>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from(sectionMap.entries()).map(([sectionName, items]) => (
                            <div key={sectionName} className="rounded-lg border border-white/10 bg-[#111318] overflow-hidden">
                                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/10">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{sectionName}</h4>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {items.map(item => (
                                        <div key={item.id} className="px-4 py-2 flex items-center justify-between gap-2">
                                            <span className="text-sm text-gray-400 flex-1">{item.item.label}</span>
                                            {getStatusIcon(item.status)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leakage Inspection Results */}
                {inspection.leakageResponses && inspection.leakageResponses.length > 0 && (
                    <div className="space-y-6 mb-8">
                        <div className="flex items-center gap-3">
                            <Droplets className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold uppercase tracking-wider text-white">Leakage Inspection</h2>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-[#111318] overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                                {inspection.leakageResponses.map(item => (
                                    <div key={item.id} className="p-4 bg-[#111318] flex items-center justify-between gap-3">
                                        <span className="text-sm text-gray-400">{item.leakageItem.label}</span>
                                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${item.found
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            }`}>
                                            {item.found ? 'Found' : 'Not Found'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Comments */}
                {inspection.adminComments && (
                    <div className="rounded-lg border border-white/10 bg-[#111318] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500/20 to-transparent px-6 py-4 border-b border-white/10">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Inspector Comments</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-300 whitespace-pre-wrap">{inspection.adminComments}</p>
                        </div>
                    </div>
                )}

                {/* Inspected By */}
                {inspection.inspectedBy && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Inspected by: <span className="text-white font-medium">{inspection.inspectedBy}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
