import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import {
    Car,
    MapPin,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    MessageSquare,
    FileText,
    ChevronRight,
    Sparkles,
    ArrowRight,
    Plus
} from "lucide-react"
import Link from "next/link"

async function getClientRequests(userId: string) {
    return await db.pDIConfirmationRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })
}

const statusConfig = {
    COMPLETED: {
        label: "Completed",
        icon: CheckCircle2,
        bgColor: "from-emerald-500/20 to-emerald-500/5",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/30",
        badgeBg: "bg-emerald-500/20",
        glowColor: "shadow-emerald-500/20"
    },
    IN_PROGRESS: {
        label: "In Progress",
        icon: Eye,
        bgColor: "from-blue-500/20 to-blue-500/5",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        badgeBg: "bg-blue-500/20",
        glowColor: "shadow-blue-500/20"
    },
    ISSUES_FOUND: {
        label: "Issues Found",
        icon: AlertCircle,
        bgColor: "from-red-500/20 to-red-500/5",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        badgeBg: "bg-red-500/20",
        glowColor: "shadow-red-500/20"
    },
    PENDING: {
        label: "Pending Review",
        icon: Clock,
        bgColor: "from-amber-500/20 to-amber-500/5",
        textColor: "text-amber-400",
        borderColor: "border-amber-500/30",
        badgeBg: "bg-amber-500/20",
        glowColor: "shadow-amber-500/20"
    }
}

export default async function ClientPDIRequestsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/login")
    }

    const requests = await getClientRequests((user as any).id)

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <div className="relative overflow-hidden mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 pointer-events-none" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        My PDI Requests
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Track and manage your vehicle inspection requests
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{requests.length}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {requests.filter(r => r.status === 'COMPLETED').length}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Completed</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-400">
                                        {requests.filter(r => r.status === 'PENDING').length}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</p>
                                </div>
                            </div>

                            <Link
                                href="/client/pdi-confirmation"
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                New Request
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {requests.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl scale-150" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                            <Car className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Requests Yet</h3>
                    <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                        You haven't submitted any PDI inspection requests yet.
                        Start by requesting an inspection for your vehicle.
                    </p>
                    <Link
                        href="/client/pdi-confirmation"
                        className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                    >
                        <Sparkles className="w-5 h-5" />
                        Request Your First PDI
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            ) : (
                /* Requests Grid */
                <div className="space-y-5">
                    {requests.map((request, index) => {
                        const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.PENDING
                        const StatusIcon = status.icon

                        return (
                            <div
                                key={request.id}
                                className={`
                                    group relative overflow-hidden rounded-2xl 
                                    bg-gradient-to-r ${status.bgColor}
                                    border ${status.borderColor}
                                    hover:border-white/20 
                                    transition-all duration-500
                                    hover:shadow-xl ${status.glowColor}
                                    hover:scale-[1.01]
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-[#111318] via-[#111318]/95 to-transparent pointer-events-none" />

                                <div className="relative p-6 lg:p-8">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                                        {/* Vehicle Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start gap-4">
                                                {/* Vehicle Icon */}
                                                <div className={`
                                                    w-14 h-14 rounded-2xl ${status.badgeBg} 
                                                    flex items-center justify-center
                                                    group-hover:scale-110 transition-transform duration-500
                                                `}>
                                                    <Car className={`w-7 h-7 ${status.textColor}`} />
                                                </div>

                                                <div className="flex-1">
                                                    {/* Status Badge */}
                                                    <div className={`
                                                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                                                        ${status.badgeBg} ${status.textColor}
                                                        text-xs font-bold uppercase tracking-wider
                                                        mb-2
                                                    `}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {status.label}
                                                    </div>

                                                    {/* Vehicle Name */}
                                                    <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                                                        {request.vehicleName}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {request.vehicleModel}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="flex flex-wrap gap-6 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-300">{request.location}</span>
                                                </div>
                                                {request.preferredDate && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-300">
                                                            {formatDate(request.preferredDate)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-400">
                                                        Submitted {formatDate(request.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
                                            {/* View Button */}
                                            {request.pdiInspectionId && (
                                                <Link
                                                    href={`/client/pdi/${request.pdiInspectionId}`}
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all group/btn"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Report
                                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            )}

                                            {/* Request ID */}
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Request ID</p>
                                                <p className="text-xs text-gray-400 font-mono">
                                                    #{request.id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Message */}
                                    {request.adminMessage && (
                                        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                                                        Message from Inspector
                                                    </p>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        {request.adminMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Footer Help */}
            <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                <p className="text-gray-400 text-sm">
                    Need help with your request?
                    <a href="mailto:support@example.com" className="text-amber-400 hover:text-amber-300 ml-1 font-medium">
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    )
}
