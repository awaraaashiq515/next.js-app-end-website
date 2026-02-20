"use client"

import { useState } from "react"
import {
    Search,
    Car,
    Fuel,
    Calendar,
    MapPin,
    User,
    FileText,
    Shield,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Hash,
    Gauge,
    Truck,
    ClipboardList,
    RefreshCw,
    Trash2,
} from "lucide-react"

interface VehicleData {
    reg_no?: string
    reg_date?: string
    owner_name?: string
    owner_father_name?: string
    current_full_address?: string
    permanent_full_address?: string
    vehicle_class_desc?: string
    chassis_no?: string
    engine_no?: string
    vehicle_manufacturer_name?: string
    model?: string
    body_type?: string
    fuel_descr?: string
    color?: string
    norms_descr?: string
    fit_upto?: string
    reg_upto?: string
    tax_upto?: string
    cubic_cap?: number
    vehicle_gross_weight?: number
    unladen_weight?: number
    cylinders_no?: number
    vehicle_seat_capacity?: number
    wheelbase?: number
    manufacturing_mon?: number
    manufacturing_yr?: number
    status?: string
    blacklist_status?: string
    vehicle_type?: string
    owner_count?: number
    office_name?: string
    state?: string
    vehicle_insurance_details?: {
        insurance_company_name?: string
        policy_no?: string
        insurance_upto?: string
    }
    vehicle_pucc_details?: {
        pucc_no?: string
        pucc_upto?: string
    }
    financer_details?: {
        financer_name?: string
    }
    [key: string]: any
}

interface SearchHistoryItem {
    reg_no: string
    owner_name: string
    maker: string
    model: string
    timestamp: string
}

