"use client"

import {
    ClipboardCheck,
    Package,
    TrendingUp,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Stat {
    label: string
    value: string
    icon: any
    color: string
    bgColor: string
}

export default function ClientDashboard() {
    const [pdiRequest, setPdiRequest] = useState<any>(null)
    const [stats, setStats] = useState<Stat[]>([])
    const [recentActivities, setRecentActivities] = useState<any[]>([])
    const [hasPackage, setHasPackage] = useState<boolean>(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, insRes, pdiRes] = await Promise.all([
                    fetch("/api/client/stats"),
                    fetch("/api/client/inspections"),
                    fetch("/api/client/pdi-request")
                ])

                const statsData = await statsRes.json()
                const insData = await insRes.json()
                const pdiData = await pdiRes.json()

                if (pdiData.request) {
                    setPdiRequest(pdiData.request)
                }

                if (statsData.stats) {
                    const icons = {
                        "Active Packages": { icon: Package, color: "#e8a317", bgColor: "rgba(232, 163, 23, 0.1)" },
                        "PDI Balance": { icon: TrendingUp, color: "#c084fc", bgColor: "rgba(192, 132, 252, 0.1)" },
                        "Total Inspections": { icon: ClipboardCheck, color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.1)" },
                        "Total Inquiries": { icon: MessageSquare, color: "#f472b6", bgColor: "rgba(244, 114, 182, 0.1)" },
                        "Appointments": { icon: Calendar, color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.1)" }
                    }

                    const mappedStats = statsData.stats.map((s: any) => ({
                        ...s,
                        ...(icons[s.label as keyof typeof icons] || { icon: Calendar, color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.1)" })
                    }))
                    setStats(mappedStats)

                    const activePkg = statsData.stats.find((s: any) => s.label === "Active Packages")
                    setHasPackage(parseInt(activePkg?.value || "0") > 0)
                }

                if (insData.inspections) {
                    const mappedIns = insData.inspections.slice(0, 3).map((ins: any) => ({
                        id: ins.id,
                        type: "PDI",
                        message: `Inspection ready for ${ins.vehicleMake} ${ins.vehicleModel}`,
                        time: new Date(ins.inspectionDate).toLocaleDateString()
                    }))
                    setRecentActivities(mappedIns)
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return { color: "#e8a317", label: "Pending Review" }
            case "VIEWED": return { color: "#60a5fa", label: "Under Review" }
            case "APPROVED": return { color: "#4ade80", label: "Approved" }
            default: return { color: "#e8a317", label: "Status Unknown" }
        }
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Car Care</h2>
                <p style={{ color: '#6b7080' }}>Manage your services and track inspection reports.</p>
            </div>

            {/* PDI Report Ready Notification */}
            {recentActivities.some(a => a.type === "PDI") && (
                <div
                    className="p-4 rounded-xl flex items-center justify-between bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/20 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                            <p className="text-sm font-bold text-white">Your PDI report is ready.</p>
                            <p className="text-xs" style={{ color: '#6b7080' }}>A new inspection report has been uploaded to your account.</p>
                        </div>
                    </div>
                    <Link href="/client/pdi-reports">
                        <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black transition-all font-bold">
                            View Report
                        </Button>
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
                        style={{
                            backgroundColor: '#111318',
                            border: '1px solid rgba(255,255,255,0.07)'
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-sm" style={{ color: '#6b7080' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.07)'
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <button className="text-sm hover:text-white transition-colors" style={{ color: '#e8a317' }}>
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) =>
                                activity.type === "PDI" ? (
                                    <Link
                                        key={index}
                                        href={`/client/inspections/${activity.id}`}
                                        className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-white/[0.04] group/item"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: 'rgba(74, 222, 128, 0.1)'
                                            }}
                                        >
                                            <ClipboardCheck className="w-5 h-5 text-green-400 group-hover/item:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate group-hover/item:text-amber-500 transition-colors">{activity.message}</p>
                                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>{activity.time}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-700 self-center group-hover/item:text-amber-500 group-hover/item:translate-x-1 transition-all" />
                                    </Link>
                                ) : (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-4 rounded-xl"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: activity.type === "Package"
                                                    ? 'rgba(232, 163, 23, 0.1)'
                                                    : 'rgba(96, 165, 252, 0.1)'
                                            }}
                                        >
                                            {activity.type === "Package" && <Package className="w-5 h-5" style={{ color: '#e8a317' }} />}
                                            {activity.type === "Service" && <Calendar className="w-5 h-5" style={{ color: '#60a5fa' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{activity.message}</p>
                                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>{activity.time}</p>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                                <p className="text-sm text-gray-500">No recent activity to show.</p>
                                <Link href="/packages" className="text-xs text-[#e8a317] hover:underline mt-2 inline-block">Purchase a package to get started</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / New Booking */}
                <div
                    className="p-6 rounded-2xl flex flex-col justify-between"
                    style={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backgroundImage: 'radial-gradient(circle at top right, rgba(232, 163, 23, 0.05), transparent)'
                    }}
                >
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Need a service?</h3>
                        <p className="text-sm mb-6" style={{ color: '#6b7080' }}>Book a new appointment or use your package for a vehicle inspection.</p>

                        <div className="space-y-3">
                            {/* Conditional PDI Button - now shows Status if active request */}
                            {pdiRequest ? (
                                <Link href="/client/pdi-confirmation" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <ClipboardCheck className="w-5 h-5" style={{ color: getStatusColor(pdiRequest.status).color }} />
                                        <div className="text-left">
                                            <span className="text-sm font-bold text-white block">PDI Confirmation Status</span>
                                            <span className="text-xs font-semibold" style={{ color: getStatusColor(pdiRequest.status).color }}>
                                                {getStatusColor(pdiRequest.status).label}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : stats.find(s => s.label === "PDI Balance" && parseInt(s.value) > 0) ? (
                                <Link href="/client/pdi-confirmation" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#e8a317]/20 to-transparent border border-[#e8a317]/30 hover:border-[#e8a317]/60 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <ClipboardCheck className="w-5 h-5" style={{ color: '#e8a317' }} />
                                        <div className="text-left">
                                            <span className="text-sm font-bold text-white block">Submit PDI Confirmation</span>
                                            <span className="text-xs" style={{ color: '#e8a317' }}>Submit request</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#e8a317] group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link href="/packages" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#e8a317]/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Package className="w-5 h-5" style={{ color: '#e8a317' }} />
                                        <div className="text-left">
                                            <span className="text-sm font-medium text-white block">No PDIs Remaining</span>
                                            <span className="text-xs" style={{ color: '#6b7080' }}>Buy a new package to continue</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            <Link href="/packages" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5" style={{ color: '#60a5fa' }} />
                                    <span className="text-sm font-medium text-white">View Packages</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-[#e8a317]/10 to-transparent border border-[#e8a317]/20">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#e8a317' }}>Support</p>
                        <p className="text-[13px] text-white/80">Have questions about your reports? Contact our help desk.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
