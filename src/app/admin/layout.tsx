import { AdminSidebar } from "@/components/admin/sidebar"
import { getCurrentUser } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Server-side auth check
    const user = await getCurrentUser()

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/unauthorized")
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#08090c' }}>
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                {/* Top Header */}
                <header
                    className="h-16 flex items-center justify-between px-6 lg:px-8"
                    style={{
                        backgroundColor: '#111318',
                        borderBottom: '1px solid rgba(255,255,255,0.07)'
                    }}
                >
                    <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}

                    <div className="flex-1 lg:flex-none">
                        <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        {/* View Website Button */}
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                            style={{ color: '#e8a317', border: '1px solid #e8a317' }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            View Website
                        </Link>

                        {/* Notifications */}
                        <Link
                            href="/admin/notifications"
                            className="p-2 rounded-lg text-gray-400 hover:text-[#e8a317] hover:bg-white/5 transition-all relative group"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111318] group-hover:scale-110 transition-transform"></span>
                        </Link>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs" style={{ color: '#6b7080' }}>{user.role}</p>
                        </div>
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                                background: 'linear-gradient(135deg, #e8a317, #ff6b35)',
                                color: '#000'
                            }}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
