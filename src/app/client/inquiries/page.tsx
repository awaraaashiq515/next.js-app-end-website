"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Car, Clock, ChevronRight, Loader2, Plus, MessageSquare } from "lucide-react"

interface VehicleInquiry {
    id: string
    customerName: string
    customerMobile: string
    message: string | null
    status: string
    createdAt: string
    vehicle: {
        id: string
        title: string
        make: string
        model: string
        year: number
        price: number
        images: string
    }
    dealer: {
        name: string
        dealerBusinessName: string | null
        dealerCity: string | null
    }
}

interface ServiceInquiry {
    id: string
    subject: string
    description: string
    status: string
    createdAt: string
    _count: { messages: number }
}

const STATUS_CONFIG_VEHICLE: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    CONTACTED: { label: "Contacted", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    CLOSED: { label: "Closed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    SPAM: { label: "Spam", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

const STATUS_CONFIG_SERVICE: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending", color: "#e8a317", bg: "rgba(232,163,23,0.12)" },
    IN_PROCESS: { label: "In Process", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    COMPLETED: { label: "Completed", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    REJECTED: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
}

function StatusBadge({ status, type }: { status: string, type: "vehicle" | "service" }) {
    const config = type === "vehicle" ? STATUS_CONFIG_VEHICLE : STATUS_CONFIG_SERVICE
    const cfg = config[status] || config.PENDING
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
        </span>
    )
}

export default function ClientInquiriesPage() {
    const [activeTab, setActiveTab] = useState<"cars" | "services">("cars")
    const [vehicleInquiries, setVehicleInquiries] = useState<VehicleInquiry[]>([])
    const [serviceInquiries, setServiceInquiries] = useState<ServiceInquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        setLoading(true)
        const endpoint = activeTab === "cars" ? "/api/client/vehicle-inquiries" : "/api/client/service-inquiries"
        fetch(endpoint)
            .then(r => r.json())
            .then(d => {
                if (activeTab === "cars") {
                    if (d.inquiries) setVehicleInquiries(d.inquiries)
                    else setError(d.error || "Failed to load")
                } else {
                    if (d.inquiries) setServiceInquiries(d.inquiries)
                    else setError(d.error || "Failed to load")
                }
            })
            .catch(() => setError("Failed to load inquiries"))
            .finally(() => setLoading(false))
    }, [activeTab])

    const renderVehicleInquiries = () => (
        <div className="space-y-3">
            {vehicleInquiries.map(inq => {
                let thumbUrl = ""
                try { const imgs = JSON.parse(inq.vehicle.images); thumbUrl = imgs[0] || "" } catch { }
                return (
                    <div key={inq.id} className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <Link href={`/cars/${inq.vehicle.id}`} className="flex-shrink-0">
                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                                {thumbUrl ? <img src={thumbUrl} alt={inq.vehicle.title} className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-gray-600" />}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Link href={`/cars/${inq.vehicle.id}`} className="text-sm font-semibold text-white hover:text-[#e8a317] truncate">{inq.vehicle.title}</Link>
                                <StatusBadge status={inq.status} type="vehicle" />
                            </div>
                            <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                                {inq.vehicle.make} {inq.vehicle.model} · {inq.vehicle.year} · <span style={{ color: "#e8a317" }}>₹{inq.vehicle.price?.toLocaleString("en-IN")}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: "#4b5563" }}>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(inq.createdAt).toLocaleDateString("en-IN")}</span>
                                <span>Dealer: {inq.dealer.dealerBusinessName || inq.dealer.name}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href={`/client/inquiries/${inq.id}`} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white text-center">Chat</Link>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    const renderServiceInquiries = () => (
        <div className="space-y-3">
            {serviceInquiries.map(inq => (
                <div key={inq.id} className="flex items-center gap-4 p-5 rounded-2xl"
                    style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10 text-blue-400">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-bold text-white truncate">{inq.subject}</p>
                            <StatusBadge status={inq.status} type="service" />
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{inq.description}</p>
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-[#4b5563]">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(inq.createdAt).toLocaleDateString("en-IN")}</span>
                            <span>{inq._count?.messages || 0} Messages</span>
                        </div>
                    </div>
                    <Link href={`/client/service-inquiries/${inq.id}`}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                        style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8a317" }}>
                        View Chat
                    </Link>
                </div>
            ))}
        </div>
    )

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">My Inquiries</h2>
                    <p className="text-sm" style={{ color: "#6b7080" }}>Track your vehicle enquiries and service requests.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/cars" className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Browse Cars</Link>
                    <Link href="/client/inquiries/submit" className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all" style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)", color: "#000" }}>New Inquiry</Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[#111318] border border-white/5 w-fit">
                <button onClick={() => setActiveTab("cars")}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "cars" ? "bg-[#e8a317] text-black" : "text-gray-500 hover:text-white"}`}>
                    Cars
                </button>
                <button onClick={() => setActiveTab("services")}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "services" ? "bg-[#60a5fa] text-white" : "text-gray-500 hover:text-white"}`}>
                    Services
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" /></div>
            ) : error ? (
                <p className="text-red-400 text-center py-12">{error}</p>
            ) : (activeTab === "cars" ? (vehicleInquiries.length > 0 ? renderVehicleInquiries() : <EmptyState icon={Car} title="No Car Inquiries" desc="Submit an inquiry on any car listing." />)
                : (serviceInquiries.length > 0 ? renderServiceInquiries() : <EmptyState icon={MessageSquare} title="No Service Inquiries" desc="Submit a general inquiry for help or services." />))
            }
        </div>
    )
}

function EmptyState({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/5 bg-[#111318]">
            <Icon className="w-12 h-12 mb-4 text-gray-800" />
            <p className="text-base font-bold text-white mb-1">{title}</p>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    )
}
