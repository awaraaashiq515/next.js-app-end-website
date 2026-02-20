"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ClipboardCheck,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    Car,
    Package,
    Users,
    FileText,
    ChevronLeft,
    Store,
    CreditCard,
    Bell,
    ChevronRight,
    MessageSquare,
    Trash2,
} from "lucide-react"
import { useState } from "react"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
}

interface MenuGroup {
    label: string
    items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        label: "Management",
        items: [
            { name: "Users", href: "/admin/users", icon: Users },
            { name: "Dealer Vehicles", href: "/admin/dealer-vehicles", icon: Store },
            { name: "Dealer Packages", href: "/admin/dealer-packages", icon: Package },
            { name: "PDI Packages", href: "/admin/packages", icon: FileText },
            { name: "Payments", href: "/admin/payments", icon: CreditCard },
        ]
    },
    {
        label: "Operations",
        items: [
            { name: "PDI Requests", href: "/admin/requests", icon: ClipboardCheck },
            { name: "PDI Inspections", href: "/admin/pdi", icon: Shield },
            { name: "Insurance Requests", href: "/admin/insurance-requests", icon: FileText },
            { name: "Insurance", href: "/admin/insurance", icon: Shield },
            { name: "Vehicle Inquiries", href: "/admin/vehicle-inquiries", icon: Car },
            { name: "Service Inquiries", href: "/admin/service-inquiries", icon: MessageSquare },
            { name: "Scrap Cars", href: "/admin/scrap-cars", icon: Trash2 },

        ]
    },
    {
        label: "System",
        items: [
            { name: "Notifications", href: "/admin/notifications", icon: Bell },
            { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
    },
]

export function AdminSidebar() {
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
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl transition-all"
                style={{ backgroundColor: '#161921', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <Menu className="w-5 h-5 text-white" />
                )}
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
                    <Link href="/admin" className="flex items-center gap-3 min-w-0" onClick={() => setIsOpen(false)}>
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
                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-white/10 flex-shrink-0"
                        style={{ color: '#6b7080' }}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {menuGroups.map((group) => (
                        <div key={group.label}>
                            {/* Group label */}
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
                                                ${active
                                                    ? 'text-black font-semibold'
                                                    : 'text-gray-400 hover:text-white'
                                                }
                                            `}
                                            style={active ? {
                                                background: 'linear-gradient(135deg, #e8a317, #d49510)',
                                                boxShadow: '0 4px 12px rgba(232, 163, 23, 0.25)'
                                            } : undefined}
                                        >
                                            {/* Hover bg for inactive */}
                                            {!active && (
                                                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
                                            )}
                                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 ${active ? 'text-black' : ''}`} />
                                            {!collapsed && (
                                                <span className="text-[13.5px] relative z-10 truncate">{item.name}</span>
                                            )}
                                            {!collapsed && item.badge && item.badge > 0 && (
                                                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full relative z-10"
                                                    style={{ background: active ? 'rgba(0,0,0,0.2)' : '#e8a317', color: active ? '#000' : '#000' }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {/* Tooltip for collapsed */}
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

                {/* Bottom: Logout */}
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
