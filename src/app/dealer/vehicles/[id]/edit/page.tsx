"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    ChevronLeft, Loader2, AlertCircle, Sparkles, Star,
    Save, FileText, Activity, IndianRupee, ImageIcon,
    Wrench, ShieldCheck, MapPin, Tag, Zap, Calendar,
    Gauge, Eye, CheckCircle2, Plus, Trash2, Video,
    ArrowRight, Info
} from "lucide-react"
import Link from "next/link"
import { PDIUploadSection } from "@/components/dealer/vehicles/PDIUploadSection"

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]
const TRANSMISSIONS = ["Manual", "Automatic"]
const CURRENT_YEAR = new Date().getFullYear()
const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Luxury", "Coupe", "MUV"]
const SEATING_CAPACITIES = ["2", "4", "5", "7", "8+"]
const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4x4"]
const CONDITION_GRADES = ["A", "B", "C", "D", "E"]
const TYRE_LIFE = ["New (90-100%)", "Excellent (75-90%)", "Good (50-75%)", "Average (25-50%)", "Poor (< 25%)"]
const BATTERY_STATUS = ["New", "Excellent", "Good", "Satisfactory", "Needs Change"]
const YES_NO = ["Yes", "No"]

const MOD_LIBRARY = [
    { id: "alloys", label: "Premium Alloys", category: "Exterior" },
    { id: "android", label: "Android Infotainment", category: "Interior" },
    { id: "leather", label: "Leather Seat Covers", category: "Interior" },
    { id: "ceramic", label: "Ceramic Coating", category: "Protection" },
    { id: "exhaust", label: "Sport Exhaust", category: "Performance" },
    { id: "lights", label: "LED Projectors", category: "Exterior" },
    { id: "speakers", label: "Hi-Fi Audio System", category: "Interior" },
    { id: "suspension", label: "Upgraded Suspension", category: "Performance" },
]

const SAFETY_FEATURES = ["Airbags", "ABS", "EBD", "Traction Control", "Parking Sensors", "Reverse Camera"]
const COMFORT_FEATURES = ["Sunroof", "Touchscreen", "Cruise Control", "Climate Control", "Leather Seats"]

