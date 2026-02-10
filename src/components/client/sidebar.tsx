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
    FileText
} from "lucide-react"
import { useState } from "react"

interface MenuItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const menuItems: MenuItem[] = [
    { name: "Overview", href: "/client", icon: LayoutDashboard },
    { name: "My PDI Reports", href: "/client/pdi-reports", icon: ClipboardCheck },
    { name: "My Requests", href: "/client/my-requests", icon: Send },
    { name: "Insurance Claims", href: "/client/insurance-claims", icon: Shield },
    { name: "My Packages", href: "/client/packages", icon: Package },
    { name: "PDI Requests", href: "/client/requests", icon: FileText },
    { name: "Settings", href: "/client/settings", icon: Settings },
]

export function ClientSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/login"
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
                style={{ backgroundColor: '#161921', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                {isOpen ? (
                    <X className="w-6 h-6" style={{ color: '#d8d8d8' }} />
                ) : (
                    <Menu className="w-6 h-6" style={{ color: '#d8d8d8' }} />
                )}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
                style={{
                    backgroundColor: '#111318',
                    borderRight: '1px solid rgba(255,255,255,0.07)'
                }}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <Link href="/client" className="flex items-center gap-3">
                        <Car className="w-8 h-8" style={{ color: '#e8a317' }} />
                        <span className="font-display text-xl tracking-wider text-white">
                            Detailing<span style={{ color: '#e8a317' }}>Garage</span>
                        </span>
                    </Link>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/client" && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive ? 'text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, #e8a317, #d49510)',
                                    boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                                } : undefined}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 hover:bg-red-500/10"
                        style={{ color: '#f87171' }}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
