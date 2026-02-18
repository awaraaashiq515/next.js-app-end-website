"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getPublicHeaderSettings, type HeaderSettingsData, type NavigationLink } from "@/app/actions/header-settings"

export function Navbar() {
    const [user, setUser] = useState<{ role: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const pathname = usePathname()
    const isHome = pathname === "/"

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener("scroll", handleScroll)

        // Fetch user session
        fetch("/api/auth/me")
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.user) setUser(data.user)
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false))

        // Fetch header settings
        getPublicHeaderSettings().then(setSettings)

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Helper to determine link href based on current page
    const getLink = (hash: string, href: string) => {
        // If it's a hash link and we're on home page, just use hash
        if (href.startsWith("#")) {
            return isHome ? href : `/${href}`
        }
        // Otherwise use the href as-is
        return href
    }

    // Default values if settings not loaded
    const brandName = settings?.brandName ?? "Detailing"
    const brandNameAccent = settings?.brandNameAccent ?? "Garage"
    const primaryColor = settings?.primaryColor ?? "#e8a317"
    const textColor = settings?.textColor ?? "#6b7080"
    const navLinks = settings?.navigationLinks ?? [
        { label: "Services", href: "#services", isExternal: false },
        { label: "PDI", href: "/pdi", isExternal: false },
        { label: "Insurance", href: "/insurance-claim", isExternal: false },
        { label: "How It Works", href: "#how-it-works", isExternal: false },
        { label: "About", href: "#about", isExternal: false },
        { label: "Contact", href: "#contact", isExternal: false },
    ]
    const loginText = settings?.loginButtonText ?? "Log In"
    const ctaText = settings?.ctaButtonText ?? "Get Started"
    const ctaLink = settings?.ctaButtonLink ?? "/register"
    const dashboardText = settings?.dashboardButtonText ?? "Dashboard"
    const useLogo = settings?.useLogo ?? false
    const logoUrl = settings?.logoImageUrl

    return (
        <nav className={`fixed top-0 w-full z-50 px-6 md:px-14 py-5 flex items-center justify-between transition-all duration-400 ${scrolled || !isHome ? 'nav-scrolled' : ''}`} style={!isHome ? { backgroundColor: '#111318' } : {}}>
            {/* Brand */}
            <Link href="/" className="font-display text-[22px] tracking-[3px] text-white">
                {useLogo && logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logoUrl}
                        alt={brandName + brandNameAccent}
                        className="h-10 w-auto object-contain"
                    />
                ) : (
                    <>
                        {brandName}<span style={{ color: primaryColor }}>{brandNameAccent}</span>
                    </>
                )}
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-8">
                {navLinks.map((link, index) => {
                    const href = getLink(link.href, link.href)
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={index}
                            href={href}
                            target={link.isExternal ? "_blank" : undefined}
                            rel={link.isExternal ? "noopener noreferrer" : undefined}
                            className={`text-sm font-medium hover:text-[${primaryColor}] transition-colors h-full flex items-center`}
                            style={{ color: isActive ? primaryColor : textColor }}
                        >
                            {link.label}
                        </Link>
                    )
                })}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-5">
                {!loading && (
                    user ? (
                        <Link
                            href={
                                user.role === 'ADMIN' ? '/admin' :
                                    user.role === 'DEALER' ? '/dealer' :
                                        user.role === 'AGENT' ? '/agent' :
                                            '/client'
                            }
                            className="text-black px-5 py-2 rounded-lg text-[13px] font-bold tracking-wide hover:translate-y-[-1px] hover:shadow-[0_6px_22px_rgba(232,163,23,0.4)] transition-all flex items-center gap-2"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="9" x="3" y="3" rx="1" />
                                <rect width="7" height="5" x="14" y="3" rx="1" />
                                <rect width="7" height="9" x="14" y="12" rx="1" />
                                <rect width="7" height="5" x="3" y="16" rx="1" />
                            </svg>
                            {dashboardText}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors" style={{ color: textColor }}>{loginText}</Link>
                            <Link
                                href={ctaLink}
                                className="text-black px-5 py-2 rounded-lg text-[13px] font-bold tracking-wide hover:translate-y-[-1px] hover:shadow-[0_6px_22px_rgba(232,163,23,0.4)] transition-all"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {ctaText}
                            </Link>
                        </>
                    )
                )}
            </div>
        </nav>
    )
}
