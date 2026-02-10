"use client"

import { useState, useEffect } from "react"
import {
    Loader2,
    CheckCircle2,
    Clock,
    Eye,
    ChevronDown,
    Search,
    Filter,
    MoreHorizontal,
    X,
    MessageSquare,
    Save,
    FileText,
    AlertCircle,
    XCircle
} from "lucide-react"

interface InsuranceRequest {
    id: string
    claimNumber: string
    userId: string
    status: "SUBMITTED" | "UNDER_REVIEW" | "PENDING_DOCUMENTS" | "APPROVED" | "REJECTED" | "COMPLETED"

    // Customer Details
    user: {
        name: string
        email: string
        mobile?: string | null
    }

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

    documents?: Array<{
        id: string
        fileName: string
        fileUrl: string
        fileType: string
    }>
}

export default function InsuranceRequestsPage() {
    const [requests, setRequests] = useState<InsuranceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<InsuranceRequest | null>(null)

    // Edit States
    const [editStatus, setEditStatus] = useState<string>("")
    const [editAdminNotes, setEditAdminNotes] = useState("")
    const [editAdminMessage, setEditAdminMessage] = useState("")
    const [saving, setSaving] = useState(false)

    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const params = new URLSearchParams({
                source: 'ONLINE',
                pageSize: '100'
            })
            const res = await fetch(`/api/admin/insurance-claims?${params}`)
            const data = await res.json()
            if (data.claims) setRequests(data.claims)
        } catch (error) {
            console.error("Failed to fetch requests", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRequests = requests.filter(req => {
        const query = searchQuery.toLowerCase()
        return (
            req.user.name.toLowerCase().includes(query) ||
            req.user.email.toLowerCase().includes(query) ||
            req.claimNumber.toLowerCase().includes(query) ||
            req.vehicleMake.toLowerCase().includes(query) ||
            req.vehicleModel.toLowerCase().includes(query) ||
            req.policyNumber.toLowerCase().includes(query) ||
            req.status.toLowerCase().includes(query)
        )
    })

    const handleOpenRequest = (req: InsuranceRequest) => {
        setSelectedRequest(req)
        setEditStatus(req.status)
        setEditAdminNotes(req.adminNotes || "")
        setEditAdminMessage(req.adminMessage || "")
    }

    const handleSave = async () => {
        if (!selectedRequest) return
        setSaving(true)
        try {
            console.log('Saving request:', selectedRequest.id)
            console.log('Data:', { status: editStatus, adminNotes: editAdminNotes, adminMessage: editAdminMessage })

            const res = await fetch(`/api/admin/insurance-claims/${selectedRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: editStatus,
                    adminNotes: editAdminNotes,
                    adminMessage: editAdminMessage
                })
            })

            console.log('Response status:', res.status, res.statusText)

            let data
            try {
                data = await res.json()
                console.log('Response data:', data)
            } catch (e) {
                console.error('Failed to parse JSON response:', e)
                data = {}
            }

            if (res.ok) {
                // Update local list
                setRequests(prev => prev.map(r =>
                    r.id === selectedRequest.id
                        ? { ...r, status: editStatus as any, adminNotes: editAdminNotes, adminMessage: editAdminMessage }
                        : r
                ))
                setSelectedRequest(null) // Close modal
                alert('Request updated successfully!')
            } else {
                console.error('Failed to update. Status:', res.status)
                console.error('Error data:', data)
                alert(`Failed to update: ${data.error || res.statusText || 'Unknown error'}`)
            }
        } catch (error) {
            console.error("Failed to update - exception:", error)
            alert('Failed to update request. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" /></div>

    return (
        <div className="flex-1 p-6 lg:p-8 overflow-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Insurance Requests</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage online client insurance claim submissions</p>
                </div>

                {/* Professional Search Bar */}
                <div className="relative group w-full md:w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#e8a317] transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-[#161921] border border-white/10 rounded-xl leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#111318] focus:ring-1 focus:ring-[#e8a317] focus:border-[#e8a317] sm:text-sm transition-all duration-300 shadow-sm hover:border-white/20"
                        placeholder="Search client, policy, vehicle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        <div className="h-5 w-5 rounded border border-white/10 flex items-center justify-center bg-white/5 text-[10px] text-gray-500 font-mono">/</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/10 bg-[#161921] overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#111318] text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-white/10">
                        <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Mobile</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4">Policy</th>
                            <th className="p-4">Claim Type</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                            <Search className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <p className="text-gray-400 font-medium">No requests found</p>
                                        <p className="text-sm text-gray-600">Try adjusting your search terms</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 font-bold text-xs border border-white/5">
                                                {req.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-[#e8a317] transition-colors">{req.user.name}</div>
                                                <div className="text-xs text-gray-500">{req.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-300 font-mono tracking-wide">
                                            {req.user.mobile || <span className="text-gray-600">-</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-white">{req.vehicleMake} {req.vehicleModel}</div>
                                        <div className="text-xs text-gray-500">{req.vehicleYear} • {req.registrationNumber}</div>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm font-mono">
                                        {req.policyNumber}
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        {req.claimType}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm font-mono">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                            ${req.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    req.status === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        req.status === 'PENDING_DOCUMENTS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}
                                        >
                                            {req.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                            {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                                            {req.status === 'UNDER_REVIEW' && <Eye className="w-3 h-3" />}
                                            {req.status === 'PENDING_DOCUMENTS' && <FileText className="w-3 h-3" />}
                                            {req.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                            {req.status === 'SUBMITTED' && <Clock className="w-3 h-3" />}
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenRequest(req)}
                                            className="p-2 hover:bg-[#e8a317]/10 rounded-lg text-gray-400 hover:text-[#e8a317] transition-all border border-transparent hover:border-[#e8a317]/20"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal (Side Panel) */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)} />
                    <div className="relative w-full max-w-md bg-[#111318] border-l border-white/10 h-full p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#111318] z-10 py-2 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#60a5fa] rounded-full"></span>
                                Review Request
                            </h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 pb-10">
                            {/* Claim Number Badge */}
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <div className="text-xs text-blue-400 font-semibold mb-1">Claim Number</div>
                                <div className="text-xl font-bold text-white font-mono">{selectedRequest.claimNumber}</div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Client Details</p>
                                    <div className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300 border border-white/5">ID: {selectedRequest.userId.substring(0, 6)}...</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {selectedRequest.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-lg">{selectedRequest.user.name}</p>
                                        <p className="text-sm text-gray-400">{selectedRequest.user.email}</p>
                                        {selectedRequest.user.mobile && (
                                            <p className="text-sm text-[#60a5fa] mt-1 font-mono">{selectedRequest.user.mobile}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                                <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                    <span className="p-1 rounded bg-[#60a5fa]/10 text-[#60a5fa]"><Filter className="w-3 h-3" /></span>
                                    Vehicle Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Make & Model</p>
                                        <p className="text-white text-sm font-medium">{selectedRequest.vehicleMake} {selectedRequest.vehicleModel}</p>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Year</p>
                                        <p className="text-white text-sm font-medium">{selectedRequest.vehicleYear}</p>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Registration</p>
                                        <p className="text-white text-sm font-medium font-mono">{selectedRequest.registrationNumber}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Insurance & Claim Details */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                                <p className="text-sm font-semibold text-gray-300">Insurance & Claim Information</p>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Policy Number</p>
                                        <p className="text-white text-sm font-mono">{selectedRequest.policyNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Insurance Company</p>
                                        <p className="text-white text-sm">{selectedRequest.insuranceCompany}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Claim Type</p>
                                        <p className="text-white text-sm">{selectedRequest.claimType}</p>
                                    </div>
                                    {selectedRequest.estimatedDamage && (
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Estimated Damage</p>
                                            <p className="text-[#e8a317] text-lg font-bold">
                                                ₹{selectedRequest.estimatedDamage.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Incident Description */}
                            {selectedRequest.incidentDescription && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2 pl-1">Incident Description</label>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-300 text-sm min-h-[80px] leading-relaxed relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-white/10 rounded-l-2xl"></div>
                                        {selectedRequest.incidentDescription}
                                    </div>
                                </div>
                            )}

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center"><span className="bg-[#111318] px-3 text-xs text-gray-500 uppercase tracking-widest font-semibold">Admin Actions</span></div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 pl-1">Status</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full bg-[#161921] border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#e8a317] appearance-none cursor-pointer hover:border-white/20 transition-colors"
                                    >
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="PENDING_DOCUMENTS">Pending Documents</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Admin Internal Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 pl-1">Internal Admin Note</label>
                                <textarea
                                    value={editAdminNotes}
                                    onChange={(e) => setEditAdminNotes(e.target.value)}
                                    placeholder="Only visible to admins..."
                                    className="w-full bg-[#161921] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#e8a317] min-h-[80px] placeholder:text-gray-600 focus:ring-1 focus:ring-[#e8a317]/50 transition-all"
                                />
                            </div>

                            {/* Admin Message to Client */}
                            <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                <label className="block text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Message to Client
                                </label>
                                <textarea
                                    value={editAdminMessage}
                                    onChange={(e) => setEditAdminMessage(e.target.value)}
                                    placeholder="This will be emailed and shown to the client..."
                                    className="w-full bg-[#161921]/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 min-h-[100px] placeholder:text-gray-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />
                                <p className="text-[10px] text-gray-500 mt-2 text-right">Client will be notified via email</p>
                            </div>

                            <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#111318] to-transparent pb-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-[#e8a317] hover:bg-[#d49510] text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