export default function ScrapCarsPage() {
    const [regNo, setRegNo] = useState("")
    const [loading, setLoading] = useState(false)
    const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [history, setHistory] = useState<SearchHistoryItem[]>([])

    const handleSearch = async () => {
        if (!regNo.trim()) {
            setError("Please enter a registration number")
            return
        }

        setLoading(true)
        setError(null)
        setVehicleData(null)

        try {
            const res = await fetch("/api/admin/vehicle-lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reg_no: regNo.trim() }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.error || "Failed to fetch vehicle details")
                return
            }

            setVehicleData(data.data)

            // Add to history
            setHistory((prev) => {
                const newItem: SearchHistoryItem = {
                    reg_no: data.data.reg_no || regNo.trim(),
                    owner_name: data.data.owner_name || "N/A",
                    maker: data.data.vehicle_manufacturer_name || "N/A",
                    model: data.data.model || "N/A",
                    timestamp: new Date().toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }
                return [newItem, ...prev.filter((h) => h.reg_no !== newItem.reg_no)].slice(0, 10)
            })
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch()
    }

    const clearResults = () => {
        setVehicleData(null)
        setError(null)
        setRegNo("")
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #e8a317, #ff6b35)" }}
                        >
                            <Trash2 className="w-5 h-5 text-black" />
                        </div>
                        Scrap Cars
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#6b7080" }}>
                        Look up vehicle RC details using registration number
                    </p>
                </div>
                {vehicleData && (
                    <button
                        onClick={clearResults}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                        style={{ color: "#e8a317", border: "1px solid rgba(232,163,23,0.3)" }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        New Search
                    </button>
                )}
            </div>

            {/* Search Section */}
            <div
                className="rounded-2xl p-6 lg:p-8"
                style={{
                    backgroundColor: "#0d0f14",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#6b7080" }}>
                            <Hash className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter Registration No.  e.g. HP78 B 7878"
                            className="w-full h-14 pl-12 pr-4 rounded-xl text-white text-base font-medium placeholder:text-gray-600 transition-all focus:outline-none"
                            style={{
                                backgroundColor: "#111318",
                                border: "1px solid rgba(255,255,255,0.08)",
                                caretColor: "#e8a317",
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !regNo.trim()}
                        className="h-14 px-8 rounded-xl font-bold text-black text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                        style={{
                            background: loading
                                ? "rgba(232,163,23,0.6)"
                                : "linear-gradient(135deg, #e8a317, #ff6b35)",
                            boxShadow: loading
                                ? "none"
                                : "0 4px 20px rgba(232,163,23,0.3)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search Vehicle
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div
                    className="rounded-2xl p-5 flex items-start gap-3"
                    style={{
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-400 font-semibold text-sm">Lookup Failed</p>
                        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Vehicle Details */}
            {vehicleData && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Status Bar */}
                    <div
                        className="rounded-2xl p-5 flex items-center gap-3"
                        style={{
                            backgroundColor: "rgba(34, 197, 94, 0.08)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-green-400 font-semibold text-sm">Vehicle Found</p>
                            <p className="text-green-400/70 text-sm">
                                Registration: <span className="font-bold text-green-300">{vehicleData.reg_no}</span>
                            </p>
                        </div>
                        <div
                            className="px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{
                                backgroundColor: vehicleData.status === "ACTIVE" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                color: vehicleData.status === "ACTIVE" ? "#22c55e" : "#ef4444",
                                border: `1px solid ${vehicleData.status === "ACTIVE" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                            }}
                        >
                            {vehicleData.status || "N/A"}
                        </div>
                    </div>

                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Owner & Registration */}
                        <DetailCard title="Owner & Registration" icon={User}>
                            <DetailRow label="Registration No." value={vehicleData.reg_no} highlight />
                            <DetailRow label="Owner Name" value={vehicleData.owner_name} />
                            <DetailRow label="Father's Name" value={vehicleData.owner_father_name} />
                            <DetailRow label="Registration Date" value={vehicleData.reg_date} />
                            <DetailRow label="Registered At (RTO)" value={`${vehicleData.office_name}, ${vehicleData.state}`} />
                            <DetailRow label="Owner Count" value={vehicleData.owner_count?.toString()} />
                        </DetailCard>

                        {/* Vehicle Information */}
                        <DetailCard title="Vehicle Information" icon={Car}>
                            <DetailRow label="Manufacturer" value={vehicleData.vehicle_manufacturer_name} highlight />
                            <DetailRow label="Model" value={vehicleData.model} highlight />
                            <DetailRow label="Class" value={vehicleData.vehicle_class_desc} />
                            <DetailRow label="Body Type" value={vehicleData.body_type} />
                            <DetailRow label="Color" value={vehicleData.color} />
                            <DetailRow label="Norms" value={vehicleData.norms_descr} />
                        </DetailCard>

                        {/* Engine & Specs */}
                        <DetailCard title="Engine & Specifications" icon={Gauge}>
                            <DetailRow label="Fuel Type" value={vehicleData.fuel_descr} highlight />
                            <DetailRow label="Engine No." value={vehicleData.engine_no} />
                            <DetailRow label="Chassis No." value={vehicleData.chassis_no} />
                            <DetailRow label="Cubic Capacity" value={vehicleData.cubic_cap ? `${vehicleData.cubic_cap} cc` : undefined} />
                            <DetailRow label="Cylinders" value={vehicleData.cylinders_no?.toString()} />
                            <DetailRow label="Seating" value={vehicleData.vehicle_seat_capacity?.toString()} />
                            <DetailRow label="Gross Weight" value={vehicleData.vehicle_gross_weight ? `${vehicleData.vehicle_gross_weight} kg` : undefined} />
                            <DetailRow label="Unladen Weight" value={vehicleData.unladen_weight ? `${vehicleData.unladen_weight} kg` : undefined} />
                        </DetailCard>

                        {/* Insurance & Fitness */}
                        <DetailCard title="Compliance & Validity" icon={Shield}>
                            <DetailRow label="Insurance Company" value={vehicleData.vehicle_insurance_details?.insurance_company_name} highlight />
                            <DetailRow label="Policy No." value={vehicleData.vehicle_insurance_details?.policy_no} />
                            <DetailRow label="Insurance Expiry" value={vehicleData.vehicle_insurance_details?.insurance_upto} />
                            <DetailRow label="Fitness Valid Up To" value={vehicleData.fit_upto} />
                            <DetailRow label="Reg Valid Up To" value={vehicleData.reg_upto} />
                            <DetailRow label="PUCC No." value={vehicleData.vehicle_pucc_details?.pucc_no} />
                            <DetailRow label="PUCC Expiry" value={vehicleData.vehicle_pucc_details?.pucc_upto} />
                            <DetailRow label="Tax Valid Up To" value={vehicleData.tax_upto} />
                        </DetailCard>

                        {/* Finance & Status */}
                        <DetailCard title="History & Finance" icon={FileText}>
                            <DetailRow label="Financer" value={vehicleData.financer_details?.financer_name} highlight />
                            <DetailRow label="Blacklist Status" value={vehicleData.blacklist_status === "N" ? "No" : "Yes"} />
                            <DetailRow label="Vehicle Type" value={vehicleData.vehicle_type} />
                        </DetailCard>

                        {/* Address */}
                        <DetailCard title="Address Details" icon={MapPin}>
                            <DetailRow label="Permanent Address" value={vehicleData.permanent_full_address} />
                            <DetailRow label="Current Address" value={vehicleData.current_full_address} />
                        </DetailCard>
                    </div>

                    {/* Manufacturing Details */}
                    <div
                        className="rounded-2xl p-5"
                        style={{
                            backgroundColor: "#0d0f14",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4" style={{ color: "#e8a317" }} />
                            <h3 className="text-sm font-bold text-white">Manufacturing Detail</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <MiniStat label="Mfg Month" value={vehicleData.manufacturing_mon?.toString()} />
                            <MiniStat label="Mfg Year" value={vehicleData.manufacturing_yr?.toString()} />
                            <MiniStat label="Wheelbase" value={vehicleData.wheelbase ? `${vehicleData.wheelbase} mm` : undefined} />
                            <MiniStat label="Category" value={vehicleData.vehicle_catg} />
                        </div>
                    </div>
                </div>
            )}

            {/* Search History */}
            {history.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: "#0d0f14",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" style={{ color: "#e8a317" }} />
                            <h3 className="text-sm font-bold text-white">Recent Lookups</h3>
                        </div>
                        <button
                            onClick={() => setHistory([])}
                            className="text-xs font-medium transition-all hover:text-red-400"
                            style={{ color: "#6b7080" }}
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider px-5 py-3" style={{ color: "#3d4150" }}>Reg. No.</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider px-5 py-3" style={{ color: "#3d4150" }}>Owner</th>
                                    <th className="text-left text-[11px] font-bold uppercase tracking-wider px-5 py-3" style={{ color: "#3d4150" }}>Brand</th>
                                    <th className="text-right text-[11px] font-bold uppercase tracking-wider px-5 py-3" style={{ color: "#3d4150" }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, i) => (
                                    <tr
                                        key={item.reg_no + i}
                                        className="transition-all hover:bg-white/[0.02] cursor-pointer"
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onClick={() => {
                                            setRegNo(item.reg_no)
                                            handleSearch()
                                        }}
                                    >
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-bold" style={{ color: "#e8a317" }}>{item.reg_no}</span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-white">{item.owner_name}</td>
                                        <td className="px-5 py-3 text-sm text-gray-400">{item.maker}</td>
                                        <td className="px-5 py-3 text-sm text-right" style={{ color: "#6b7080" }}>{item.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailCard({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#0d0f14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4" style={{ color: "#e8a317" }} />
                <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <div className="space-y-2.5">{children}</div>
        </div>
    )
}

function DetailRow({ label, value, highlight }: { label: string, value?: string, highlight?: boolean }) {
    if (!value || value === "NA" || value === "null") return null
    return (
        <div className="flex items-start justify-between gap-4 py-1">
            <span className="text-xs flex-shrink-0" style={{ color: "#6b7080" }}>{label}</span>
            <span className={`text-xs text-right font-medium ${highlight ? "font-bold text-[#e8a317]" : "text-white"}`}>{value}</span>
        </div>
    )
}

function MiniStat({ label, value }: { label: string, value?: string }) {
    return (
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#3d4150" }}>{label}</p>
            <p className="text-xs font-semibold text-white truncate">{value || "—"}</p>
        </div>
    )
}
