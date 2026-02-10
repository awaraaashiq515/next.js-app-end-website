"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PDISection, PDIStatus, VehicleDamageData, PDILeakageItem, PDILeakageResponse } from "./pdi-types"
import { PDISectionComponent } from "./pdi-section"
import { LeakageInspection } from "./leakage-inspection"
import { VehicleDamageMarker } from "./vehicle-damage-marker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, FileText, Car, User, Wrench, Droplets, AlertCircle, CheckCircle2 } from "lucide-react"

// Define User Type
interface ClientUser {
    id: string
    name: string
    email: string
    mobile: string
}

// Form Schema - All mandatory fields as per requirements
const formSchema = z.object({
    // Customer Details
    customerName: z.string().min(1, "Customer Name is required"),
    customerPhone: z.string().min(1, "Mobile Number is required"),
    customerEmail: z.string().email("Invalid email").optional().or(z.literal('')),

    // Vehicle Details
    vehicleMake: z.string().min(1, "Vehicle Make is required"),
    vehicleModel: z.string().min(1, "Vehicle Model is required"),
    vehicleColor: z.string().min(1, "Vehicle Color is required"),
    vehicleYear: z.string().min(1, "Manufacturing Year is required"),
    engineNumber: z.string().min(1, "Engine Number is required"),
    vin: z.string().min(1, "Chassis Number is required"),
    odometer: z.string().min(1, "Odometer Reading is required"),

    // Inspection Details
    inspectedBy: z.string().optional().or(z.literal('')),
    adminComments: z.string().optional(),
    inspectionDate: z.string().optional(),
    digitalSignature: z.string().optional(),
    customerSignature: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PDIFormProps {
    inspectionId?: string
    initialData?: any
}

export function PDIForm({ inspectionId, initialData }: PDIFormProps = {}) {
    const router = useRouter()
    const isEditMode = Boolean(inspectionId && initialData)
    const [sections, setSections] = React.useState<PDISection[]>([])
    const [leakageItems, setLeakageItems] = React.useState<PDILeakageItem[]>([])
    const [loading, setLoading] = React.useState(true)
    const [submitting, setSubmitting] = React.useState(false)
    const [submitSuccess, setSubmitSuccess] = React.useState(false)

    // Store PDI responses
    const [responses, setResponses] = React.useState<Record<string, { status: PDIStatus; notes: string }>>({})
    const [leakageResponses, setLeakageResponses] = React.useState<Record<string, PDILeakageResponse>>({})
    const [damageData, setDamageData] = React.useState<VehicleDamageData>({ markers: [] })
    const [clients, setClients] = React.useState<ClientUser[]>([])
    const [loadingClients, setLoadingClients] = React.useState(false)
    const [selectedUserId, setSelectedUserId] = React.useState<string>("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: initialData?.customerName || "",
            customerPhone: initialData?.customerPhone || "",
            customerEmail: initialData?.customerEmail || "",
            vehicleMake: initialData?.vehicleMake || "",
            vehicleModel: initialData?.vehicleModel || "",
            vehicleColor: initialData?.vehicleColor || "",
            vehicleYear: initialData?.vehicleYear || "",
            engineNumber: initialData?.engineNumber || "",
            vin: initialData?.vin || "",
            odometer: initialData?.odometer || "",
            inspectedBy: initialData?.inspectedBy || "",
            adminComments: initialData?.adminComments || "",
            inspectionDate: initialData?.inspectionDate
                ? new Date(initialData.inspectionDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            digitalSignature: initialData?.digitalSignature || "",
            customerSignature: initialData?.customerSignature || "",
        },
    })

    // Fetch PDI structure and leakage items
    React.useEffect(() => {
        async function loadData() {
            try {
                const [structureRes, leakageRes] = await Promise.all([
                    fetch('/api/pdi/structure'),
                    fetch('/api/pdi/leakage-items')
                ])

                if (structureRes.ok) {
                    const data = await structureRes.json()
                    setSections(data)
                }

                if (leakageRes.ok) {
                    const data = await leakageRes.json()
                    setLeakageItems(data)
                }

                // If editing, populate responses from initialData
                if (initialData?.responses) {
                    const respMap: Record<string, { status: PDIStatus; notes: string }> = {}
                    initialData.responses.forEach((r: any) => {
                        respMap[r.itemId || r.item?.id] = { status: r.status, notes: r.notes || '' }
                    })
                    setResponses(respMap)
                }

                if (initialData?.leakageResponses) {
                    const leakMap: Record<string, PDILeakageResponse> = {}
                    initialData.leakageResponses.forEach((r: any) => {
                        const itemId = r.leakageItemId || r.leakageItem?.id
                        leakMap[itemId] = { leakageItemId: itemId, found: r.found, notes: r.notes }
                    })
                    setLeakageResponses(leakMap)
                }

                if (initialData?.vehicleDamageData) {
                    try {
                        setDamageData(JSON.parse(initialData.vehicleDamageData))
                    } catch (e) {
                        console.error('Failed to parse damage data')
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }

            // Fetch clients separately (non-blocking for form)
            try {
                setLoadingClients(true)
                const clientRes = await fetch('/api/admin/users?role=CLIENT')
                if (clientRes.ok) {
                    const data = await clientRes.json()
                    setClients(data.users.filter((u: any) => u.role === 'CLIENT' || u.role === 'USER'))
                }
            } catch (err) {
                console.error('Failed to load clients:', err)
            } finally {
                setLoadingClients(false)
            }
        }
        loadData()
    }, [])

    const handleItemChange = React.useCallback((itemId: string, status: PDIStatus, notes: string) => {
        setResponses(prev => ({
            ...prev,
            [itemId]: { status, notes }
        }))
    }, [])

    const handleLeakageChange = React.useCallback((itemId: string, found: boolean, notes?: string) => {
        setLeakageResponses(prev => ({
            ...prev,
            [itemId]: { leakageItemId: itemId, found, notes }
        }))
    }, [])

    async function onSubmit(data: FormValues) {
        setSubmitting(true)
        try {
            // Transform responses to array for API
            const responsesArray = Object.entries(responses).map(([itemId, val]) => ({
                itemId,
                status: val.status,
                notes: val.notes
            }))

            const leakageArray = Object.entries(leakageResponses).map(([itemId, val]) => ({
                leakageItemId: itemId,
                found: val.found,
                notes: val.notes || ""
            }))

            const payload = {
                ...data,
                responses: responsesArray,
                leakageResponses: leakageArray,
                vehicleDamageData: JSON.stringify(damageData),
                userId: selectedUserId || null
            }

            const url = isEditMode ? `/api/admin/pdi/update/${inspectionId}` : '/api/pdi/save'
            const method = isEditMode ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || errorData.error || 'Failed to save')
            }

            const result = await res.json()
            setSubmitSuccess(true)

            // Redirect to the PDI view page after success
            setTimeout(() => {
                router.push(`/admin/pdi/view/${result.id}`)
            }, 1500)

        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message || "Failed to save PDI Inspection"}`)
        } finally {
            setSubmitting(false)
        }
    }

    // Calculate overall progress
    const totalChecklistItems = sections.reduce((sum, s) => sum + s.items.length, 0)
    const answeredChecklistItems = Object.keys(responses).length
    const totalLeakageItems = leakageItems.length
    const answeredLeakageItems = Object.keys(leakageResponses).length

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-gray-400 animate-pulse">Loading PDI Structure...</p>
                </div>
            </div>
        )
    }

    if (submitSuccess) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{isEditMode ? 'PDI Updated Successfully!' : 'PDI Saved Successfully!'}</h2>
                    <p className="text-gray-400">Redirecting to report view...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#08090c] min-h-screen pb-12">
            <div className="max-w-[1800px] mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-[#08090c]/95 backdrop-blur-sm border-b border-white/10 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Title & Progress */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{isEditMode ? 'Edit PDI Inspection' : 'Pre-Delivery Inspection'}</h1>
                                <p className="text-sm text-gray-500">{isEditMode ? 'Modify inspection details and save changes' : 'Professional Vehicle Inspection Checklist'}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-white/[0.03] rounded-lg px-4 py-2 border border-white/10">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Checklist</span>
                                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-green-500 transition-all duration-500"
                                        style={{ width: `${totalChecklistItems > 0 ? (answeredChecklistItems / totalChecklistItems) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 font-mono">{answeredChecklistItems}/{totalChecklistItems}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/[0.03] rounded-lg px-4 py-2 border border-white/10">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Leakage</span>
                                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                        style={{ width: `${totalLeakageItems > 0 ? (answeredLeakageItems / totalLeakageItems) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 font-mono">{answeredLeakageItems}/{totalLeakageItems}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 font-bold px-8 h-12"
                            >
                                {submitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        {isEditMode ? 'Update Inspection' : 'Save Inspection'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                        {/* Customer & Vehicle Details - Compact Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Customer Details Card */}
                            <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500/20 to-transparent px-6 py-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Customer Details</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Select Existing Client */}
                                    {!isEditMode && (
                                        <div className="pb-4 border-b border-white/5 space-y-2">
                                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">
                                                Select Existing Client (Optional)
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    const client = clients.find(c => c.id === value)
                                                    if (client) {
                                                        setSelectedUserId(client.id)
                                                        form.setValue("customerName", client.name)
                                                        form.setValue("customerPhone", client.mobile || "")
                                                        form.setValue("customerEmail", client.email || "")
                                                    } else if (value === "new") {
                                                        setSelectedUserId("")
                                                        form.setValue("customerName", "")
                                                        form.setValue("customerPhone", "")
                                                        form.setValue("customerEmail", "")
                                                    }
                                                }}
                                                value={selectedUserId || (selectedUserId === "" ? "new" : undefined)}
                                            >
                                                <SelectTrigger className="h-11 bg-amber-500/5 border-amber-500/20 text-white focus:ring-amber-500">
                                                    <SelectValue placeholder="Search or select a client..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#111318] border-white/10 text-white max-h-[300px]">
                                                    <SelectItem value="new" className="font-bold text-amber-500">
                                                        + Create New Client
                                                    </SelectItem>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            <div className="flex flex-col items-start">
                                                                <span>{client.name}</span>
                                                                <span className="text-[10px] text-gray-500">{client.email || client.mobile}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-gray-600 italic">Selecting an existing client will auto-fill the details below.</p>
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Customer Name <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter customer name"
                                                        {...field}
                                                        className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-amber-500"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Mobile Number <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter mobile"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-amber-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Email Address
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter email"
                                                            type="email"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-amber-500"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details Card */}
                            <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500/20 to-transparent px-6 py-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Car className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Vehicle Details</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="vehicleMake"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Make <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Toyota"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vehicleModel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Model <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Camry"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vehicleColor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Color <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Black"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="vehicleYear"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Year <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="2024"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="engineNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Engine No. <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Engine number"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="vin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Chassis No. <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Chassis number"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="odometer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                        Odometer (KM) <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="0"
                                                            {...field}
                                                            className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-blue-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inspection Checklist - Multi-Column Layout */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Wrench className="w-6 h-6 text-amber-500" />
                                <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-white">Inspection Checklist</h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                            </div>

                            {/* 3-Column Grid for Sections */}
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sections.map((section) => (
                                    <PDISectionComponent
                                        key={section.id}
                                        section={section}
                                        responses={responses}
                                        onItemChange={handleItemChange}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Leakage Inspection */}
                        {leakageItems.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Droplets className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-white">Leakage Inspection</h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
                                </div>
                                <LeakageInspection
                                    items={leakageItems}
                                    responses={leakageResponses}
                                    onChange={handleLeakageChange}
                                />
                            </div>
                        )}

                        {/* Vehicle Damage Marking Section */}
                        <VehicleDamageMarker
                            damageData={damageData}
                            onChange={setDamageData}
                        />

                        {/* Comments / Recommendations Section */}
                        <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500/20 to-transparent px-6 py-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Comments / Recommendations</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <FormField
                                    control={form.control}
                                    name="adminComments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any recommendations, observations, or important notes for the customer..."
                                                    {...field}
                                                    className="min-h-[120px] bg-white/[0.03] border-white/10 text-white focus:border-purple-500 resize-none"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Signatures Section - matching PDF requirements */}
                        <div className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500/20 to-transparent px-6 py-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Signatures & Name (Optional)</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-amber-500/80 mb-6 flex items-center gap-2 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                    <AlertCircle className="w-4 h-4" />
                                    Note: These fields can be left blank if you prefer to sign the report manually after printing.
                                </p>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <FormField
                                        control={form.control}
                                        name="digitalSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Vehicle Inspected By (Signature)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Inspector signature/name"
                                                        {...field}
                                                        className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-orange-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customerSignature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Customer Signature
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Customer signature/name"
                                                        {...field}
                                                        className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-orange-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Customer Name (Verification)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter customer name"
                                                        {...field}
                                                        className="h-11 bg-white/[0.03] border-white/10 text-white focus:border-orange-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-8 border-t border-white/10">
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="lg"
                                className="w-full md:w-auto h-16 px-16 text-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 font-bold uppercase tracking-wider"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-3 h-6 w-6" />
                                        {isEditMode ? 'Update & Save Changes' : 'Complete & Save Inspection'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
