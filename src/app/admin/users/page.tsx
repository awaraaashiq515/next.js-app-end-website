"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    X,
    Filter,
    Download,
    RefreshCw,
    Shield,
    CheckCircle2,
    AlertCircle,
    User as UserIcon,
    Loader2
} from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    mobile: string | null
    role: string
    status: string
    purposeOfLogin: { id: string, name: string } | null
    createdAt: string
    emailVerified: boolean
    mobileVerified: boolean
}

interface LoginPurpose {
    id: string
    name: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [purposes, setPurposes] = useState<LoginPurpose[]>([])

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "CLIENT",
        status: "APPROVED",
        password: "", // Only for create
        purposeOfLoginId: ""
    })

    useEffect(() => {
        fetchUsers()
        fetchPurposes()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [users, statusFilter, roleFilter, searchQuery])

    async function fetchUsers() {
        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/users")
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchPurposes() {
        try {
            const res = await fetch("/api/login-purposes")
            if (res.ok) {
                const data = await res.json()
                setPurposes(data.purposes || [])
            }
        } catch (e) {
            console.error("Failed to fetch purposes", e)
        }
    }

    function filterUsers() {
        let filtered = users

        if (statusFilter !== "ALL") {
            filtered = filtered.filter(user => user.status === statusFilter)
        }

        if (roleFilter !== "ALL") {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.mobile && user.mobile.toLowerCase().includes(query))
            )
        }

        setFilteredUsers(filtered)
    }

    const handleCreateClick = () => {
        setFormData({
            name: "",
            email: "",
            mobile: "",
            role: "CLIENT",
            status: "APPROVED",
            password: "",
            purposeOfLoginId: ""
        })
        setIsCreateOpen(true)
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            mobile: user.mobile || "",
            role: user.role,
            status: user.status,
            password: "", // Don't fill password on edit
            purposeOfLoginId: user.purposeOfLogin?.id || ""
        })
        setIsEditOpen(true)
    }

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    async function handleSubmit(e: React.FormEvent, mode: "CREATE" | "EDIT") {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = "/api/admin/users"
            const method = mode === "CREATE" ? "POST" : "PATCH"
            const payload = mode === "CREATE"
                ? formData
                : { ...formData, userId: selectedUser?.id }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok) {
                alert(`Error: ${result.error}`)
                return
            }

            alert(mode === "CREATE" ? "User created successfully!" : "User updated successfully!")
            setIsCreateOpen(false)
            setIsEditOpen(false)
            fetchUsers()

        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDeleteConfirm() {
        if (!selectedUser) return
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
                method: "DELETE"
            })
            if (response.ok) {
                alert("User deleted successfully")
                setIsDeleteOpen(false)
                fetchUsers()
            } else {
                alert("Failed to delete user")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function updateUserStatus(userId: string, newStatus: string) {
        try {
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status: newStatus }),
            })

            if (response.ok) {
                fetchUsers()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to update user:", error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display">User Management</h1>
                    <p className="text-muted-foreground">Monitor, approve, and manage system users</p>
                </div>
                <Button onClick={handleCreateClick} className="bg-[#e8a317] text-black hover:bg-[#d49510] font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Add New User
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: users.length, icon: UserIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Pending", value: users.filter(u => u.status === "PENDING").length, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Active", value: users.filter(u => u.status === "APPROVED").length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Rejected", value: users.filter(u => u.status === "REJECTED").length, icon: X, color: "text-red-500", bg: "bg-red-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/50 bg-card/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9 bg-background/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="DEALER">Dealer</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="APPROVED">Active</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchUsers}>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>

            {/* Table */}
            <Card className="overflow-hidden border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role & Purpose</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-amber-500 font-bold border border-amber-500/30">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{user.name}</p>
                                                    <p className="text-muted-foreground text-xs">{user.email}</p>
                                                    {user.mobile && <p className="text-muted-foreground text-xs">{user.mobile}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/5">
                                                    {user.role}
                                                </Badge>
                                                {user.purposeOfLogin && (
                                                    <p className="text-xs text-muted-foreground">
                                                        For: {user.purposeOfLogin.name}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div
                                                onClick={() => {
                                                    if (user.status === "PENDING") {
                                                        updateUserStatus(user.id, "APPROVED")
                                                    } else if (user.status === "APPROVED") {
                                                        updateUserStatus(user.id, "PENDING")
                                                    }
                                                }}
                                                className={`
                                                    inline-block px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200
                                                    ${getStatusColor(user.status)}
                                                    ${(user.status === "PENDING" || user.status === "APPROVED") ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 select-none" : "cursor-default opacity-80"}
                                                `}
                                                title={(user.status === "PENDING" || user.status === "APPROVED") ? "Click to toggle status" : ""}
                                            >
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEditClick(user)} className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(user)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create/Edit Modal */}
            {(isCreateOpen || isEditOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <CardTitle>{isCreateOpen ? "Create New User" : "Edit User Details"}</CardTitle>
                            <Button size="icon" variant="ghost" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false) }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <form onSubmit={(e) => handleSubmit(e, isCreateOpen ? "CREATE" : "EDIT")}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CLIENT">Client</SelectItem>
                                                <SelectItem value="DEALER">Dealer</SelectItem>
                                                <SelectItem value="AGENT">Agent</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mobile</label>
                                        <Input
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="APPROVED">Approved</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {isCreateOpen && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            placeholder="••••••"
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-6 pt-0 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false) }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 text-black hover:bg-amber-600">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isCreateOpen ? "Create User" : "Save Changes")}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-sm border-red-500/30 bg-card shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Delete User?
                            </CardTitle>
                            <CardDescription>
                                Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <div className="p-6 pt-0 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
                                {isSubmitting ? "Deleting..." : "Delete User"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