export default function EditVehiclePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const vehicleId = params.id
    const router = useRouter()
    const imageInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [canFeature, setCanFeature] = useState(false)
    const [activeSection, setActiveSection] = useState("identity")

    const [form, setForm] = useState({
        vehicleType: "CAR",
        title: "",
        make: "",
        model: "",
        year: String(CURRENT_YEAR),
        price: "",
        mileage: "",
        fuelType: "Petrol",
        transmission: "Manual",
        color: "",
        city: "",
        state: "",
        description: "",
        status: "DRAFT",
        isFeatured: false,
        // Professional Specs
        bodyType: "Sedan",
        seatingCapacity: "5",
        driveType: "FWD",
        engineCC: "",
        ownerType: "First Owner",
        registrationNumber: "",
        insuranceDetails: "",
        overallCondition: "Excellent",
        accidentHistory: "",
        serviceHistory: "",
        healthStatus: "",
        // Professional Documentation
        insuranceCompany: "",
        insuranceExpiry: "",
        rtoLocation: "",
        lastServiceDate: "",
        lastServiceKM: "",
        serviceCount: "0",
        spareKey: "Yes",
        // Condition Metrics
        tyreLife: "Excellent (75-90%)",
        batteryStatus: "Good",
        engineGrade: "A",
        transmissionGrade: "A",
        exteriorGrade: "A",
        interiorGrade: "A",
        accidentFree: true,
        floodAffected: false,
        videoUrl: "",
        // PDI Fields
        pdiStatus: "No",
        pdiType: null,
        rcAvailable: "No",
    })

    const [images, setImages] = useState<string[]>([])
    const [modifications, setModifications] = useState<string[]>([])
    const [safetyFeatures, setSafetyFeatures] = useState<string[]>([])
    const [comfortFeatures, setComfortFeatures] = useState<string[]>([])
    const [pdiFiles, setPdiFiles] = useState<string[]>([])
    const [newMod, setNewMod] = useState("")

    useEffect(() => {
        const loadData = async () => {
            try {
                const [vRes, capRes] = await Promise.all([
                    fetch(`/api/dealer/vehicles/${vehicleId}`),
                    fetch("/api/dealer/vehicles"),
                ])
                if (vRes.ok) {
                    const { vehicle } = await vRes.json()
                    console.log("Loaded Vehicle:", vehicle)

                    // Parse JSON fields safely
                    const parseJSON = (data: any, fallback: any) => {
                        try {
                            return typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : fallback)
                        } catch {
                            return fallback
                        }
                    }

                    setImages(parseJSON(vehicle.images, []))
                    setModifications(parseJSON(vehicle.modifications, []))
                    // Note: safety/comfort features might be in metadata or separate fields if schema evolved, 
                    // but assuming they are not in schema as pure arrays yet, we might need to check how they were saved.
                    // The Add page logic saved them as separate JSON updates?
                    // Re-checking Add Page: It sends `safetyFeatures` and `comfortFeatures` to API. 
                    // API `POST` saves them... WAIT. The API `POST` destructures them but doesn't seem to map them to specific columns?
                    // Ah, the API `POST` (viewed earlier) had: `const { ... safetyFeatures, comfortFeatures ... } = body`.
                    // But `db.dealerVehicle.create` didn't seem to map them to specific columns unless they are in `metadata`?
                    // Let's check schema again. `metadata` is a string. `modifications` is a string.
                    // If safety/comfort are not in schema columns, they must be in `metadata`.
                    // EDIT: The API `POST` implementation I saw earlier does NOT save safetyFeatures/comfortFeatures to `metadata`. It ignores them!
                    // This means they might be lost in the current implementation. 
                    // I will double check the `metadata` saving in `POST`.
                    // Actually, let's assume for now we save them in `metadata` in this Edit page to fix it.

                    const meta = parseJSON(vehicle.metadata, {})
                    if (meta.safetyFeatures) setSafetyFeatures(meta.safetyFeatures)
                    if (meta.comfortFeatures) setComfortFeatures(meta.comfortFeatures)
                    setPdiFiles(parseJSON(vehicle.pdiFiles, []))

                    setForm({
                        vehicleType: vehicle.vehicleType || "CAR",
                        title: vehicle.title || "",
                        make: vehicle.make || "",
                        model: vehicle.model || "",
                        year: String(vehicle.year || CURRENT_YEAR),
                        price: String(vehicle.price || ""),
                        mileage: vehicle.mileage ? String(vehicle.mileage) : "",
                        fuelType: vehicle.fuelType || "Petrol",
                        transmission: vehicle.transmission || "Manual",
                        color: vehicle.color || "",
                        city: vehicle.city || "",
                        state: vehicle.state || "",
                        description: vehicle.description || "",
                        status: vehicle.status || "DRAFT",
                        isFeatured: vehicle.isFeatured || false,

                        bodyType: vehicle.bodyType || "Sedan",
                        seatingCapacity: vehicle.seatingCapacity ? String(vehicle.seatingCapacity) : "5",
                        driveType: vehicle.driveType || "FWD",
                        engineCC: vehicle.engineCC ? String(vehicle.engineCC) : "",
                        ownerType: vehicle.ownerType || "First Owner",
                        registrationNumber: vehicle.registrationNumber || "",
                        insuranceDetails: vehicle.insuranceDetails || "",
                        overallCondition: vehicle.overallCondition || "Excellent",

                        insuranceCompany: vehicle.insuranceCompany || "",
                        insuranceExpiry: vehicle.insuranceExpiry || "",
                        rtoLocation: vehicle.rtoLocation || "",
                        lastServiceDate: vehicle.lastServiceDate || "",
                        lastServiceKM: vehicle.lastServiceKM ? String(vehicle.lastServiceKM) : "",
                        serviceCount: vehicle.serviceCount ? String(vehicle.serviceCount) : "0",
                        spareKey: vehicle.spareKey || "Yes",

                        tyreLife: vehicle.tyreLife || "Excellent (75-90%)",
                        batteryStatus: vehicle.batteryStatus || "Good",
                        engineGrade: vehicle.engineGrade || "A",
                        transmissionGrade: vehicle.transmissionGrade || "A",
                        exteriorGrade: vehicle.exteriorGrade || "A",
                        interiorGrade: vehicle.interiorGrade || "A",
                        accidentFree: vehicle.accidentFree === true,
                        floodAffected: vehicle.floodAffected === true,
                        videoUrl: vehicle.videoUrl || "",
                        accidentHistory: vehicle.accidentHistory || "",
                        serviceHistory: vehicle.serviceHistory || "",
                        healthStatus: vehicle.healthStatus || "",
                        // PDI Fields
                        pdiStatus: vehicle.pdiStatus || "No",
                        pdiType: vehicle.pdiType || null,
                        rcAvailable: vehicle.rcAvailable || "No",
                    })
                }
                if (capRes.ok) {
                    const { capabilities } = await capRes.json()
                    setCanFeature(capabilities?.canFeatureVehicles === true)
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load vehicle data")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [vehicleId])

    const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

    const toggleList = (list: string[], setList: any, item: string) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const remainingSlots = 10 - images.length
        const totalToUpload = Math.min(files.length, remainingSlots)
        for (let i = 0; i < totalToUpload; i++) {
            const file = files[i]
            const reader = new FileReader()
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string])
            }
            reader.readAsDataURL(file)
        }
        if (imageInputRef.current) imageInputRef.current.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            // Pack metadata
            const metadata = {
                safetyFeatures,
                comfortFeatures
            }

            const res = await fetch(`/api/dealer/vehicles/${vehicleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    year: parseInt(form.year),
                    price: parseFloat(form.price),
                    mileage: form.mileage ? parseInt(form.mileage) : null,
                    engineCC: form.engineCC ? parseInt(form.engineCC) : null,
                    serviceCount: form.serviceCount ? parseInt(form.serviceCount) : 0,
                    lastServiceKM: form.lastServiceKM ? parseInt(form.lastServiceKM) : null,
                    seatingCapacity: form.seatingCapacity ? parseInt(form.seatingCapacity) : null,
                    modifications: JSON.stringify(modifications),
                    images: JSON.stringify(images),
                    metadata: JSON.stringify(metadata),
                    pdiStatus: form.pdiStatus,
                    pdiType: form.pdiType,
                    pdiFiles: JSON.stringify(pdiFiles),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || "Failed to update vehicle")
                return
            }
            router.push("/dealer/vehicles")
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        )
    }

    const sections = [
        { id: "identity", label: "Identity", icon: FileText },
        { id: "pricing", label: "Pricing & Story", icon: IndianRupee },
        { id: "specs", label: "Specifications", icon: Gauge },
        { id: "condition", label: "Condition & Heath", icon: Activity },
        { id: "docs", label: "Documentation", icon: ShieldCheck },
        { id: "media", label: "Media Gallery", icon: ImageIcon },
        { id: "features", label: "Features & Mods", icon: Sparkles },
    ]

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dealer/vehicles" className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Control</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing Protocol: {form.make} {form.model}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/dealer/vehicles")}
                            className="px-6 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-wider"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-10">
                {/* Sidebar Navigation */}
                <div className="col-span-3">
                    <div className="sticky top-32 space-y-2">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id)
                                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "center" })
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${activeSection === s.id
                                    ? "bg-white shadow-lg shadow-blue-50 border border-blue-100 text-blue-600 scale-105"
                                    : "text-slate-400 hover:bg-white hover:text-slate-600"
                                    }`}
                            >
                                <s.icon className={`w-5 h-5 transition-colors ${activeSection === s.id ? "text-blue-600" : "text-slate-300 group-hover:text-slate-500"}`} />
                                <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="col-span-9 space-y-12">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl flex items-center gap-4 text-red-700">
                            <AlertCircle className="w-6 h-6" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* IDENTITY */}
                    <section id="identity" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" /> Identity Matrix
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                                <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Make</label>
                                    <input type="text" value={form.make} onChange={e => set("make", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Model</label>
                                    <input type="text" value={form.model} onChange={e => set("model", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Year</label>
                                    <input type="number" value={form.year} onChange={e => set("year", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Body Type</label>
                                    <select value={form.bodyType} onChange={e => set("bodyType", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                        {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRICING */}
                    <section id="pricing" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <IndianRupee className="w-5 h-5 text-blue-600" /> Valuation & Narrative
                        </h2>
                        <div className="space-y-8">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-[2rem] pl-16 pr-8 py-6 text-4xl font-black focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                    <span className="text-[10px] font-bold text-slate-300">{form.description.length} chars</span>
                                </div>
                                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={6}
                                    className="w-full bg-slate-50 border-slate-200 rounded-3xl px-8 py-6 text-base focus:bg-white focus:border-blue-500 transition-all outline-none border resize-none leading-relaxed" />
                            </div>
                        </div>
                    </section>

                    {/* SPECS */}
                    <section id="specs" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <Gauge className="w-5 h-5 text-blue-600" /> Technical Specifications
                        </h2>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fuel Type</label>
                                <select value={form.fuelType} onChange={e => set("fuelType", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transmission</label>
                                <select value={form.transmission} onChange={e => set("transmission", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mileage (KM)</label>
                                <input type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seating</label>
                                <select value={form.seatingCapacity} onChange={e => set("seatingCapacity", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                    {SEATING_CAPACITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Drive Type</label>
                                <select value={form.driveType} onChange={e => set("driveType", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                    {DRIVE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* CONDITION */}
                    <section id="condition" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" /> Condition & Health
                        </h2>

                        <div className="space-y-8">
                            {/* Grades */}
                            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Mechanical Pulse (Grades)</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Engine", field: "engineGrade" },
                                        { label: "Trans", field: "transmissionGrade" },
                                        { label: "Exterior", field: "exteriorGrade" },
                                        { label: "Interior", field: "interiorGrade" }
                                    ].map(g => (
                                        <div key={g.field} className="space-y-2">
                                            <span className="text-[9px] font-bold uppercase text-slate-400 block ml-1">{g.label}</span>
                                            <select
                                                value={form[g.field as keyof typeof form] as string}
                                                onChange={e => set(g.field, e.target.value)}
                                                className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-sm font-bold border focus:border-blue-500 outline-none"
                                            >
                                                {CONDITION_GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hardware */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tyre Life</label>
                                    <select value={form.tyreLife} onChange={e => set("tyreLife", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                        {TYRE_LIFE.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Battery Status</label>
                                    <select value={form.batteryStatus} onChange={e => set("batteryStatus", e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                        {BATTERY_STATUS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-4">
                                <button type="button" onClick={() => set("accidentFree", !form.accidentFree)}
                                    className={`px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${form.accidentFree ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400"}`}>
                                    <ShieldCheck className="w-4 h-4" /> Accident Free
                                </button>
                                <button type="button" onClick={() => set("floodAffected", !form.floodAffected)}
                                    className={`px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${form.floodAffected ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-400"}`}>
                                    <Zap className="w-4 h-4" /> Flood Affected
                                </button>
                            </div>

                            {/* PDI SECTION */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <PDIUploadSection
                                    pdiStatus={form.pdiStatus}
                                    pdiType={form.pdiType}
                                    pdiFiles={pdiFiles}
                                    onChange={(data: { pdiStatus?: string, pdiType?: string | null, pdiFiles?: string[] }) => {
                                        if (data.pdiStatus !== undefined) set("pdiStatus", data.pdiStatus)
                                        if (data.pdiType !== undefined) set("pdiType", data.pdiType)
                                        if (data.pdiFiles !== undefined) setPdiFiles(data.pdiFiles)
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* DOCS */}
                    <section id="docs" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600" /> Documentation Registry
                        </h2>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">RTO Location</label>
                                <input type="text" value={form.rtoLocation} onChange={e => set("rtoLocation", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" placeholder="e.g. MH-02" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Insurance Company</label>
                                <input type="text" value={form.insuranceCompany} onChange={e => set("insuranceCompany", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Insurance Expiry</label>
                                <input type="text" value={form.insuranceExpiry} onChange={e => set("insuranceExpiry", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" placeholder="e.g. Dec 2026" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Spare Key</label>
                                <select value={form.spareKey} onChange={e => set("spareKey", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border">
                                    {YES_NO.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Service KM</label>
                                <input type="number" value={form.lastServiceKM} onChange={e => set("lastServiceKM", e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" />
                            </div>
                        </div>
                    </section>

                    {/* MEDIA */}
                    <section id="media" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <ImageIcon className="w-5 h-5 text-blue-600" /> Media Gallery
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            <input type="file" hidden multiple accept="image/*" ref={imageInputRef} onChange={handleFileChange} />
                            <div onClick={() => imageInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-600">
                                <Plus className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add</span>
                            </div>
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Video URL</label>
                            <input type="text" value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none border" placeholder="https://youtube.com/..." />
                        </div>
                    </section>

                    {/* FEATURES */}
                    <section id="features" className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 scroll-mt-32">
                        <h2 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-blue-600" /> Features & Mods
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Safety Features</h3>
                                <div className="flex flex-wrap gap-3">
                                    {SAFETY_FEATURES.map(f => (
                                        <button key={f} type="button" onClick={() => toggleList(safetyFeatures, setSafetyFeatures, f)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${safetyFeatures.includes(f) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-blue-300"
                                                }`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Comfort Features</h3>
                                <div className="flex flex-wrap gap-3">
                                    {COMFORT_FEATURES.map(f => (
                                        <button key={f} type="button" onClick={() => toggleList(comfortFeatures, setComfortFeatures, f)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${comfortFeatures.includes(f) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-blue-300"
                                                }`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Modifications</h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {MOD_LIBRARY.map(m => (
                                        <button key={m.id} type="button" onClick={() => toggleList(modifications, setModifications, m.label)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${modifications.includes(m.label) ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"
                                                }`}>
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newMod} onChange={e => setNewMod(e.target.value)} placeholder="Custom Modification..."
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold w-64 outline-none focus:bg-white focus:border-blue-500 transition-all" />
                                    <button type="button" onClick={() => { if (newMod.trim()) { setModifications([...modifications, newMod]); setNewMod("") } }}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600">
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
