"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare,
    User as UserIcon,
    Phone,
    Calendar,
    Car,
    ChevronRight,
    Search,
    Loader2,
    CheckCircle2,
    Clock,
    UserCircle
} from "lucide-react"
import Link from "next/link"

export default function DealerInquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchInquiries()
    }, [])

    const fetchInquiries = async () => {
        try {
            const res = await fetch("/api/dealer/inquiries")
            const data = await res.json()
            if (data.inquiries) {
                setInquiries(data.inquiries)
            }
        } catch (error) {
            console.error("Failed to fetch inquiries", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredInquiries = inquiries.filter(inq =>
        inq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.vehicle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inq.customerMobile.includes(searchTerm)
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Customer Inquiries</h1>
                    <p className="text-sm" style={{ color: '#6b7080' }}>
                        Manage your incoming leads and potential sales
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                    type="text"
                    placeholder="Search by name, vehicle or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111318] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-medium"
                />
            </div>

            {/* Inquiries List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-white opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[#444]">Syncing Leads...</p>
                    </div>
                ) : filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => {
                        const images = (() => { try { return JSON.parse(inquiry.vehicle.images || '[]') } catch { return [] } })()
                        const thumb = images[0] || null

                        return (
                            <div
                                key={inquiry.id}
                                className="group relative bg-[#111318] border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Vehicle Info */}
                                    <div className="lg:w-72 flex-shrink-0">
                                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-4 relative">
                                            {thumb ? (
                                                <img src={thumb} alt={inquiry.vehicle.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-10"><Car className="w-12 h-12" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Inquiry For</p>
                                                <h4 className="text-sm font-bold text-white truncate">{inquiry.vehicle.title}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-xs font-black text-[#e8a317]">₹{inquiry.vehicle.price.toLocaleString('en-IN')}</span>
                                            <Link href={`/cars/${inquiry.vehicleId}`} target="_blank" className="text-[10px] font-bold text-[#444] hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                                                View Live <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Inquiry Details */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                                    <UserCircle className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{inquiry.customerName}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-[#6b7080] flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(inquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-[#333]"></span>
                                                        <span className="text-xs font-bold text-[#e8a317] flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(inquiry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inquiry.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    }`}>
                                                    {inquiry.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[#444] mb-3 flex items-center gap-2">
                                                    <Phone className="w-3 h-3" /> Customer Contact
                                                </div>
                                                <a href={`tel:${inquiry.customerMobile}`} className="text-base font-bold text-white hover:text-[#e8a317] transition-colors">{inquiry.customerMobile}</a>
                                            </div>
                                            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[#444] mb-3 flex items-center gap-2">
                                                    <MessageSquare className="w-3 h-3" /> Message
                                                </div>
                                                <p className="text-sm text-[#888] italic">"{inquiry.message || "No message provided"}"</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <button className="flex-1 bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                                <Phone className="w-3.5 h-3.5" /> Call Customer
                                            </button>
                                            <button className="px-6 py-3 rounded-xl border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Contacted
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-32 bg-[#111318] border border-dashed border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-[#222]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Inquiries Yet</h3>
                        <p className="text-[#444] text-sm max-w-xs mx-auto">When customers express interest in your vehicles, they will appear here as leads.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
