"use client"

import {
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface UserPackage {
    id: string
    purchasedAt: string
    pdiRemaining: number
    pdiUsed: number
    status: string
    package: {
        name: string
        type: string
        description: string
        price: number
    }
}

export default function MyPackages() {
    const [packages, setPackages] = useState<UserPackage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPackages() {
            try {
                const res = await fetch("/api/client/packages")
                const data = await res.json()
                if (data.userPackages) {
                    setPackages(data.userPackages)
                }
            } catch (error) {
                console.error("Failed to fetch packages:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPackages()
    }, [])

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#e8a317]" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Packages</h2>
                <p style={{ color: '#6b7080' }}>View and manage your active service packages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.length === 0 ? (
                    <div className="col-span-full p-12 text-center rounded-2xl bg-white/5 border border-dashed border-white/10">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-white mb-2">No active packages</h3>
                        <p className="text-gray-500 mb-6">You haven't purchased any service packages yet.</p>
                        <a href="/packages" className="px-6 py-2 rounded-lg bg-[#e8a317] text-black font-bold text-sm">
                            Browse Packages
                        </a>
                    </div>
                ) : (
                    packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="p-6 rounded-2xl transition-all duration-300 border border-white/5 relative overflow-hidden group"
                            style={{ backgroundColor: '#111318' }}
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <Badge
                                    className={`${pkg.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}
                                >
                                    {pkg.status}
                                </Badge>
                            </div>

                            <div className="flex items-start gap-5 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#e8a317]/10 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-7 h-7 text-[#e8a317]" />
                                </div>
                                <div className="pr-12">
                                    <h3 className="text-xl font-bold text-white mb-1">{pkg.package.name}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#6b7080' }}>{pkg.package.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-white/5">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wider text-gray-500">Remaining PDIs</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-white">{pkg.pdiRemaining}</span>
                                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#e8a317]"
                                                style={{ width: `${(pkg.pdiRemaining / (pkg.pdiRemaining + pkg.pdiUsed)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wider text-gray-500">Purchased On</p>
                                    <p className="text-lg font-medium text-white">
                                        {new Date(pkg.purchasedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
