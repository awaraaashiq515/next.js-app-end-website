import { db } from "@/lib/db"
import {
    ClipboardCheck,
    Shield,
    Users,
    Car,
    TrendingUp,
    UserCheck,
    Settings,
    Mail
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
    // Fetch real user stats
    const totalUsers = await db.user.count()
    const pendingUsers = await db.user.count({ where: { status: "PENDING" } })
    const approvedUsers = await db.user.count({ where: { status: "APPROVED" } })

    const stats = [
        { label: "Total PDI Inspections", value: "1,234", icon: ClipboardCheck, color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.1)", href: "/admin/pdi" },
        { label: "Active Insurance Claims", value: "56", icon: Shield, color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.1)", href: "/admin/insurance" },
        { label: "Registered Users", value: totalUsers.toString(), icon: Users, color: "#c084fc", bgColor: "rgba(192, 132, 252, 0.1)", href: "/admin/users" },
        { label: "Pending Approvals", value: pendingUsers.toString(), icon: UserCheck, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.1)", href: "/admin/users?status=PENDING" },
    ]

    const recentActivities = [
        { type: "PDI", message: "New PDI inspection completed for Toyota Camry", time: "2 mins ago" },
        { type: "User", message: `${pendingUsers} users awaiting approval`, time: "Just now" },
        { type: "Insurance", message: "Insurance claim #1234 approved", time: "15 mins ago" },
        { type: "User", message: "New dealer registered: ABC Motors", time: "1 hour ago" },
        { type: "PDI", message: "PDI report generated for Honda Civic", time: "2 hours ago" },
    ]

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin!</h2>
                <p style={{ color: '#6b7080' }}>Here's what's happening with your business today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.href}
                        className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] block"
                        style={{
                            backgroundColor: '#111318',
                            border: '1px solid rgba(255,255,255,0.07)'
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: stat.bgColor }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: '#4ade80' }} />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-sm" style={{ color: '#6b7080' }}>{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.07)'
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <button className="text-sm hover:text-white transition-colors" style={{ color: '#e8a317' }}>
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-white/5"
                                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor: activity.type === "PDI"
                                            ? 'rgba(74, 222, 128, 0.1)'
                                            : activity.type === "Insurance"
                                                ? 'rgba(96, 165, 250, 0.1)'
                                                : 'rgba(192, 132, 252, 0.1)'
                                    }}
                                >
                                    {activity.type === "PDI" && <ClipboardCheck className="w-5 h-5" style={{ color: '#4ade80' }} />}
                                    {activity.type === "Insurance" && <Shield className="w-5 h-5" style={{ color: '#60a5fa' }} />}
                                    {activity.type === "User" && <Users className="w-5 h-5" style={{ color: '#c084fc' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{activity.message}</p>
                                    <p className="text-xs mt-1" style={{ color: '#6b7080' }}>{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        backgroundColor: '#111318',
                        border: '1px solid rgba(255,255,255,0.07)'
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/admin/users"
                            className="p-5 rounded-xl text-left transition-all duration-200 hover:translate-y-[-2px] block"
                            style={{
                                backgroundColor: 'rgba(192, 132, 252, 0.1)',
                                border: '1px solid rgba(192, 132, 252, 0.2)'
                            }}
                        >
                            <UserCheck className="w-8 h-8 mb-3" style={{ color: '#c084fc' }} />
                            <p className="font-semibold text-white">Approve Users</p>
                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>{pendingUsers} pending</p>
                        </Link>
                        <Link
                            href="/admin/settings"
                            className="p-5 rounded-xl text-left transition-all duration-200 hover:translate-y-[-2px] block"
                            style={{
                                backgroundColor: 'rgba(232, 163, 23, 0.1)',
                                border: '1px solid rgba(232, 163, 23, 0.2)'
                            }}
                        >
                            <Settings className="w-8 h-8 mb-3" style={{ color: '#e8a317' }} />
                            <p className="font-semibold text-white">Settings</p>
                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>Configure system</p>
                        </Link>
                        <Link
                            href="/admin/pdi"
                            className="p-5 rounded-xl text-left transition-all duration-200 hover:translate-y-[-2px] block"
                            style={{
                                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                border: '1px solid rgba(74, 222, 128, 0.2)'
                            }}
                        >
                            <ClipboardCheck className="w-8 h-8 mb-3" style={{ color: '#4ade80' }} />
                            <p className="font-semibold text-white">PDI Requests</p>
                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>View inspections</p>
                        </Link>
                        <Link
                            href="/admin/packages"
                            className="p-5 rounded-xl text-left transition-all duration-200 hover:translate-y-[-2px] block"
                            style={{
                                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                                border: '1px solid rgba(96, 165, 250, 0.2)'
                            }}
                        >
                            <Car className="w-8 h-8 mb-3" style={{ color: '#60a5fa' }} />
                            <p className="font-semibold text-white">Packages</p>
                            <p className="text-xs mt-1" style={{ color: '#6b7080' }}>Manage packages</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
