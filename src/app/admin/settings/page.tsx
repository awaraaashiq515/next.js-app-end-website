"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    getAdminHeaderSettings,
    updateHeaderSettings,
    resetHeaderSettings,
    type HeaderSettingsData,
    type NavigationLink,
} from "@/app/actions/header-settings"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-muted-foreground">Manage system configuration</p>
            </div>

            <Tabs defaultValue="header" className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-2 p-2 bg-[#0d0f14] border border-white/5 rounded-xl mb-6">
                    <TabsTrigger
                        value="header"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        Header
                    </TabsTrigger>
                    <TabsTrigger
                        value="system"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        System
                    </TabsTrigger>
                    <TabsTrigger
                        value="roles"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        Roles
                    </TabsTrigger>
                    <TabsTrigger
                        value="smtp"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        SMTP
                    </TabsTrigger>
                    <TabsTrigger
                        value="otp"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        OTP
                    </TabsTrigger>
                    <TabsTrigger
                        value="purposes"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        Login Purposes
                    </TabsTrigger>
                    <TabsTrigger
                        value="ai"
                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#e8a317] data-[state=active]:text-black text-gray-400 transition-all"
                    >
                        AI Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="header">
                    <HeaderSettings />
                </TabsContent>

                <TabsContent value="system">
                    <SystemSettings />
                </TabsContent>

                <TabsContent value="roles">
                    <RoleSettings />
                </TabsContent>

                <TabsContent value="smtp">
                    <SMTPSettings />
                </TabsContent>

                <TabsContent value="otp">
                    <OTPSettings />
                </TabsContent>

                <TabsContent value="purposes">
                    <LoginPurposes />
                </TabsContent>

                <TabsContent value="ai">
                    <AISettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Header Settings Component
function HeaderSettings() {
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        setIsLoading(true)
        const result = await getAdminHeaderSettings()
        if (result.success && result.data) {
            setSettings(result.data)
        }
        setIsLoading(false)
    }

    async function handleSave() {
        if (!settings) return
        setIsSaving(true)
        const result = await updateHeaderSettings(settings)
        if (result.success && result.data) {
            setSettings(result.data)
            alert("Header settings saved successfully!")
        } else {
            alert(result.error || "Failed to save settings")
        }
        setIsSaving(false)
    }

    async function handleReset() {
        if (!confirm("Reset all header settings to defaults?")) return
        setIsSaving(true)
        const result = await resetHeaderSettings()
        if (result.success && result.data) {
            setSettings(result.data)
            alert("Header settings reset to defaults!")
        }
        setIsSaving(false)
    }

    function updateNavLink(index: number, field: keyof NavigationLink, value: string | boolean) {
        if (!settings) return
        const updatedLinks = [...settings.navigationLinks]
        updatedLinks[index] = { ...updatedLinks[index], [field]: value }
        setSettings({ ...settings, navigationLinks: updatedLinks })
    }

    function addNavLink() {
        if (!settings) return
        setSettings({
            ...settings,
            navigationLinks: [...settings.navigationLinks, { label: "New Link", href: "/", isExternal: false }],
        })
    }

    function removeNavLink(index: number) {
        if (!settings) return
        setSettings({ ...settings, navigationLinks: settings.navigationLinks.filter((_, i) => i !== index) })
    }

    function moveNavLink(index: number, direction: "up" | "down") {
        if (!settings) return
        const newLinks = [...settings.navigationLinks]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newLinks.length) return
        [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]]
        setSettings({ ...settings, navigationLinks: newLinks })
    }

    if (isLoading) {
        return <div className="text-center py-10 text-muted-foreground">Loading header settings...</div>
    }

    if (!settings) {
        return <div className="text-center py-10 text-red-500">Failed to load settings</div>
    }

    return (
        <div className="space-y-6 mt-4">
            {/* Preview */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg p-4 flex items-center justify-between" style={{ backgroundColor: '#08090c', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {settings.useLogo && settings.logoImageUrl ? (
                            <img src={settings.logoImageUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                            <div className="text-[22px] tracking-[3px] text-white font-display">
                                {settings.brandName}<span style={{ color: settings.primaryColor }}>{settings.brandNameAccent}</span>
                            </div>
                        )}
                        <div className="flex gap-6">
                            {settings.navigationLinks.slice(0, 4).map((link, i) => (
                                <span key={i} className="text-sm font-medium" style={{ color: settings.textColor }}>{link.label}</span>
                            ))}
                        </div>
                        <div className="px-5 py-2 rounded-lg text-sm font-bold text-black" style={{ backgroundColor: settings.primaryColor }}>
                            {settings.ctaButtonText}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branding */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-white">Use Logo Image</h3>
                            <p className="text-sm text-muted-foreground">Toggle between text or logo image</p>
                        </div>
                        <Button variant={settings.useLogo ? "default" : "outline"} onClick={() => setSettings({ ...settings, useLogo: !settings.useLogo })}>
                            {settings.useLogo ? "Using Logo" : "Using Text"}
                        </Button>
                    </div>
                    {!settings.useLogo ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white">Brand Name</Label>
                                <Input value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Accent Text</Label>
                                <Input value={settings.brandNameAccent} onChange={(e) => setSettings({ ...settings, brandNameAccent: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-white">Logo Image URL</Label>
                            <Input value={settings.logoImageUrl || ""} onChange={(e) => setSettings({ ...settings, logoImageUrl: e.target.value })} placeholder="/branding/logo.png" className="bg-[#08090c] border-white/10 text-white" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Colors */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Colors</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Primary Color</Label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                                <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="bg-[#08090c] border-white/10 text-white flex-1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Accent Color</Label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                                <Input value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} className="bg-[#08090c] border-white/10 text-white flex-1" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Nav Text Color</Label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="w-12 h-10 rounded cursor-pointer" />
                                <Input value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="bg-[#08090c] border-white/10 text-white flex-1" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Links */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Navigation Links</CardTitle>
                        <Button onClick={addNavLink} variant="outline" size="sm">+ Add Link</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {settings.navigationLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg">
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm" onClick={() => moveNavLink(index, "up")} disabled={index === 0} className="h-6 w-6 p-0">↑</Button>
                                <Button variant="ghost" size="sm" onClick={() => moveNavLink(index, "down")} disabled={index === settings.navigationLinks.length - 1} className="h-6 w-6 p-0">↓</Button>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <Input value={link.label} onChange={(e) => updateNavLink(index, "label", e.target.value)} placeholder="Label" className="bg-[#08090c] border-white/10 text-white" />
                                <Input value={link.href} onChange={(e) => updateNavLink(index, "href", e.target.value)} placeholder="/page or #section" className="bg-[#08090c] border-white/10 text-white" />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => updateNavLink(index, "isExternal", !link.isExternal)} className={link.isExternal ? "text-green-500" : "text-muted-foreground"}>
                                {link.isExternal ? "External" : "Internal"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeNavLink(index)} className="text-red-500">Remove</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Button Labels */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Button Labels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white">Login Button</Label>
                            <Input value={settings.loginButtonText} onChange={(e) => setSettings({ ...settings, loginButtonText: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Dashboard Button</Label>
                            <Input value={settings.dashboardButtonText} onChange={(e) => setSettings({ ...settings, dashboardButtonText: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">CTA Button Text</Label>
                            <Input value={settings.ctaButtonText} onChange={(e) => setSettings({ ...settings, ctaButtonText: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">CTA Button Link</Label>
                            <Input value={settings.ctaButtonLink} onChange={(e) => setSettings({ ...settings, ctaButtonLink: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Site Metadata */}
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Site Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-white">Site Title</Label>
                        <Input value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} className="bg-[#08090c] border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Site Description</Label>
                        <Textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className="bg-[#08090c] border-white/10 text-white min-h-[80px]" />
                    </div>
                </CardContent>
            </Card>

            {/* Save Buttons */}
            <div className="flex justify-end gap-2 pb-6">
                <Button variant="outline" onClick={handleReset} disabled={isSaving}>Reset to Defaults</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Header Settings"}</Button>
            </div>
        </div>
    )
}

// System Settings Component
function SystemSettings() {
    const [settings, setSettings] = useState({
        packagesEnabled: true,
        autoApproveUsers: false,
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/system")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch system settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/system", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("System settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save system settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-[#111318] border-white/10">
            <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
                <CardDescription className="text-gray-400">Manage system-wide settings and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Package Requirement for PDI</h3>
                            <p className="text-sm text-muted-foreground">
                                When enabled, users must purchase a package before submitting PDI inspection requests
                            </p>
                        </div>
                        <Button
                            variant={settings.packagesEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, packagesEnabled: !settings.packagesEnabled })}
                        >
                            {settings.packagesEnabled ? "Required" : "Optional"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Auto-Approve New Users</h3>
                            <p className="text-sm text-muted-foreground">
                                When enabled, new user registrations are automatically approved without admin review
                            </p>
                        </div>
                        <Button
                            variant={settings.autoApproveUsers ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, autoApproveUsers: !settings.autoApproveUsers })}
                        >
                            {settings.autoApproveUsers ? "Auto-Approve" : "Manual Approval"}
                        </Button>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Disabling package requirements will allow users to submit PDI requests without purchasing a package</li>
                        <li>• Auto-approving users bypasses admin verification and security checks</li>
                        <li>• These settings affect your business workflow and security</li>
                    </ul>
                </div>

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save System Settings"}
                </Button>
            </CardContent>
        </Card>
    )
}

// SMTP Settings Component
function SMTPSettings() {
    const [settings, setSettings] = useState({
        host: "",
        port: "587",
        username: "",
        password: "",
        fromEmail: "",
        fromName: "",
        encryption: "TLS",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [testEmail, setTestEmail] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/smtp")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch SMTP settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("SMTP settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save SMTP settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleTestEmail() {
        if (!testEmail) {
            alert("Please enter an email address")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/smtp/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testEmail }),
            })

            if (response.ok) {
                alert("Test email sent successfully! Check your inbox.")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to send test email:", error)
            alert("Failed to send test email")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-[#111318] border-white/10">
            <CardHeader>
                <CardTitle className="text-white">SMTP Configuration</CardTitle>
                <CardDescription className="text-gray-400">Configure email server settings for sending notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="host">SMTP Host *</Label>
                        <Input
                            id="host"
                            placeholder="smtp.gmail.com"
                            value={settings.host}
                            onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port *</Label>
                        <Input
                            id="port"
                            type="number"
                            placeholder="587"
                            value={settings.port}
                            onChange={(e) => setSettings({ ...settings, port: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username *</Label>
                        <Input
                            id="username"
                            placeholder="your-email@gmail.com"
                            value={settings.username}
                            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={settings.password}
                            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email *</Label>
                        <Input
                            id="fromEmail"
                            placeholder="noreply@yourcompany.com"
                            value={settings.fromEmail}
                            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fromName">From Name *</Label>
                        <Input
                            id="fromName"
                            placeholder="Your Company"
                            value={settings.fromName}
                            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="encryption">Encryption</Label>
                    <Select value={settings.encryption} onValueChange={(value) => setSettings({ ...settings, encryption: value })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TLS">TLS</SelectItem>
                            <SelectItem value="SSL">SSL</SelectItem>
                            <SelectItem value="NONE">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold">Test Email Configuration</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter test email address"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <Button onClick={handleTestEmail} disabled={isLoading} variant="outline">
                            Send Test
                        </Button>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save SMTP Settings"}
                </Button>
            </CardContent>
        </Card>
    )
}

// AI Settings Tab Component
function AISettingsTab() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [formData, setFormData] = useState({
        geminiApiKey: '',
        translationEnabled: true
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings/ai')
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setFormData({
                        geminiApiKey: data.settings.geminiApiKey || '',
                        translationEnabled: data.settings.translationEnabled ?? true
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching AI settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/admin/settings/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                alert('AI settings saved successfully!')
            } else {
                const data = await res.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card className="bg-[#111318] border-white/10">
                <CardContent className="py-10 text-center text-muted-foreground">
                    Loading AI settings...
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-[#111318] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Google Gemini AI Configuration</CardTitle>
                    <CardDescription className="text-gray-400">
                        Configure AI-powered translation features using Google Gemini
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* API Key */}
                    <div className="space-y-2">
                        <Label className="text-white">Gemini API Key *</Label>
                        <div className="relative">
                            <Input
                                type={showApiKey ? 'text' : 'password'}
                                value={formData.geminiApiKey}
                                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                                placeholder="Enter your Gemini API key"
                                className="bg-[#08090c] border-white/10 text-white pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 text-gray-400"
                            >
                                {showApiKey ? '👁️' : '🔒'}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Get your API key from{' '}
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-[#e8a317]"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Translation Toggle */}
                    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-white">Enable Translation Feature</h3>
                            <p className="text-sm text-muted-foreground">
                                Allow admins to translate Hindi text to English in insurance forms
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant={formData.translationEnabled ? "default" : "outline"}
                            onClick={() => setFormData({ ...formData, translationEnabled: !formData.translationEnabled })}
                        >
                            {formData.translationEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ About AI Translation:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Translates Hindi damage descriptions to English automatically</li>
                    <li>• Uses Google Gemini AI for accurate translations</li>
                    <li>• Available in insurance claim forms with a single click</li>
                    <li>• Helps streamline claim processing and documentation</li>
                </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save AI Settings"}
            </Button>
        </form>
    )
}

// OTP Settings Component
function OTPSettings() {
    const [settings, setSettings] = useState({
        emailOTPEnabled: true,
        mobileOTPEnabled: false,
        otpExpiryMinutes: 10,
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const response = await fetch("/api/settings/otp")
            if (response.ok) {
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (error) {
            console.error("Failed to fetch OTP settings:", error)
        }
    }

    async function handleSave() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/settings/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })

            if (response.ok) {
                alert("OTP settings saved successfully!")
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to save OTP settings:", error)
            alert("Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="bg-[#111318] border-white/10">
            <CardHeader>
                <CardTitle className="text-white">OTP Verification Settings</CardTitle>
                <CardDescription className="text-gray-400">Control OTP verification requirements for new registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Email OTP Verification</h3>
                            <p className="text-sm text-muted-foreground">Require email verification during registration</p>
                        </div>
                        <Button
                            variant={settings.emailOTPEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, emailOTPEnabled: !settings.emailOTPEnabled })}
                        >
                            {settings.emailOTPEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Mobile OTP Verification</h3>
                            <p className="text-sm text-muted-foreground">Require mobile verification during registration</p>
                        </div>
                        <Button
                            variant={settings.mobileOTPEnabled ? "default" : "outline"}
                            onClick={() => setSettings({ ...settings, mobileOTPEnabled: !settings.mobileOTPEnabled })}
                        >
                            {settings.mobileOTPEnabled ? "Enabled" : "Disabled"}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiry">OTP Expiry Time (minutes)</Label>
                        <Input
                            id="expiry"
                            type="number"
                            min="5"
                            max="60"
                            value={settings.otpExpiryMinutes}
                            onChange={(e) => setSettings({ ...settings, otpExpiryMinutes: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">OTP Rules:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Email OTP enabled → Email verification required</li>
                        <li>• Mobile OTP enabled → Mobile verification required</li>
                        <li>• Both enabled → Both required</li>
                        <li>• Both disabled → OTP verification skipped</li>
                    </ul>
                </div>

                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save OTP Settings"}
                </Button>
            </CardContent>
        </Card>
    )
}

// Login Purposes Component
function LoginPurposes() {
    const [purposes, setPurposes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newPurpose, setNewPurpose] = useState({ name: "", description: "" })
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        fetchPurposes()
    }, [])

    async function fetchPurposes() {
        try {
            const response = await fetch("/api/admin/login-purposes")
            if (response.ok) {
                const data = await response.json()
                setPurposes(data.purposes || [])
            }
        } catch (error) {
            console.error("Failed to fetch login purposes:", error)
        }
    }

    async function handleAdd() {
        if (!newPurpose.name) {
            alert("Please enter a purpose name")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPurpose),
            })

            if (response.ok) {
                alert("Login purpose added successfully!")
                setNewPurpose({ name: "", description: "" })
                setShowAddForm(false)
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to add login purpose:", error)
            alert("Failed to add login purpose")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this login purpose?")) return

        try {
            const response = await fetch(`/api/admin/login-purposes?id=${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                alert("Login purpose deleted successfully!")
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to delete login purpose:", error)
            alert("Failed to delete login purpose")
        }
    }

    async function toggleActive(id: string, isActive: boolean) {
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !isActive }),
            })

            if (response.ok) {
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to update login purpose:", error)
        }
    }

    return (
        <Card className="bg-[#111318] border-white/10">
            <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-white">Login Purposes</CardTitle>
                        <CardDescription className="text-gray-400">Manage available login purposes for user registration</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? "Cancel" : "Add Purpose"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showAddForm && (
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                        <div className="space-y-2">
                            <Label htmlFor="purposeName">Purpose Name *</Label>
                            <Input
                                id="purposeName"
                                placeholder="e.g., Business Partnership"
                                value={newPurpose.name}
                                onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purposeDesc">Description</Label>
                            <Input
                                id="purposeDesc"
                                placeholder="Optional description"
                                value={newPurpose.description}
                                onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isLoading} className="w-full">
                            {isLoading ? "Adding..." : "Add Login Purpose"}
                        </Button>
                    </div>
                )}

                <div className="space-y-2">
                    {purposes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No login purposes found</div>
                    ) : (
                        purposes.map((purpose) => (
                            <div key={purpose.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold">{purpose.name}</h3>
                                    {purpose.description && (
                                        <p className="text-sm text-muted-foreground">{purpose.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant={purpose.isActive ? "default" : "outline"}
                                        onClick={() => toggleActive(purpose.id, purpose.isActive)}
                                    >
                                        {purpose.isActive ? "Active" : "Inactive"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(purpose.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Role-Based Access Control Component
function RoleSettings() {
    const roles = ["ADMIN", "CLIENT", "DEALER", "AGENT"]
    const permissionKeys = [
        { key: "DASHBOARD_VIEW", label: "View Dashboard" },
        { key: "USERS_MANAGE", label: "Manage Users" },
        { key: "PDI_REQUESTS_VIEW", label: "View PDI Requests" },
        { key: "PDI_INSPECTION_MANAGE", label: "Manage PDI Inspections" },
        { key: "INSURANCE_MANAGE", label: "Manage Insurance" },
        { key: "PACKAGES_MANAGE", label: "Manage Packages" },
        { key: "SETTINGS_MANAGE", label: "Manage Settings" },
    ]

    const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchRolePermissions()
    }, [])

    async function fetchRolePermissions() {
        try {
            const response = await fetch("/api/settings/roles")
            if (response.ok) {
                const data = await response.json()
                const formatted: Record<string, string[]> = {}
                roles.forEach(role => formatted[role] = [])
                data.permissions.forEach((rp: any) => {
                    formatted[rp.role] = JSON.parse(rp.permissions)
                })
                setRolePermissions(formatted)
            }
        } catch (error) {
            console.error("Failed to fetch role permissions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            const promises = Object.entries(rolePermissions).map(([role, permissions]) =>
                fetch("/api/settings/roles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role, permissions })
                })
            )
            await Promise.all(promises)
            alert("Role permissions saved successfully!")
        } catch (error) {
            console.error("Failed to save role permissions:", error)
            alert("Failed to save role permissions")
        } finally {
            setIsSaving(false)
        }
    }

    const togglePermission = (role: string, perm: string) => {
        setRolePermissions(prev => {
            const current = prev[role] || []
            const updated = current.includes(perm)
                ? current.filter(p => p !== perm)
                : [...current, perm]
            return { ...prev, [role]: updated }
        })
    }

    if (isLoading) return <div className="text-center py-10 text-muted-foreground">Loading permissions...</div>

    return (
        <Card className="bg-[#111318] border-white/10">
            <CardHeader className="border-b border-white/5 pb-6">
                <CardTitle className="text-white">Role Permissions</CardTitle>
                <CardDescription className="text-gray-400">Control access levels for each user role</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-4 text-sm font-medium text-gray-400 w-1/3">Permission</th>
                                {roles.map(role => (
                                    <th key={role} className="p-4 text-sm font-medium text-white text-center whitespace-nowrap">{role}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionKeys.map(({ key, label }) => (
                                <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-sm text-gray-300 font-medium">{label}</td>
                                    {roles.map(role => (
                                        <td key={role} className="p-4 text-center">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={rolePermissions[role]?.includes(key)}
                                                    onChange={() => togglePermission(role, key)}
                                                    className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-[#e8a317] accent-[#e8a317] cursor-pointer transition-all"
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Role Permissions"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
