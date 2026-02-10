import { db } from "@/lib/db"
import { Bell, ClipboardCheck, UserCheck, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default async function AdminNotificationsPage() {
    // Fetch some data to show as "notifications" (e.g., pending users, new PDI requests)
    const pendingUsers = await db.user.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    const pendingPDIs = await db.pDIConfirmationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true }
    })

    const notifications = [
        ...pendingUsers.map(user => ({
            id: `user-${user.id}`,
            type: "USER",
            title: "New User Registration",
            message: `${user.name} has registered and is awaiting approval.`,
            time: user.createdAt.toLocaleDateString(),
            icon: UserCheck,
            color: "#c084fc",
            bgColor: "rgba(192, 132, 252, 0.1)",
            href: "/admin/users?status=PENDING"
        })),
        ...pendingPDIs.map(pdi => ({
            id: `pdi-${pdi.id}`,
            type: "PDI",
            title: "New PDI Request",
            message: `${pdi.user.name} requested PDI for ${pdi.vehicleName} ${pdi.vehicleModel}.`,
            time: pdi.createdAt.toLocaleDateString(),
            icon: ClipboardCheck,
            color: "#4ade80",
            bgColor: "rgba(74, 222, 128, 0.1)",
            href: "/admin/requests"
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-6 h-6 text-[#e8a317]" />
                        Notifications
                    </h2>
                    <p className="text-gray-500 mt-1">Stay updated with the latest activities on your platform.</p>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Link
                            key={notif.id}
                            href={notif.href}
                            className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 hover:bg-white/5 border border-white/5 hover:border-white/10"
                            style={{ backgroundColor: '#111318' }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: notif.bgColor }}
                            >
                                <notif.icon className="w-6 h-6" style={{ color: notif.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-white">{notif.title}</h3>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {notif.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{notif.message}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/10">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-500">No new notifications at this time.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
