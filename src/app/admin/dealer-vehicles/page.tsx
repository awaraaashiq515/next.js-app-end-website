"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2, X, AlertCircle, Loader2, Trash2, Star, StarOff,
    Car, Bike, Search, RefreshCw, Filter, FileText, ImageIcon, Eye,
    ExternalLink, ShieldCheck
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
    pdiStatus: string | null
    pdiType: string | null
    pdiFiles: string | null
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
    const [pdiModal, setPdiModal] = useState<DealerVehicle | null>(null)
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

    const handleDeletePdi = async (vehicle: DealerVehicle) => {
        setActionLoading(vehicle.id + "-pdi-del")
        try {
            const res = await fetch(`/api/admin/dealer-vehicles/${vehicle.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdiStatus: "No",
                    pdiType: null,
                    pdiFiles: null
                }),
            })
            if (res.ok) {
                setPdiModal(null)
                fetchVehicles()
            }
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
                                <th className="px-6 py-4 text-center">PDI</th>
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
                                            {vehicle.pdiStatus === "Yes" ? (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        PDI YES
                                                    </Badge>
                                                    <div className="flex gap-1">
                                                        {(() => {
                                                            try {
                                                                const files = JSON.parse(vehicle.pdiFiles || "[]")
                                                                if (vehicle.pdiType === "PDF") {
                                                                    return (
                                                                        <a href={`/${files[0]}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors" title="View PDF">
                                                                            <FileText className="w-3.5 h-3.5" />
                                                                        </a>
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <button
                                                                            onClick={() => setPdiModal(vehicle)}
                                                                            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors" title={`View ${files.length} Images`}
                                                                        >
                                                                            <ImageIcon className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )
                                                                }
                                                            } catch { return null }
                                                        })()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">No PDI</span>
                                            )}
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
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => setPdiModal(vehicle)} className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setDeleteConfirm(vehicle.id)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
            {/* PDI Management Modal */}
            {pdiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card shadow-2xl border-border/50 flex flex-col">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    PDI Certificate Manager
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{pdiModal.title} · {pdiModal.dealer.dealerBusinessName || pdiModal.dealer.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setPdiModal(null)} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {pdiModal.pdiStatus === "Yes" ? (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-blue-500/5 border border-blue-500/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                {pdiModal.pdiType === "PDF" ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-widest text-[#555]">Certificate Type</p>
                                                <p className="font-black text-blue-500">{pdiModal.pdiType === "PDF" ? "Digital PDF Report" : "Inspection Image Gallery"}</p>
                                            </div>
                                        </div>
                                        {pdiModal.pdiType === "PDF" && (
                                            <a
                                                href={`/${JSON.parse(pdiModal.pdiFiles || "[]")[0]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View Original
                                            </a>
                                        )}
                                    </div>

                                    {pdiModal.pdiType === "IMAGES" && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {JSON.parse(pdiModal.pdiFiles || "[]").map((path: string, i: number) => (
                                                <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                                                    <img src={`/${path}`} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <a href={`/${path}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white text-black hover:scale-110 transition-transform">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {pdiModal.pdiType === "PDF" && (
                                        <div className="aspect-[4/5] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-border bg-muted/50 flex items-center justify-center text-muted-foreground p-12 text-center flex-col gap-4">
                                            <FileText className="w-16 h-16 opacity-20" />
                                            <p className="text-sm font-medium">PDF content displayed in new tab for security.</p>
                                            <a href={`/${JSON.parse(pdiModal.pdiFiles || "[]")[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline">Click here to view PDF</a>
                                        </div>
                                    )}

                                    <div className="pt-8 border-t border-border/50">
                                        <div className="p-6 rounded-[1.5rem] bg-red-500/5 border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div>
                                                <h4 className="text-lg font-bold text-red-500 flex items-center gap-2 italic">
                                                    <AlertCircle className="w-5 h-5" /> Danger Zone
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">Deleting this PDI record will permanently remove it from the public listing. This cannot be undone.</p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                disabled={actionLoading === pdiModal.id + "-pdi-del"}
                                                onClick={() => handleDeletePdi(pdiModal)}
                                                className="px-8 py-6 rounded-2xl font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center gap-2"
                                            >
                                                {actionLoading === pdiModal.id + "-pdi-del" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                Revoke PDI Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground/30">
                                        <ShieldCheck className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight">No Active PDI Record</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">This vehicle has not undergone a Pre-Delivery Inspection or the certificate has been removed.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
