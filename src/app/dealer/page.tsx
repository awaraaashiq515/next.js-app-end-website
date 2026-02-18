"use client"

import { useState, useEffect } from "react"
import {
    Car,
    Star,
    Plus,
    Package,
    ChevronRight,
    TrendingUp,
    Eye,
    Activity,
    ArrowUpRight,
    ShieldCheck,
    MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface DealerStats {
    totalVehicles: number
    activeVehicles: number
    featuredVehicles: number
    draftVehicles: number
}

export default function DealerDashboardPage() {
    const [stats, setStats] = useState<any>({
        totalVehicles: 0,
        activeVehicles: 0,
        featuredVehicles: 0,
        draftVehicles: 0,
        totalInquiries: 0,
    })
    const [loading, setLoading] = useState(true)
    const [capabilities, setCapabilities] = useState<any>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [vRes, iRes] = await Promise.all([
                    fetch("/api/dealer/vehicles"),
                    fetch("/api/dealer/inquiries")
                ])

                const vData = await vRes.json()
                const iData = await iRes.json()

                if (vData) {
                    if (vData.vehicles) {
                        const vehicles = vData.vehicles
                        setStats((prev: any) => ({
                            ...prev,
                            totalVehicles: vehicles.length,
                            activeVehicles: vehicles.filter((v: any) => v.status === "ACTIVE").length,
                            featuredVehicles: vehicles.filter((v: any) => v.isFeatured).length,
                            draftVehicles: vehicles.filter((v: any) => v.status === "DRAFT").length,
                        }))
                    }
                    if (vData.capabilities) {
                        setCapabilities(vData.capabilities)
                    }
                }

                if (iData && iData.inquiries) {
                    setStats((prev: any) => ({
                        ...prev,
                        totalInquiries: iData.inquiries.length
                    }))
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const statCards = [
        {
            label: "Total Listings",
            value: stats.totalVehicles,
            icon: Car,
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
            href: "/dealer/vehicles",
        },
        {
            label: "Customer Leads",
            value: stats.totalInquiries,
            icon: MessageSquare,
            color: "#e8a317",
            bg: "rgba(232,163,23,0.1)",
            border: "rgba(232,163,23,0.1)",
            href: "/dealer/inquiries",
        },
        {
            label: "Active Listings",
            value: stats.activeVehicles,
            icon: Activity,
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
            href: "/dealer/vehicles",
        },
        {
            label: "Featured",
            value: stats.featuredVehicles,
            icon: Star,
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
            href: "/dealer/vehicles",
        },
    ]

    const quickActions = [
        {
            title: "Add New Vehicle",
            description: "List a new vehicle in your inventory",
            icon: Plus,
            href: "/dealer/vehicles/add",
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
        },
        {
            title: "Manage Inquiries",
            description: "View and respond to customer leads",
            icon: MessageSquare,
            href: "/dealer/inquiries",
            color: "#e8a317",
            bg: "rgba(232,163,23,0.1)",
            border: "rgba(232,163,23,0.1)",
        },
        {
            title: "My Vehicles",
            description: "View and manage all your listings",
            icon: Car,
            href: "/dealer/vehicles",
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
        },
        {
            title: "Subscription Plans",
            description: "Upgrade your listing limits & features",
            icon: Package,
            href: "/dealer/packages",
            color: "#ffffff",
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.1)",
        },
    ]

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Dealer Dashboard</h1>
                    <p className="text-sm" style={{ color: '#6b7080' }}>
                        Overview of your inventory and performance
                    </p>
                </div>
                <Link
                    href="/dealer/vehicles/add"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                    style={{ background: 'linear-gradient(135deg, #ffffff, #e0e0e0)', color: '#000' }}
                >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                </Link>
            </div>

            {/* Active Plan Status */}
            {!loading && capabilities?.packageName && (
                <div
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#6b7080] mb-0.5">Current Active Plan</p>
                            <h3 className="text-lg font-bold text-white leading-tight">{capabilities.packageName}</h3>
                        </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                        <p className="text-[10px] uppercase tracking-[1px] text-[#6b7080] mb-1">Status: <span className="text-white font-bold">Active</span></p>
                        <p className="text-xs text-[#888]">
                            Valid until {new Date(capabilities.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.href}
                        className="p-5 rounded-2xl transition-all duration-200 hover:translate-y-[-2px] block group"
                        style={{
                            backgroundColor: '#111318',
                            border: `1px solid ${stat.border}`,
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: stat.bg }}
                            >
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }} />
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">
                            {loading ? (
                                <span className="inline-block w-8 h-6 rounded animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            ) : stat.value}
                        </p>
                        <p className="text-xs font-medium" style={{ color: '#6b7080' }}>{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 hover:translate-y-[-1px] group"
                            style={{
                                backgroundColor: '#111318',
                                border: `1px solid ${action.border}`,
                            }}
                        >
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: action.bg }}
                            >
                                <action.icon className="w-5 h-5" style={{ color: action.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white mb-0.5">{action.title}</p>
                                <p className="text-xs truncate" style={{ color: '#6b7080' }}>{action.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: action.color }} />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Getting Started Banner (shown when no vehicles) */}
            {!loading && stats.totalVehicles === 0 && (
                <div
                    className="p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5"
                    style={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ffffff, #a0a0a0)' }}>
                        <Car className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">Start listing your vehicles</h3>
                        <p className="text-sm" style={{ color: '#6b7080' }}>
                            You haven't added any vehicles yet. Add your first listing to get started.
                        </p>
                    </div>
                    <Link
                        href="/dealer/vehicles/add"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ffffff, #e0e0e0)', color: '#000' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add First Vehicle
                    </Link>
                </div>
            )}
        </div>
    )
}
