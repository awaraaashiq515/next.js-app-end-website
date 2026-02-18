"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2, X, AlertCircle, Loader2, Trash2, Star, StarOff,
    Car, Bike, Search, RefreshCw, Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface DealerVehicle {
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
    dealer: {
        id: string
        name: string
        email: string
        dealerBusinessName: string | null
    }
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SOLD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    INACTIVE: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function AdminDealerVehiclesPage() {
    const [vehicles, setVehicles] = useState<DealerVehicle[]>([])
    const [filtered, setFiltered] = useState<DealerVehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    useEffect(() => { fetchVehicles() }, [])
    useEffect(() => {
        let f = vehicles
        if (statusFilter !== "ALL") f = f.filter(v => v.status === statusFilter)
        if (search) {
            const q = search.toLowerCase()
            f = f.filter(v =>
                v.title.toLowerCase().includes(q) ||
                v.dealer.name.toLowerCase().includes(q) ||
                v.make.toLowerCase().includes(q) ||
                v.model.toLowerCase().includes(q)
            )
        }
        setFiltered(f)
    }, [vehicles, statusFilter, search])

    const fetchVehicles = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/dealer-vehicles")
            if (res.ok) {
                const data = await res.json()
                setVehicles(data.vehicles || [])
            }
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFeatured = async (vehicle: DealerVehicle) => {
        setActionLoading(vehicle.id + "-feat")
        try {
            const res = await fetch(`/api/admin/dealer-vehicles/${vehicle.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFeatured: !vehicle.isFeatured }),
            })
            if (res.ok) fetchVehicles()
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (id: string) => {
        setActionLoading(id + "-del")
        try {
            const res = await fetch(`/api/admin/dealer-vehicles/${id}`, { method: "DELETE" })
            if (res.ok) { setDeleteConfirm(null); fetchVehicles() }
        } finally {
            setActionLoading(null)
        }
    }

    const getFirstImage = (images: string | null) => {
        if (!images) return null
        try { return JSON.parse(images)[0] || null } catch { return null }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display">Dealer Vehicles</h1>
                    <p className="text-muted-foreground">Manage all dealer vehicle listings</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchVehicles}>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: vehicles.length, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Active", value: vehicles.filter(v => v.status === "ACTIVE").length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Featured", value: vehicles.filter(v => v.isFeatured).length, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Sold", value: vehicles.filter(v => v.status === "SOLD").length, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((s, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                <h3 className="text-2xl font-bold mt-0.5">{s.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl ${s.bg}`}>
                                <Car className={`h-5 w-5 ${s.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card border rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vehicles or dealers..." className="pl-9 bg-background/50" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["ALL", "ACTIVE", "DRAFT", "SOLD", "INACTIVE"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === s ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Dealer</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Featured</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No vehicles found.</td></tr>
                            ) : filtered.map(vehicle => {
                                const img = getFirstImage(vehicle.images)
                                return (
                                    <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                    {img ? (
                                                        <img src={img} alt={vehicle.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {vehicle.vehicleType === "BIKE" ? <Bike className="w-5 h-5 text-muted-foreground" /> : <Car className="w-5 h-5 text-muted-foreground" />}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground line-clamp-1">{vehicle.title}</p>
                                                    <p className="text-xs text-muted-foreground">{vehicle.year} · {vehicle.fuelType || "—"} · ₹{vehicle.price.toLocaleString("en-IN")}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-sm">{vehicle.dealer.dealerBusinessName || vehicle.dealer.name}</p>
                                            <p className="text-xs text-muted-foreground">{vehicle.dealer.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[vehicle.status] || STATUS_COLORS.DRAFT}`}>
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(vehicle)}
                                                disabled={actionLoading === vehicle.id + "-feat"}
                                                className={`p-2 rounded-lg transition-colors ${vehicle.isFeatured ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"}`}
                                            >
                                                {vehicle.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(vehicle.id)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-sm border-red-500/30 bg-card shadow-2xl">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Delete Vehicle?</h3>
                            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                                <Button variant="destructive" className="flex-1" disabled={actionLoading === deleteConfirm + "-del"} onClick={() => handleDelete(deleteConfirm)}>
                                    {actionLoading === deleteConfirm + "-del" ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
