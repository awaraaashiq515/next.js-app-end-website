"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Edit2,
    Trash2,
    Package,
    ToggleLeft,
    ToggleRight,
    Search,
    Filter,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Car
} from "lucide-react"

interface DealerPackage {
    id: string
    name: string
    type: string
    price: number
    durationDays: number
    maxVehicles: number
    maxFeaturedCars: number
    status: string
    isPopular: boolean
    createdAt: string
}

export default function AdminDealerPackagesPage() {
    const [packages, setPackages] = useState<DealerPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("ALL")
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/dealer-packages")
            if (res.ok) {
                const data = await res.json()
                setPackages(data.packages || [])
            } else {
                throw new Error("Failed to fetch packages")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (pkg: DealerPackage) => {
        try {
            setTogglingId(pkg.id)
            const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            const res = await fetch(`/api/admin/dealer-packages/${pkg.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                setPackages(prev =>
                    prev.map(p => (p.id === pkg.id ? { ...p, status: newStatus } : p))
                )
            }
        } catch (err) {
            console.error("Toggle error:", err)
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        try {
            setDeletingId(id)
            const res = await fetch(`/api/admin/dealer-packages/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                setPackages(prev => prev.filter(p => p.id !== id))
            } else {
                const data = await res.json()
                alert(data.error || "Failed to delete package")
            }
        } catch (err) {
            console.error("Delete error:", err)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "ALL" || pkg.type === filterType
        return matchesSearch && matchesType
    })

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-24">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">
                        Dealer <span className="text-gray-400">Packages</span>
                    </h1>
                    <p className="text-[#888] text-sm mt-1">Manage subscription plans for your dealer ecosystem.</p>
                </div>
                <Link
                    href="/admin/dealer-packages/create"
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gray-200 transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Create New Plan
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                    <input
                        type="text"
                        placeholder="Search by plan name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Types</option>
                            <option value="VEHICLE">Vehicle Plans</option>
                            <option value="FEATURED">Featured Plans</option>
                            <option value="COMBO">Combo Plans</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Packages List */}
            {filteredPackages.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] py-24 text-center">
                    <Package className="w-16 h-16 text-[#222] mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">No packages found</h3>
                    <p className="text-[#666] text-sm">Create your first dealer subscription plan to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`group relative bg-[#111] border rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:scale-[1.02] ${pkg.isPopular ? "border-white/30 shadow-2xl" : "border-white/5"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${pkg.type === "VEHICLE" ? "bg-white/5 border-white/10 text-white" :
                                        pkg.type === "FEATURED" ? "bg-white/10 border-white/20 text-white" :
                                            "bg-white border-white/10 text-black"
                                    }`}>
                                    {pkg.type === "VEHICLE" && <Car className="w-6 h-6" />}
                                    {pkg.type === "FEATURED" && <Sparkles className="w-6 h-6" />}
                                    {pkg.type === "COMBO" && <Package className="w-6 h-6" />}
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(pkg)}
                                    disabled={togglingId === pkg.id}
                                    className="transition-all hover:scale-110"
                                >
                                    {togglingId === pkg.id ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-[#444]" />
                                    ) : pkg.status === "ACTIVE" ? (
                                        <ToggleRight className="w-8 h-8 text-white" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8 text-[#444]" />
                                    )}
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white group-hover:text-gray-300 transition-colors uppercase tracking-tight">{pkg.name}</h3>
                                <p className="text-xs text-[#666] font-bold mt-1 uppercase tracking-widest">{pkg.durationDays} Days Duration</p>
                            </div>

                            <div className="mb-8 p-4 bg-black/40 rounded-2xl border border-white/5 flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-white italic">₹{pkg.price}</span>
                                <span className="text-[10px] text-[#444] font-bold uppercase tracking-widest">/ Cycle</span>
                            </div>

                            <div className="space-y-3 mb-8 flex-1">
                                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#888]">
                                    <span>Listings</span>
                                    <span className="text-white">{pkg.maxVehicles}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#888]">
                                    <span>Featured</span>
                                    <span className="text-white">{pkg.maxFeaturedCars}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-white/5">
                                <Link
                                    href={`/admin/dealer-packages/${pkg.id}/edit`}
                                    className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#888] hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(pkg.id)}
                                    disabled={deletingId === pkg.id}
                                    className="flex-1 bg-red-500/5 border border-red-500/10 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-red-900/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                >
                                    {deletingId === pkg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Trash2 className="w-3 h-3" /> Delete</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
