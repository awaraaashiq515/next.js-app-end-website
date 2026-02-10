'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, MapPin, Calendar,
    Download, RefreshCw, AlertTriangle
} from "lucide-react"

interface InsuranceClaim {
    id: string
    claimNumber: string
    source: string
    createdAt: string
    status: string
    vehicleMake: string
    vehicleModel: string
    vehicleYear: string
    vehicleColor: string
    registrationNumber: string
    policyNumber: string
    insuranceCompany: string
    policyType: string
    claimType: string
    incidentDate: string
    incidentLocation: string
    incidentDescription: string
    estimatedDamage?: number
    adminNotes?: string
    pdfUrl?: string
    pdfGeneratedAt?: string
}

export default function ClientClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [claim, setClaim] = useState<InsuranceClaim | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClaim = async () => {
            try {
                const response = await fetch(`/api/insurance-claims/${id}`)
                const data = await response.json()
                if (response.ok) {
                    setClaim(data)
                }
            } catch (error) {
                console.error('Error fetching claim:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClaim()
    }, [id])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "COMPLETED":
                return { bg: "rgba(74, 222, 128, 0.15)", text: "#4ade80", border: "rgba(74, 222, 128, 0.3)" }
            case "UNDER_REVIEW":
                return { bg: "rgba(232, 163, 23, 0.15)", text: "#e8a317", border: "rgba(232, 163, 23, 0.3)" }
            case "PENDING_DOCUMENTS":
                return { bg: "rgba(96, 165, 250, 0.15)", text: "#60a5fa", border: "rgba(96, 165, 250, 0.3)" }
            case "REJECTED":
                return { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171", border: "rgba(248, 113, 113, 0.3)" }
            default:
                return { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", border: "rgba(168, 85, 247, 0.3)" }
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#e8a317' }} />
            </div>
        )
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="w-12 h-12 mb-4" style={{ color: '#f87171' }} />
                <p className="text-lg font-medium text-white">Claim not found</p>
                <button
                    onClick={() => router.push('/client/insurance-claims')}
                    className="mt-4 text-sm" style={{ color: '#e8a317' }}
                >
                    ← Back to Claims
                </button>
            </div>
        )
    }

    const statusColor = getStatusColor(claim.status)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/client/insurance-claims')}
                        className="p-2 rounded-lg transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                            {claim.claimNumber}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: '#6b7080' }}>
                            Submitted on {formatDate(claim.createdAt)}
                        </p>
                    </div>
                </div>
                {claim.pdfUrl && (
                    <a
                        href={claim.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:translate-y-[-1px]"
                        style={{
                            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
                        }}
                    >
                        <Download className="w-5 h-5" />
                        Download Report
                    </a>
                )}
            </div>

            {/* Status Banner */}
            <div
                className="rounded-xl p-4"
                style={{ backgroundColor: statusColor.bg, border: `1px solid ${statusColor.border}` }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: statusColor.text }}
                        />
                        <span className="font-semibold text-lg" style={{ color: statusColor.text }}>
                            Status: {claim.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    {!claim.pdfUrl && (
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Your claim report will be available once processed
                        </p>
                    )}
                </div>
                {claim.adminNotes && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${statusColor.border}` }}>
                        <p className="text-sm" style={{ color: '#d8d8d8' }}>
                            <strong>Note from admin:</strong> {claim.adminNotes}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vehicle Info */}
                <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Vehicle Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Make & Model</span>
                            <span className="text-white font-medium">{claim.vehicleMake} {claim.vehicleModel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Year</span>
                            <span className="text-white">{claim.vehicleYear}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Color</span>
                            <span className="text-white">{claim.vehicleColor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Registration</span>
                            <span className="text-white font-mono">{claim.registrationNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Policy Info */}
                <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <FileCheck className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Insurance Policy
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Policy Number</span>
                            <span className="text-white font-mono">{claim.policyNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Company</span>
                            <span className="text-white">{claim.insuranceCompany}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: '#6b7080' }}>Policy Type</span>
                            <span className="text-white">{claim.policyType}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Incident Details */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    Incident Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                    <div>
                        <p className="text-sm mb-1" style={{ color: '#6b7080' }}>Claim Type</p>
                        <p className="text-white font-medium">{claim.claimType}</p>
                    </div>
                    <div>
                        <p className="text-sm mb-1" style={{ color: '#6b7080' }}>Incident Date</p>
                        <p className="text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#6b7080' }} />
                            {formatDate(claim.incidentDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm mb-1" style={{ color: '#6b7080' }}>Estimated Damage</p>
                        <p className="font-semibold" style={{ color: '#e8a317' }}>{formatCurrency(claim.estimatedDamage)}</p>
                    </div>
                </div>
                <div className="mb-4">
                    <p className="text-sm mb-1" style={{ color: '#6b7080' }}>Incident Location</p>
                    <p className="text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4" style={{ color: '#6b7080' }} />
                        {claim.incidentLocation}
                    </p>
                </div>
                <div>
                    <p className="text-sm mb-1" style={{ color: '#6b7080' }}>Description</p>
                    <p className="text-white whitespace-pre-wrap p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', lineHeight: 1.6 }}>
                        {claim.incidentDescription}
                    </p>
                </div>
            </div>

            {/* Help Section */}
            <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(96, 165, 250, 0.05)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                <h3 className="text-white font-medium mb-2">Need Help?</h3>
                <p className="text-sm" style={{ color: '#a1a1aa' }}>
                    If you have questions about your claim or need to provide additional documents,
                    please contact our support team or visit our service center.
                </p>
            </div>
        </div>
    )
}
