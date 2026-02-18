"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ChevronLeft,
    Save,
    Loader2,
    CheckCircle2,
    Package,
    Plus,
    X,
    LayoutDashboard
} from "lucide-react"

export default function CreateDealerPackagePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [features, setFeatures] = useState<string[]>([])
    const [newFeature, setNewFeature] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        type: "VEHICLE",
        description: "",
        price: 0,
        billingCycle: "MONTHLY",
        durationDays: 30,
        maxVehicles: 10,
        maxFeaturedCars: 0,
        canAddVehicles: true,
        canFeatureVehicles: false,
        listingDuration: 30,
        allowPriorityListing: false,
        allowAnalytics: true,
        allowBulkUpload: false,
        status: "ACTIVE",
        isPopular: false
    })

    const handleFeatureAdd = () => {
        if (newFeature.trim()) {
            setFeatures([...features, newFeature.trim()])
            setNewFeature("")
        }
    }

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/dealer-packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    features
                })
            })

            if (res.ok) {
                router.push("/admin/dealer-packages")
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || "Failed to create package")
            }
        } catch (error) {
            console.error("Submission error:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/dealer-packages"
                        className="text-xs font-bold uppercase tracking-widest text-[#666] hover:text-white flex items-center gap-2 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" /> Back to Listing
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">
                        Create <span className="text-gray-400">Subscription Plan</span>
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Plan Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Pro Dealer Bundle"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Package Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="VEHICLE">Vehicle Listings Only</option>
                                <option value="FEATURED">Featured Slots Only</option>
                                <option value="COMBO">Combo (Vehicle + Featured)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what this plan offers..."
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Pricing & Limits */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Pricing & Limits</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Duration (Days)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.durationDays}
                                onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Billing Cycle</label>
                            <select
                                value={formData.billingCycle}
                                onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Max Vehicles</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.maxVehicles}
                                onChange={e => setFormData({ ...formData, maxVehicles: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Max Featured Cars</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.maxFeaturedCars}
                                onChange={e => setFormData({ ...formData, maxFeaturedCars: parseInt(e.target.value) })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">Plan Features</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Add a feature (e.g. 24/7 Priority Support)"
                                value={newFeature}
                                onChange={e => setNewFeature(e.target.value)}
                                onKeyPress={e => e.key === "Enter" && (e.preventDefault(), handleFeatureAdd())}
                                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleFeatureAdd}
                                className="bg-white text-black px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                            >
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-4 group">
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(idx)}
                                        className="text-[#444] hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {features.length === 0 && (
                                <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-2">No features added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Checkboxes Group */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { label: "Highlight as Popular", key: "isPopular" },
                            { label: "Allow Priority Listing", key: "allowPriorityListing" },
                            { label: "Enable Analytics", key: "allowAnalytics" },
                            { label: "Allow Bulk Upload", key: "allowBulkUpload" },
                            { label: "Allow Adding Vehicles", key: "canAddVehicles" },
                            { label: "Allow Featuring Vehicles", key: "canFeatureVehicles" },
                        ].map((item) => (
                            <label key={item.key} className="flex items-center gap-4 group cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
                                    className={`w-10 h-6 rounded-full relative transition-all duration-300 ${formData[item.key as keyof typeof formData] ? "bg-white" : "bg-white/10"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${formData[item.key as keyof typeof formData] ? "bg-black left-5" : "bg-white/40 left-1"}`}></div>
                                </button>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#666] group-hover:text-white transition-colors">
                                    {item.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-white text-black py-5 rounded-[2.5rem] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Create Plan</>}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-10 border border-white/10 rounded-[2.5rem] text-xs font-bold uppercase tracking-widest text-[#666] hover:bg-white/5 hover:text-white transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
