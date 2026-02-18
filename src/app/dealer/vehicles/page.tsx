"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Car, Plus, Edit2, Trash2, Star, StarOff, Eye, EyeOff,
    CheckCircle2, AlertCircle, Clock, Loader2, ChevronRight,
    Sparkles, Package, TrendingUp
} from "lucide-react"
import Link from "next/link"

interface Vehicle {
    id: string
    title: string
    make: string
    model: string
    year: number
    price: number
    mileage: number | null
    fuelType: string | null
    vehicleType: string
    status: string
    isFeatured: boolean
    images: string | null
    city: string | null
    createdAt: string
}

interface Capabilities {
    canAddVehicles: boolean
    canFeatureVehicles: boolean
    maxVehicles: number
    maxFeaturedCars: number
    endDate: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: Clock },
    ACTIVE: { label: "Active", color: "text-white bg-white/10 border-white/20", icon: CheckCircle2 },
    SOLD: { label: "Sold", color: "text-gray-300 bg-white/5 border-white/10", icon: CheckCircle2 },
    INACTIVE: { label: "Inactive", color: "text-gray-500 bg-white/5 border-white/5", icon: AlertCircle },
}

export default function DealerVehiclesPage() {
    const router = useRouter()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [capabilities, setCapabilities] = useState<Capabilities | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            const res = await fetch("/api/dealer/vehicles")
            if (res.ok) {
                const data = await res.json()
                setVehicles(data.vehicles || [])
                setCapabilities(data.capabilities || null)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (vehicleId: string, newStatus: string) => {
        setActionLoading(vehicleId + "-status")
        try {
            const res = await fetch(`/api/dealer/vehicles/${vehicleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) fetchVehicles()
            else {
                const d = await res.json()
                alert(d.error || "Failed to update status")
            }
        } finally {
            setActionLoading(null)
        }
    }

    const handleToggleFeatured = async (vehicle: Vehicle) => {
        if (!vehicle.isFeatured && !capabilities?.canFeatureVehicles) {
            alert("You need a Featured or Combo plan to mark vehicles as featured.")
            return
        }
        setActionLoading(vehicle.id + "-featured")
        try {
            const res = await fetch(`/api/dealer/vehicles/${vehicle.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFeatured: !vehicle.isFeatured }),
            })
            if (res.ok) fetchVehicles()
            else {
                const d = await res.json()
                alert(d.error || "Failed to update featured status")
            }
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (vehicleId: string) => {
        setActionLoading(vehicleId + "-delete")
        try {
            const res = await fetch(`/api/dealer/vehicles/${vehicleId}`, { method: "DELETE" })
            if (res.ok) {
                setDeleteConfirm(null)
                fetchVehicles()
            } else {
                alert("Failed to delete vehicle")
            }
        } finally {
            setActionLoading(null)
        }
    }

    const getFirstImage = (images: string | null) => {
        if (!images) return null
        try {
            const arr = JSON.parse(images)
            return arr[0] || null
        } catch {
            return null
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <main>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <h1 className="font-display text-5xl font-extrabold tracking-tight mb-2 uppercase italic">
                            My <span className="text-white">Vehicles</span>
                        </h1>
                        <p className="text-[#888] text-sm tracking-widest uppercase font-medium">
                            Manage your used car & bike listings
                        </p>
                    </div>
                    {capabilities?.canAddVehicles ? (
                        <Link
                            href="/dealer/vehicles/add"
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                        >
                            <Plus className="w-4 h-4" /> Add Vehicle
                        </Link>
                    ) : (
                        <Link
                            href="/dealer/packages"
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-[#888] px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                        >
                            <Package className="w-4 h-4" /> Get a Plan to Add Vehicles
                        </Link>
                    )}
                </div>

                {/* Plan Status Banner */}
                {capabilities && (
                    <div className={`mb-8 p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${capabilities.canAddVehicles
                        ? "bg-white/5 border-white/20"
                        : "bg-white/5 border-white/10 opacity-60"
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${capabilities.canAddVehicles ? "bg-white/10 text-white" : "bg-white/5 text-gray-500"}`}>
                                {capabilities.canAddVehicles ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm">
                                    {capabilities.canAddVehicles ? "Active Plan" : "No Active Plan"}
                                </p>
                                <p className="text-xs text-[#888]">
                                    {capabilities.canAddVehicles
                                        ? `${vehicles.filter(v => v.status !== "SOLD").length} / ${capabilities.maxVehicles} vehicles used · ${capabilities.canFeatureVehicles ? "Featured enabled" : "Featured not included"}`
                                        : "Purchase a plan to start listing vehicles"}
                                </p>
                            </div>
                        </div>
                        {capabilities.endDate && (
                            <p className="text-xs text-[#666]">
                                Expires: {new Date(capabilities.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        )}
                    </div>
                )}

                {/* Vehicles Grid */}
                {vehicles.length === 0 ? (
                    <div className="text-center py-24 bg-[#111] border border-white/5 rounded-[2.5rem]">
                        <Car className="w-16 h-16 text-[#333] mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-3">No Vehicles Yet</h3>
                        <p className="text-[#888] text-sm mb-8">
                            {capabilities?.canAddVehicles
                                ? "Start by adding your first vehicle listing."
                                : "Purchase a plan to start listing your vehicles."}
                        </p>
                        {capabilities?.canAddVehicles ? (
                            <Link href="/dealer/vehicles/add" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                                <Plus className="w-4 h-4" /> Add First Vehicle
                            </Link>
                        ) : (
                            <Link href="/dealer/packages" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                                View Plans <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => {
                            const img = getFirstImage(vehicle.images)
                            const statusCfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.DRAFT
                            const StatusIcon = statusCfg.icon
                            return (
                                <div
                                    key={vehicle.id}
                                    className={`bg-[#111] border rounded-[2rem] overflow-hidden flex flex-col transition-all hover:border-white/10 ${vehicle.isFeatured ? "border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]" : "border-white/5"}`}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-[#0a0a0a] overflow-hidden">
                                        {img ? (
                                            <img src={img} alt={vehicle.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Car className="w-16 h-16 text-[#222]" />
                                            </div>
                                        )}
                                        {vehicle.isFeatured && (
                                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(255,255,255,0.2)]">
                                                <Sparkles className="w-3 h-3" /> Featured
                                            </div>
                                        )}
                                        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusCfg.color}`}>
                                            <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{vehicle.title}</h3>
                                        <p className="text-[#888] text-xs mb-4">
                                            {vehicle.year} · {vehicle.fuelType || "—"} · {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—"}
                                            {vehicle.city ? ` · ${vehicle.city}` : ""}
                                        </p>
                                        <p className="text-2xl font-extrabold text-white mb-6">
                                            ₹{vehicle.price.toLocaleString("en-IN")}
                                        </p>

                                        {/* Status Changer */}
                                        <div className="flex gap-2 mb-4 flex-wrap">
                                            {["DRAFT", "ACTIVE", "SOLD"].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusChange(vehicle.id, s)}
                                                    disabled={vehicle.status === s || actionLoading === vehicle.id + "-status"}
                                                    className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border transition-all ${vehicle.status === s
                                                        ? STATUS_CONFIG[s].color
                                                        : "border-white/10 text-[#555] hover:border-white/20 hover:text-white"
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-auto">
                                            <Link
                                                href={`/dealer/vehicles/${vehicle.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </Link>
                                            <button
                                                onClick={() => handleToggleFeatured(vehicle)}
                                                disabled={actionLoading === vehicle.id + "-featured"}
                                                title={!capabilities?.canFeatureVehicles ? "Upgrade to Featured plan" : ""}
                                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${vehicle.isFeatured
                                                    ? "bg-white/10 border-white/30 text-white hover:bg-white/20"
                                                    : capabilities?.canFeatureVehicles
                                                        ? "bg-white/5 border-white/10 text-[#888] hover:text-white hover:border-white/30"
                                                        : "bg-white/5 border-white/5 text-[#333] cursor-not-allowed"
                                                    }`}
                                            >
                                                {vehicle.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(vehicle.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-red-500/30 rounded-[2rem] p-8 max-w-sm w-full">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">Delete Vehicle?</h3>
                        <p className="text-[#888] text-sm text-center mb-8">This action cannot be undone. The listing will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={actionLoading === deleteConfirm + "-delete"}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading === deleteConfirm + "-delete" ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
