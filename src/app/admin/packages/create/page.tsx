"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Package,
    Plus,
    X,
    Loader2,
    AlertCircle
} from "lucide-react"

export default function CreatePackagePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        type: "PDI" as "PDI" | "INSURANCE" | "SERVICE",
        description: "",
        price: "",
        pdiCount: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    })
    const [services, setServices] = useState<string[]>([])
    const [newService, setNewService] = useState("")

    const handleAddService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()])
            setNewService("")
        }
    }

    const handleRemoveService = (index: number) => {
        setServices(services.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Auto-add any pending service from the input field
        let finalServices = [...services]
        if (newService.trim() && !services.includes(newService.trim())) {
            finalServices = [...services, newService.trim()]
            setServices(finalServices)
            setNewService("")
        }

        if (finalServices.length === 0) {
            setError("Please add at least one service (type and press Enter or click +)")
            return
        }

        try {
            setLoading(true)

            const res = await fetch("/api/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    pdiCount: parseInt(formData.pdiCount) || 0,
                    services: finalServices,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create package")
            }

            router.push("/admin/packages")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/packages"
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: "#d8d8d8" }} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="w-7 h-7" style={{ color: "#e8a317" }} />
                        Create Package
                    </h1>
                    <p className="text-sm" style={{ color: "#6b7080" }}>
                        Add a new package to offer to clients
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="flex items-center gap-3 p-4 mb-6 rounded-xl"
                    style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}
                >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className="p-6 rounded-xl space-y-5"
                    style={{ backgroundColor: "#111318", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    {/* Package Name */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Package Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Premium PDI Inspection"
                            className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "#161921",
                                border: "1px solid rgba(255,255,255,0.07)",
                                color: "#d8d8d8",
                            }}
                        />
                    </div>

                    {/* Type & Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Package Type *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                                style={{
                                    backgroundColor: "#161921",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }}
                            >
                                <option value="PDI">PDI</option>
                                <option value="INSURANCE">Insurance</option>
                                <option value="SERVICE">Service / Detailing</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                                style={{
                                    backgroundColor: "#161921",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what this package offers..."
                            className="w-full px-4 py-3 rounded-lg outline-none resize-none transition-all focus:ring-2"
                            style={{
                                backgroundColor: "#161921",
                                border: "1px solid rgba(255,255,255,0.07)",
                                color: "#d8d8d8",
                            }}
                        />
                    </div>

                    {/* Price & Duration Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: "#161921",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                PDI Count *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.pdiCount}
                                onChange={(e) => setFormData({ ...formData, pdiCount: e.target.value })}
                                placeholder="Number of PDIs"
                                className="w-full px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: "#161921",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }}
                            />
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Included Services *
                        </label>

                        {/* Add service input */}
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newService}
                                onChange={(e) => setNewService(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAddService()
                                    }
                                }}
                                placeholder="Enter a service and press Enter"
                                className="flex-1 px-4 py-3 rounded-lg outline-none transition-all focus:ring-2"
                                style={{
                                    backgroundColor: "#161921",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#d8d8d8",
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddService}
                                className="px-4 py-3 rounded-lg transition-all hover:opacity-80"
                                style={{
                                    background: "linear-gradient(135deg, #e8a317, #d49510)",
                                    color: "#000",
                                }}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Services list */}
                        {services.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {services.map((service, idx) => (
                                    <span
                                        key={idx}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                        style={{
                                            backgroundColor: "rgba(232, 163, 23, 0.15)",
                                            border: "1px solid rgba(232, 163, 23, 0.3)",
                                            color: "#e8a317",
                                        }}
                                    >
                                        {service}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveService(idx)}
                                            className="hover:opacity-70"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: "#6b7080" }}>
                                No services added yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/packages"
                        className="flex-1 py-3 rounded-xl text-center transition-all hover:bg-white/10"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#d8d8d8",
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #e8a317, #d49510)",
                            color: "#000",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Package className="w-5 h-5" />
                                Create Package
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
