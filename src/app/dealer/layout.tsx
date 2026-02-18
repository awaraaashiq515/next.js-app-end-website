import { DealerSidebar } from "@/components/dealer/sidebar"
import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, ExternalLink } from "lucide-react"
import { LogoutButton } from "@/components/dashboard/logout-button"

export default async function DealerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    if (!user) redirect("/login")
    if (user.role !== "DEALER" && user.role !== "ADMIN") redirect("/unauthorized")

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#08090c' }}>
            {/* Sidebar */}
            <DealerSidebar />

            {/* Main column */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

                {/* ── Top Navigation Bar ── */}
                <header
                    className="h-16 flex items-center justify-between px-5 lg:px-7 flex-shrink-0 sticky top-0 z-30"
                    style={{
                        backgroundColor: 'rgba(13,15,20,0.85)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Left: mobile spacer + breadcrumb */}
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden w-10" />
                        <div className="hidden lg:flex items-center gap-2 text-sm" style={{ color: '#6b7080' }}>
                            <span className="font-medium" style={{ color: '#ffffff' }}>Dealer</span>
                            <span>/</span>
                            <span className="text-white font-medium">Portal</span>
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2">
                        {/* View Website */}
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/8"
                            style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View Site
                        </Link>

                        {/* Notifications */}
                        <Link
                            href="/dealer/notifications"
                            className="relative p-2 rounded-xl transition-all hover:bg-white/6"
                            style={{ color: '#6b7080' }}
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                                style={{ backgroundColor: '#ffffff', borderColor: '#0d0f14' }} />
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

                        {/* User pill */}
                        <div className="flex items-center gap-2.5 pl-1">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #ffffff, #a0a0a0)',
                                    color: '#000'
                                }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[13px] font-semibold text-white leading-tight">{user.name}</p>
                                <p className="text-[11px] leading-tight" style={{ color: '#6b7080' }}>Dealer</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

                        {/* Logout */}
                        <LogoutButton />
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 overflow-y-auto p-5 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
