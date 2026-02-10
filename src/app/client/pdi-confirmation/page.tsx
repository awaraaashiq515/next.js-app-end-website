"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send, CheckCircle2, Clock, Eye, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface PDIRequest {
    id: string
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ISSUES_FOUND"
    adminMessage?: string
    updatedAt: string
}

export default function PDIConfirmationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [request, setRequest] = useState<PDIRequest | null>(null)
    const [notes, setNotes] = useState("")
    const [vehicleName, setVehicleName] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [locationField, setLocationField] = useState("")
    const [preferredDate, setPreferredDate] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        checkStatus()
    }, [])

    const checkStatus = async () => {
        try {
            const res = await fetch("/api/client/pdi-request")
            if (res.status === 403) {
                const data = await res.json()
                if (data.code === "NO_PACKAGE") {
                    router.push("/packages")
                    return
                }
            }
            if (!res.ok) throw new Error("Failed to fetch status")

            const data = await res.json()
            if (data.request) {
                setRequest(data.request)
            }
        } catch (err) {
            console.error(err)
            // SWR or similar would be better but simple fetch is fine
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch("/api/client/pdi-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleName,
                    vehicleModel,
                    location: locationField,
                    preferredDate: preferredDate || undefined,
                    notes
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                if (res.status === 403 && data.code === "NO_PACKAGE") {
                    router.push("/packages")
                    return
                }
                throw new Error(data.error || "Something went wrong")
            }

            setRequest(data.request)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#08090c]">
                <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
            </div>
        )
    }

    return (
        <div className="bg-[#08090c] flex flex-col items-center justify-center">
            <div className="max-w-xl w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">PDI Confirmation</h1>
                    <p className="text-gray-400">
                        {request
                            ? "Track the status of your confirmation request."
                            : "Submit your confirmation to notify the admin team."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Main Content Card */}
                <div
                    className="p-8 rounded-2xl border"
                    style={{
                        backgroundColor: '#111318',
                        borderColor: 'rgba(255,255,255,0.07)'
                    }}
                >
                    {!request ? (
                        /* Submission Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                <p className="text-sm text-blue-400 font-medium mb-1">📋 PDI Request Form</p>
                                <p className="text-xs text-blue-400/80">
                                    Fill in your vehicle details below. Our admin team will perform the PDI inspection.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Vehicle Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={vehicleName}
                                        onChange={(e) => setVehicleName(e.target.value)}
                                        placeholder="e.g., Honda City"
                                        className="w-full bg-[#08090c] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8a317] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Vehicle Model <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={vehicleModel}
                                        onChange={(e) => setVehicleModel(e.target.value)}
                                        placeholder="e.g., 2024 VX"
                                        className="w-full bg-[#08090c] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8a317] transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={locationField}
                                    onChange={(e) => setLocationField(e.target.value)}
                                    placeholder="e.g., Delhi Showroom"
                                    className="w-full bg-[#08090c] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8a317] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Preferred PDI Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={preferredDate}
                                    onChange={(e) => setPreferredDate(e.target.value)}
                                    className="w-full bg-[#08090c] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#e8a317] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Additional Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions or comments..."
                                    className="w-full h-24 bg-[#08090c] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8a317] transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-black bg-gradient-to-r from-[#e8a317] to-[#ff6b35] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                Submit PDI Request
                            </button>
                        </form>
                    ) : (
                        /* Status Display */
                        <div className="space-y-8">
                            {/* Status Indicator */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500"
                                    style={{
                                        backgroundColor:
                                            request.status === "COMPLETED" ? 'rgba(74, 222, 128, 0.1)' :
                                                request.status === "IN_PROGRESS" ? 'rgba(96, 165, 250, 0.1)' :
                                                    request.status === "ISSUES_FOUND" ? 'rgba(239, 68, 68, 0.1)' :
                                                        'rgba(232, 163, 23, 0.1)'
                                    }}
                                >
                                    {request.status === "COMPLETED" && <CheckCircle2 className="w-10 h-10 text-green-400" />}
                                    {request.status === "IN_PROGRESS" && <Eye className="w-10 h-10 text-blue-400" />}
                                    {request.status === "ISSUES_FOUND" && <AlertCircle className="w-10 h-10 text-red-400" />}
                                    {request.status === "PENDING" && <Clock className="w-10 h-10 text-amber-500" />}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {request.status === "COMPLETED" && "PDI Completed"}
                                    {request.status === "IN_PROGRESS" && "PDI In Progress"}
                                    {request.status === "ISSUES_FOUND" && "Issues Found"}
                                    {request.status === "PENDING" && "Pending Review"}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {request.status === "COMPLETED" && "The PDI has been completed by our admin team."}
                                    {request.status === "IN_PROGRESS" && "Our admin team is currently performing the PDI inspection."}
                                    {request.status === "ISSUES_FOUND" && "PDI completed. Some issues were found - please check the message below."}
                                    {request.status === "PENDING" && "Your request has been sent and is awaiting admin review."}
                                </p>
                            </div>

                            {/* Admin Message */}
                            {request.adminMessage && (
                                <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">📌 Admin Update</p>
                                    <p className="text-white text-sm leading-relaxed">
                                        {request.adminMessage}
                                    </p>
                                </div>
                            )}

                            {/* Return Button */}
                            <Link
                                href="/client"
                                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span>Return to Dashboard</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
