"use client"

import {
    Settings,
    User,
    Lock,
    Bell,
    Shield,
    Loader2
} from "lucide-react"
import { useEffect, useState } from "react"

export default function ClientSettings() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me")
                const data = await res.json()
                if (data.user) {
                    setUser(data.user)
                }
            } catch (error) {
                console.error("Failed to fetch user:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
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
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p style={{ color: '#6b7080' }}>Manage your account preferences and security.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Profile Section */}
                <div
                    className="p-6 rounded-2xl border border-white/5"
                    style={{ backgroundColor: '#111318' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-5 h-5 text-[#e8a317]" />
                        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                readOnly
                                value={user?.name || ""}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                readOnly
                                value={user?.email || ""}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div
                    className="p-6 rounded-2xl border border-white/5"
                    style={{ backgroundColor: '#111318' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-5 h-5 text-[#e8a317]" />
                        <h3 className="text-lg font-semibold text-white">Security</h3>
                    </div>

                    <button className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group text-left">
                        <div>
                            <p className="text-sm font-medium text-white">Change Password</p>
                            <p className="text-xs text-gray-500 mt-1">Update your login password regularly for better security.</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Change
                        </div>
                    </button>
                </div>

                {/* Danger Zone */}
                <div
                    className="p-6 rounded-2xl border border-red-500/10"
                    style={{ backgroundColor: '#111318' }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>

                    <button className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 text-sm font-semibold hover:bg-red-500/5 transition-all">
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    )
}
