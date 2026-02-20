"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ClipboardCheck,
    Settings,
    LogOut,
    Menu,
    X,
    Car,
    Package,
    Send,
    Shield,
    FileText,
    ChevronLeft,
    ChevronRight,
    Bell,
    MessageSquare,
    Heart,
} from "lucide-react"
import { useState } from "react"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
    label: string
    items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/client", icon: LayoutDashboard },
            { name: "My Wishlist", href: "/client/wishlist", icon: Heart },
        ]
    },
    {
        label: "Services",
        items: [
            { name: "My PDI Reports", href: "/client/pdi-reports", icon: ClipboardCheck },
            { name: "My Requests", href: "/client/my-requests", icon: Send },
            { name: "Insurance Claims", href: "/client/insurance-claims", icon: Shield },
            { name: "PDI Requests", href: "/client/requests", icon: FileText },
            { name: "My Inquiries", href: "/client/inquiries", icon: MessageSquare },
        ]
    },
    {
        label: "Account",
        items: [
            { name: "My Packages", href: "/client/packages", icon: Package },
            { name: "Notifications", href: "/client/notifications", icon: Bell },
            { name: "Settings", href: "/client/settings", icon: Settings },
        ]
    },
]

export function ClientSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/login"
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const isActive = (href: string) =>
        href === "/client" ? pathname === "/client" : pathname.startsWith(href)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: '#161921', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 inset-y-0 left-0 z-40 h-screen flex flex-col
                    transition-all duration-300 ease-in-out flex-shrink-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
                    w-[260px]
                `}
                style={{
                    backgroundColor: '#0d0f14',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Logo */}
                <div
                    className="h-16 flex items-center justify-between px-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <Link href="/client" className="flex items-center gap-3 min-w-0" onClick={() => setIsOpen(false)}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #e8a317, #ff6b35)' }}>
                            <Car className="w-5 h-5 text-black" />
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-white text-[15px] tracking-wide truncate">
                                Detailing<span style={{ color: '#e8a317' }}>Garage</span>
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-white/10 flex-shrink-0"
                        style={{ color: '#6b7080' }}
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            {!collapsed && (
                                <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2 px-3"
                                    style={{ color: '#3d4150' }}>
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = isActive(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            title={collapsed ? item.name : undefined}
                                            className={`
                                                flex items-center gap-3 rounded-xl transition-all duration-200 relative group
                                                ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
                                                ${active ? 'text-black font-semibold' : 'text-gray-400 hover:text-white'}
                                            `}
                                            style={active ? {
                                                background: 'linear-gradient(135deg, #e8a317, #d49510)',
                                                boxShadow: '0 4px 12px rgba(232, 163, 23, 0.25)'
                                            } : undefined}
                                        >
                                            {!active && (
                                                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
                                            )}
                                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 ${active ? 'text-black' : ''}`} />
                                            {!collapsed && (
                                                <span className="text-[13.5px] relative z-10 truncate">{item.name}</span>
                                            )}
                                            {collapsed && (
                                                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl"
                                                    style={{ backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    {item.name}
                                                </span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Logout" : undefined}
                        className={`
                            flex items-center gap-3 rounded-xl w-full transition-all duration-200 group relative
                            ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
                        `}
                        style={{ color: '#f87171' }}
                    >
                        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: 'rgba(248, 113, 113, 0.08)' }} />
                        <LogOut className="w-[18px] h-[18px] flex-shrink-0 relative z-10" />
                        {!collapsed && <span className="text-[13.5px] relative z-10">Logout</span>}
                        {collapsed && (
                            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl"
                                style={{ backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)' }}>
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    )
}
