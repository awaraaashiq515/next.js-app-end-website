import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { Bell, ClipboardCheck, Package, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ClientNotificationsPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/login")

    // Fetch user-specific notifications (e.g., their PDI request status, reports ready)
    const pdiRequests = await db.pDIConfirmationRequest.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 10
    })

    const notifications = [
        ...pdiRequests.map(pdi => ({
            id: `pdi-${pdi.id}`,
            type: "PDI",
            title: `PDI Request: ${pdi.status}`,
            message: `Your PDI request for ${pdi.vehicleName} ${pdi.vehicleModel} is currently ${pdi.status.toLowerCase()}.`,
            time: pdi.updatedAt.toLocaleDateString(),
            icon: ClipboardCheck,
            color: pdi.status === "COMPLETED" ? "#4ade80" : "#e8a317",
            bgColor: pdi.status === "COMPLETED" ? "rgba(74, 222, 128, 0.1)" : "rgba(232, 163, 23, 0.1)",
            href: "/client/pdi-confirmation"
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Bell className="w-6 h-6 text-[#e8a317]" />
                    My Notifications
                </h2>
                <p className="text-gray-500 mt-1">Updates about your vehicle inspections and services.</p>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <Link
                            key={notif.id}
                            href={notif.href}
                            className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 hover:bg-white/5 border border-white/5 hover:border-white/10 group"
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
                                    <h3 className="font-semibold text-white group-hover:text-[#e8a317] transition-colors">{notif.title}</h3>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {notif.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{notif.message}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-700 self-center group-hover:text-[#e8a317] group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/10">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-500">No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
