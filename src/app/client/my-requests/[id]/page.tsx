'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, MapPin, FileText, AlertCircle, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react'

interface InsuranceClaim {
    id: string
    claimNumber: string
    userId: string
    status: string

    // Vehicle Details
    vehicleMake: string
    vehicleModel: string
    vehicleVariant?: string
    vehicleYear: string
    vehicleType?: string
    registrationNumber: string

    // Insurance Details
    policyNumber: string
    insuranceCompany: string
    policyType?: string

    // Claim Details
    claimType: string
    incidentDate?: string
    incidentLocation?: string
    incidentDescription?: string
    estimatedDamage?: number

    adminNotes?: string
    adminMessage?: string
    createdAt: string
    updatedAt: string

    documents?: Array<{
        id: string
        fileName: string
        fileUrl: string
        fileType: string
    }>

    user?: {
        name: string
        email: string
        mobile?: string
    }
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [claim, setClaim] = useState<InsuranceClaim | null>(null)
    const [loading, setLoading] = useState(true)
    const [claimId, setClaimId] = useState<string>('')

    useEffect(() => {
        params.then(p => setClaimId(p.id))
    }, [params])

    useEffect(() => {
        if (claimId) {
            fetchClaim()
        }
    }, [claimId])

    const fetchClaim = async () => {
        try {
            const response = await fetch(`/api/insurance-claims/${claimId}`)
            const data = await response.json()

            if (response.ok) {
                setClaim(data)
            } else {
                console.error('Failed to fetch claim')
            }
        } catch (error) {
            console.error('Error fetching claim:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'SUBMITTED':
                return {
                    icon: Clock,
                    color: '#a855f7',
                    bg: 'rgba(168, 85, 247, 0.1)',
                    label: 'Submitted'
                }
            case 'UNDER_REVIEW':
                return {
                    icon: Eye,
                    color: '#e8a317',
                    bg: 'rgba(232, 163, 23, 0.1)',
                    label: 'Under Review'
                }
            case 'PENDING_DOCUMENTS':
                return {
                    icon: FileText,
                    color: '#60a5fa',
                    bg: 'rgba(96, 165, 250, 0.1)',
                    label: 'Pending Documents'
                }
            case 'APPROVED':
                return {
                    icon: CheckCircle2,
                    color: '#4ade80',
                    bg: 'rgba(74, 222, 128, 0.1)',
                    label: 'Approved'
                }
            case 'REJECTED':
                return {
                    icon: XCircle,
                    color: '#f87171',
                    bg: 'rgba(248, 113, 113, 0.1)',
                    label: 'Rejected'
                }
            case 'COMPLETED':
                return {
                    icon: CheckCircle2,
                    color: '#4ade80',
                    bg: 'rgba(74, 222, 128, 0.1)',
                    label: 'Completed'
                }
            default:
                return {
                    icon: AlertCircle,
                    color: '#6b7080',
                    bg: 'rgba(107, 112, 128, 0.1)',
                    label: status
                }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-[#e8a317] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Claim Not Found</h2>
                <p className="text-gray-400 mb-6">The claim you're looking for doesn't exist.</p>
                <button
                    onClick={() => router.push('/client/my-requests')}
                    className="px-6 py-3 bg-[#e8a317] text-black font-semibold rounded-xl hover:bg-[#d49510] transition-colors"
                >
                    Back to My Requests
                </button>
            </div>
        )
    }

    const statusConfig = getStatusConfig(claim.status)
    const StatusIcon = statusConfig.icon

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/client/my-requests')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">Request Details</h2>
                    <p className="text-sm text-gray-400 mt-1">Claim #{claim.claimNumber}</p>
                </div>
            </div>

            {/* Status Badge */}
            <div
                className="p-5 rounded-xl border flex items-center gap-3"
                style={{ backgroundColor: statusConfig.bg, borderColor: statusConfig.color + '40' }}
            >
                <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
                <div>
                    <p className="text-xs text-gray-400">Current Status</p>
                    <p className="text-lg font-bold" style={{ color: statusConfig.color }}>
                        {statusConfig.label}
                    </p>
                </div>
            </div>

            {/* Admin Message */}
            {claim.adminMessage && (
                <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-400 mb-2">Message from Admin</p>
                            <p className="text-white leading-relaxed">{claim.adminMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle Information */}
            <div
                className="p-6 rounded-xl border border-white/10"
                style={{ backgroundColor: '#111318' }}
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#60a5fa] rounded-full"></div>
                    Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Make & Model</p>
                        <p className="text-white font-medium">{claim.vehicleMake} {claim.vehicleModel}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Year</p>
                        <p className="text-white font-medium">{claim.vehicleYear}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                        <p className="text-white font-medium font-mono">{claim.registrationNumber}</p>
                    </div>
                    {claim.vehicleVariant && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Variant</p>
                            <p className="text-white font-medium">{claim.vehicleVariant}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Insurance & Claim Details */}
            <div
                className="p-6 rounded-xl border border-white/10"
                style={{ backgroundColor: '#111318' }}
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#e8a317] rounded-full"></div>
                    Insurance & Claim Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Policy Number</p>
                        <p className="text-white font-medium font-mono">{claim.policyNumber}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Insurance Company</p>
                        <p className="text-white font-medium">{claim.insuranceCompany}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Claim Type</p>
                        <p className="text-white font-medium">{claim.claimType}</p>
                    </div>
                    {claim.estimatedDamage && (
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Estimated Damage</p>
                            <p className="text-[#e8a317] font-bold text-lg">
                                ₹{claim.estimatedDamage.toLocaleString('en-IN')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Incident Details */}
            {(claim.incidentDate || claim.incidentLocation || claim.incidentDescription) && (
                <div
                    className="p-6 rounded-xl border border-white/10"
                    style={{ backgroundColor: '#111318' }}
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                        Incident Details
                    </h3>
                    <div className="space-y-4">
                        {claim.incidentDate && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Date of Incident</p>
                                    <p className="text-white">
                                        {new Date(claim.incidentDate).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {claim.incidentLocation && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                    <p className="text-white">{claim.incidentLocation}</p>
                                </div>
                            </div>
                        )}
                        {claim.incidentDescription && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Description</p>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                    <p className="text-white leading-relaxed">{claim.incidentDescription}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Documents */}
            {claim.documents && claim.documents.length > 0 && (
                <div
                    className="p-6 rounded-xl border border-white/10"
                    style={{ backgroundColor: '#111318' }}
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                        Documents
                    </h3>
                    <div className="space-y-2">
                        {claim.documents.map((doc) => (
                            <a
                                key={doc.id}
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#e8a317]/30 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#e8a317] transition-colors" />
                                    <div>
                                        <p className="text-white font-medium">{doc.fileName}</p>
                                        <p className="text-xs text-gray-500">{doc.fileType}</p>
                                    </div>
                                </div>
                                <Download className="w-5 h-5 text-gray-400 group-hover:text-[#e8a317] transition-colors" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div
                className="p-6 rounded-xl border border-white/10"
                style={{ backgroundColor: '#111318' }}
            >
                <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#a855f7] mt-2"></div>
                        <div>
                            <p className="text-sm text-white font-medium">Request Submitted</p>
                            <p className="text-xs text-gray-500">
                                {new Date(claim.createdAt).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    {claim.updatedAt !== claim.createdAt && (
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#e8a317] mt-2"></div>
                            <div>
                                <p className="text-sm text-white font-medium">Last Updated</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(claim.updatedAt).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
