"use client"

import { useState, useEffect } from "react"
import { Car, MapPin, Loader2, Trash2, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"

export default function DealerWishlistPage() {
    const [wishlist, setWishlist] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchWishlist = async () => {
        try {
            const res = await fetch("/api/wishlist")
            const data = await res.json()
            setWishlist(data.wishlist || [])
        } catch (error) {
            console.error("Error fetching wishlist:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const handleRemove = async (vehicleId: string) => {
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleId })
            })
            setWishlist(prev => prev.filter(item => item.vehicleId !== vehicleId))
        } catch (error) {
            console.error("Error removing from wishlist:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Saved Inventory</h1>
                    <p className="text-sm text-gray-400">Quick access to cars you've bookmarked for reference.</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#ffffff]">
                    {wishlist.length} Items Saved
                </div>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => {
                        const vehicle = item.vehicle
                        const images = JSON.parse(vehicle.images || '[]')
                        const thumb = images[0]

                        return (
                            <div key={item.id} className="group bg-[#0d0f14] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/30">
                                <div className="h-48 relative overflow-hidden bg-black">
                                    {thumb ? (
                                        <img src={thumb} alt={vehicle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10">
                                            <Car className="w-12 h-12" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRemove(vehicle.id)}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 backdrop-blur-md text-red-400 hover:text-red-500 transition-colors border border-white/10"
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-white/80 transition-colors">
                                            {vehicle.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {vehicle.city}, {vehicle.state}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-white font-bold">
                                            ₹{vehicle.price.toLocaleString('en-IN')}
                                        </div>
                                        <Link
                                            href={`/cars/${vehicle.id}`}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                        >
                                            View Listing
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/5 border border-dashed border-white/5 rounded-[2rem]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No saved vehicles</h3>
                    <p className="text-gray-400 text-sm mb-8">Click the heart icon on any vehicle to save it here.</p>
                    <Link
                        href="/cars"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                    >
                        Browse Listings
                    </Link> {/* Fixed closing tag */}
                </div>
            )}
        </div>
    )
}
