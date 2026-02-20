"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Car,
    Bike,
    ChevronLeft,
    Loader2,
    AlertCircle,
    X,
    CheckCircle2,
    Plus,
    ShieldCheck,
    Wrench,
    Video,
    Image as ImageIcon,
    Activity,
    ChevronRight,
    MapPin,
    FileText,
    Tag,
    Zap,
    Info,
    ArrowRight,
    Search,
    IndianRupee,
    ChevronDown,
    Trash2,
    Eye,
    Star,
    Sparkles,
    Calendar,
    Gauge,
    Trophy,
    Shield,
    Battery
} from "lucide-react"
import Link from "next/link"
import { PDIUploadSection } from "@/components/dealer/vehicles/PDIUploadSection"

const CAR_BRANDS = {
    "Maruti Suzuki": ["Alto", "Swift", "Baleno", "Brezza", "Ertiga", "Dzire"],
    "Hyundai": ["i10", "i20", "Creta", "Verna", "Venue", "Alcazar"],
    "Tata": ["Tiago", "Nexon", "Harrier", "Safari", "Punch", "Altroz"],
    "Mahindra": ["Thar", "Scorpio", "XUV700", "Bolero", "XUV300"],
    "Toyota": ["Innova", "Fortuner", "Glanza", "Urban Cruiser", "Camry"],
    "Honda": ["City", "Amaze", "Jazz", "WR-V"],
    "Kia": ["Seltos", "Sonet", "Carens", "Carnival"],
    "BMW": ["3 Series", "5 Series", "X1", "X3", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "GLE"]
}

const BIKE_BRANDS = {
    "Hero": ["Splendor+", "HF Deluxe", "Passion Pro", "Xpulse 200"],
    "Honda": ["Activa", "CB Shine", "Unicorn", "SP 125"],
    "TVS": ["Jupiter", "Apache RTR", "XL100", "Raider"],
    "Bajaj": ["Pulsar", "Platina", "Dominar", "Avenger"],
    "Royal Enfield": ["Classic 350", "Bullet 350", "Meteor 350", "Himalayan"],
    "Yamaha": ["R15", "MT-15", "FZ", "Fascino"],
    "Suzuki": ["Access", "Gixxer", "Burgman"],
    "KTM": ["Duke 200", "Duke 390", "RC 200", "RC 390"]
}

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"]
const TRANSMISSIONS = ["Manual", "Automatic"]
const OWNER_TYPES = ["First Owner", "Second Owner", "Third Owner", "Fourth or More"]
const CONDITION_LEVELS = ["Excellent", "Good", "Average"]
const SERVICE_LEVELS = ["Full", "Partial", "None"]
const YES_NO = ["Yes", "No"]
const BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Luxury", "Coupe", "MUV"]
const SEATING_CAPACITIES = ["2", "4", "5", "7", "8+"]
const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4x4"]
const CONDITION_GRADES = ["A", "B", "C", "D", "E"]
const TYRE_LIFE = ["New (90-100%)", "Excellent (75-90%)", "Good (50-75%)", "Average (25-50%)", "Poor (< 25%)"]
const BATTERY_STATUS = ["New", "Excellent", "Good", "Satisfactory", "Needs Change"]

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

const MOD_CHECKLIST = ["Alloy Wheels", "Ceramic Coating", "Sports Exhaust", "Body Kit", "Custom Interior"]
const SAFETY_FEATURES = ["Airbags", "ABS", "EBD", "Traction Control", "Parking Sensors", "Reverse Camera"]
const COMFORT_FEATURES = ["Sunroof", "Touchscreen", "Cruise Control", "Climate Control", "Leather Seats"]
const CURRENT_YEAR = new Date().getFullYear()

export default function AddVehiclePage() {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasAccess, setHasAccess] = useState<boolean | null>(null)
    const [step, setStep] = useState(0)
    const [vehicleType, setVehicleType] = useState<"CAR" | "BIKE">("CAR")

    const [form, setForm] = useState({
        title: "",
        make: "",
        model: "",
        year: String(CURRENT_YEAR),
        price: "",
        mileage: "",
        fuelType: "Petrol",
        transmission: "Manual",
        color: "",
        engineCC: "",
        ownerType: "First Owner",
        registrationNumber: "",
        insuranceDetails: "",
        overallCondition: "Excellent",
        accidentHistory: "No",
        serviceHistory: "Full",
        healthStatus: "Perfectly Running",
        description: "",
        videoUrl: "",
        city: "",
        state: "",
        status: "PUBLISHED",
        isFeatured: false,
        bodyType: "Sedan",
        seatingCapacity: "5",
        driveType: "FWD",
        insuranceCompany: "",
        insuranceExpiry: "",
        rtoLocation: "",
        lastServiceDate: "",
        spareKey: "Yes",
        rcAvailable: "No",
        // Elite Pre-Owned Metrics
        lastServiceKM: "",
        serviceCount: "0",
        tyreLife: "Excellent (75-90%)",
        batteryStatus: "Good",
        engineGrade: "A",
        transmissionGrade: "A",
        exteriorGrade: "A",
        interiorGrade: "A",
        accidentFree: true,
        floodAffected: false,
        modifications: [] as string[],
        // PDI Fields
        pdiStatus: "No",
        pdiType: null as string | null,
        pdiFiles: [] as string[],
    })

    const [modifications, setModifications] = useState<string[]>([])
    const [modChecklist, setModChecklist] = useState<string[]>([])
    const [safetyFeatures, setSafetyFeatures] = useState<string[]>([])
    const [comfortFeatures, setComfortFeatures] = useState<string[]>([])
    const [newMod, setNewMod] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [accessError, setAccessError] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/dealer/vehicles")
            .then(async r => {
                const d = await r.json()
                if (!r.ok) {
                    setAccessError(d.error || "Access Denied")
                    setHasAccess(false)
                } else {
                    setHasAccess(d.capabilities?.canAddVehicles === true)
                    if (d.capabilities && !d.capabilities.canAddVehicles) {
                        setAccessError("Your active plan does not include vehicle listing permissions.")
                    }
                }
            })
            .catch(() => {
                setAccessError("Network error. Please check your connection.")
                setHasAccess(false)
            })
            .finally(() => setLoading(false))
    }, [])

    const setField = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

    const handleAddMod = () => {
        if (newMod.trim()) {
            setModifications([...modifications, newMod.trim()])
            setNewMod("")
        }
    }

    const removeMod = (idx: number) => {
        setModifications(modifications.filter((_, i) => i !== idx))
    }

    const toggleChecklist = (list: string[], setList: any, item: string) => {
        setList(list.includes(item) ? list.filter(m => m !== item) : [...list, item])
    }

    const imageInputRef = useRef<HTMLInputElement>(null)

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

    const nextStep = () => {
        if (isStepValid(step)) {
            setStep(s => Math.min(s + 1, 7))
            setError(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            setError("Please fill in all required fields to proceed.")
        }
    }
    const prevStep = () => {
        setStep(s => Math.max(s - 1, 0))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const isStepValid = (s: number) => {
        if (s === 1) return form.make && form.model && form.year && form.mileage
        if (s === 3) return form.title && form.price && form.description.length > 20
        if (s === 7) return form.city && form.state
        return true
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            const allMods = [...modifications, ...modChecklist]
            const res = await fetch("/api/dealer/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    vehicleType,
                    year: parseInt(form.year),
                    price: parseFloat(form.price),
                    mileage: form.mileage ? parseInt(form.mileage) : null,
                    engineCC: form.engineCC ? parseInt(form.engineCC) : null,
                    modifications: JSON.stringify(allMods),
                    safetyFeatures: JSON.stringify(safetyFeatures),
                    comfortFeatures: JSON.stringify(comfortFeatures),
                    images: JSON.stringify(images),
                    pdiStatus: form.pdiStatus,
                    pdiType: form.pdiType,
                    pdiFiles: JSON.stringify(form.pdiFiles),
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || "Failed to create vehicle")
                return
            }
            router.push("/dealer/vehicles")
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const calculateQuality = () => {
        let score = 0
        if (form.title) score += 5
        if (form.price) score += 10
        if (form.description.length > 50) score += 10
        if (images.length > 3) score += 15
        if (form.make && form.model) score += 5
        if (safetyFeatures.length > 0) score += 5
        if (comfortFeatures.length > 0) score += 5
        if (form.city && form.state) score += 5
        if (form.registrationNumber) score += 5
        if (form.insuranceCompany) score += 5
        if (form.lastServiceDate) score += 5
        if (form.engineGrade === "A" || form.engineGrade === "B") score += 10
        if (form.tyreLife.includes("New") || form.tyreLife.includes("Excellent")) score += 10
        if (form.accidentFree) score += 5
        return score
    }

    const steps = [
        { id: 1, title: "Vehicle Info", icon: FileText, desc: "Brand & Model" },
        { id: 2, title: "Condition", icon: Activity, desc: "Health & Grades" },
        { id: 3, title: "Pricing", icon: IndianRupee, desc: "Price & Description" },
        { id: 4, title: "Photos", icon: ImageIcon, desc: "Images & Video" },
        { id: 5, title: "Modifications", icon: Wrench, desc: "Upgrades & Parts" },
        { id: 6, title: "Features", icon: Sparkles, desc: "Safety & Comfort" },
        { id: 7, title: "Finalize", icon: MapPin, desc: "Location & Publish" },
    ]

    const accentColor = "#1A2B4A"
    const quality = calculateQuality()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Authenticating Arctic Registry</span>
                </div>
            </div>
        )
    }

    if (hasAccess === false) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center max-w-xl">
                    <div className="w-32 h-32 rounded-[3.5rem] bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-10 shadow-2xl shadow-red-100 border border-red-100">
                        <AlertCircle className="w-14 h-14" />
                    </div>
                    <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tight">ELEVATION REQUIRED</h2>
                    <p className="text-slate-500 mb-12 text-lg leading-relaxed px-10">
                        {accessError || "Your professional credentials do not include listing permissions. Upgrade to an Arctic tier for immediate access."}
                    </p>
                    <Link href="/dealer/packages" className="inline-flex items-center gap-4 bg-blue-600 text-white px-14 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_60px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 group">
                        Upgrade Tier <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        )
    }

    if (step === 0) {
        return (
            <div className="min-h-screen bg-[#0D1117]">
                <div className="max-w-5xl mx-auto py-20 px-6">
                    <div className="flex items-center justify-between mb-14">
                        <Link href="/dealer/vehicles" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-all group">
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Vehicles
                        </Link>
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">New Vehicle Listing</span>
                    </div>

                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-[#F0B429]/10 border border-[#F0B429]/20 text-[#F0B429] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Plus className="w-3.5 h-3.5" /> Add Vehicle
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-4">What type of vehicle?</h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">Select the vehicle category to begin your professional listing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <button
                            type="button"
                            onClick={() => { setVehicleType("CAR"); setStep(1); }}
                            className="group relative bg-[#161B27] border border-white/8 rounded-3xl p-10 text-left transition-all duration-300 hover:border-[#F0B429]/50 hover:bg-[#1A2035] hover:shadow-2xl hover:shadow-[#F0B429]/5 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#1A2B4A] border border-white/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#F0B429] group-hover:border-[#F0B429]">
                                <Car className="w-8 h-8 text-white transition-colors" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Car</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Sedan, SUV, Hatchback, Luxury &amp; more</p>
                            <div className="mt-6 flex items-center gap-2 text-[#F0B429] text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Get Started <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setVehicleType("BIKE"); setStep(1); }}
                            className="group relative bg-[#161B27] border border-white/8 rounded-3xl p-10 text-left transition-all duration-300 hover:border-[#F0B429]/50 hover:bg-[#1A2035] hover:shadow-2xl hover:shadow-[#F0B429]/5 hover:-translate-y-1"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#1A2B4A] border border-white/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#F0B429] group-hover:border-[#F0B429]">
                                <Bike className="w-8 h-8 text-white transition-colors" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Bike / Scooter</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Sport, Classic, Scooter &amp; Moped</p>
                            <div className="mt-6 flex items-center gap-2 text-[#F0B429] text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Get Started <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0D1117] text-slate-900 font-sans">
            {/* Professional Step-by-Step Header */}
            <div className="bg-[#111827]/95 backdrop-blur-sm border-b border-white/6 sticky top-0 z-50 shadow-2xl shadow-black/30">
                <div className="max-w-[1600px] mx-auto px-6 py-0">
                    {/* Top Row */}
                    <div className="flex items-center justify-between py-3 border-b border-white/6">
                        <button onClick={prevStep} className="flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold text-sm transition-all group">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-white/8 text-slate-200 text-xs font-bold uppercase tracking-widest border border-white/10">
                                {vehicleType === "CAR" ? "🚗 Car" : "🏍️ Bike"} Listing
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#F0B429] transition-all duration-700 rounded-full" style={{ width: `${quality}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-slate-300 tabular-nums">{quality}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center py-3 overflow-x-auto scrollbar-none gap-0">
                        {steps.map((s, idx) => {
                            const isCompleted = step > s.id
                            const isCurrent = step === s.id
                            const StepIcon = s.icon
                            return (
                                <div key={s.id} className="flex items-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => isCompleted ? setStep(s.id) : undefined}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isCurrent
                                            ? "bg-[#F0B429] text-[#1A2B4A]"
                                            : isCompleted
                                                ? "text-slate-300 hover:bg-white/8 cursor-pointer"
                                                : "text-slate-600 cursor-default"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isCurrent ? "bg-[#1A2B4A] text-[#F0B429]" :
                                            isCompleted ? "bg-[#059669] text-white" :
                                                "bg-white/10 text-slate-500"
                                            }`}>
                                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className={`text-xs font-bold leading-none ${isCurrent ? "text-[#1A2B4A]" : isCompleted ? "text-slate-300" : "text-slate-600"}`}>{s.title}</p>
                                            <p className={`text-[10px] leading-none mt-0.5 ${isCurrent ? "text-[#1A2B4A]/70" : isCompleted ? "text-slate-500" : "text-slate-700"}`}>{s.desc}</p>
                                        </div>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div className={`w-6 h-px mx-1 shrink-0 ${step > s.id ? "bg-[#059669]/60" : "bg-white/10"}`}></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* LEFT: FORM BOX */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        {/* Step Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold tracking-widest text-[#F0B429] uppercase">Step {step} of 7</span>
                                <div className="h-px w-10 bg-[#F0B429]/40"></div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                {steps[step - 1].title}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">{steps[step - 1].desc}</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-4 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border border-white/5">
                            {/* STEP 1: IDENTITY */}
                            {step === 1 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Make / Brand</label>
                                        <div className="relative">
                                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-10 py-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#1A2B4A] focus:ring-2 focus:ring-[#1A2B4A]/10 transition-all outline-none appearance-none cursor-pointer"
                                                value={form.make}
                                                onChange={(e) => { setField("make", e.target.value); setField("model", ""); }}
                                            >
                                                <option value="">Select Manufacturer</option>
                                                {Object.keys(vehicleType === "CAR" ? CAR_BRANDS : BIKE_BRANDS).map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Model</label>
                                        <div className="relative">
                                            <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50"
                                                value={form.model}
                                                onChange={(e) => setField("model", e.target.value)}
                                                disabled={!form.make}
                                            >
                                                <option value="">Select Variant</option>
                                                {form.make && (vehicleType === "CAR" ? (CAR_BRANDS as any)[form.make] : (BIKE_BRANDS as any)[form.make]).map((m: string) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                                                value={form.year}
                                                onChange={(e) => setField("year", e.target.value)}
                                            >
                                                {Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i).map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Odometer (KM)</label>
                                        <div className="relative">
                                            <Gauge className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="number"
                                                placeholder="Total Distance Covered"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                value={form.mileage}
                                                onChange={(e) => setField("mileage", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Body Type</label>
                                        <div className="relative">
                                            <Car className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                                                value={form.bodyType}
                                                onChange={(e) => setField("bodyType", e.target.value)}
                                            >
                                                {BODY_TYPES.map(bt => (
                                                    <option key={bt} value={bt}>{bt}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Seating Capacity</label>
                                        <div className="relative">
                                            <Eye className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                                                value={form.seatingCapacity}
                                                onChange={(e) => setField("seatingCapacity", e.target.value)}
                                            >
                                                {SEATING_CAPACITIES.map(sc => (
                                                    <option key={sc} value={sc}>{sc} Seater</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Drive Type</label>
                                        <div className="relative">
                                            <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                                                value={form.driveType}
                                                onChange={(e) => setField("driveType", e.target.value)}
                                            >
                                                {DRIVE_TYPES.map(dt => (
                                                    <option key={dt} value={dt}>{dt}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:col-span-2 mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px shrink-0 w-8 bg-slate-200"></div>
                                            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Transmission Type</label>
                                            <div className="h-px grow bg-slate-200"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            {TRANSMISSIONS.map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setField("transmission", t)}
                                                    className={`py-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 ${form.transmission === t
                                                        ? "bg-white border-[#1A2B4A] shadow-lg scale-[1.02]"
                                                        : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${form.transmission === t ? "bg-[#1A2B4A] text-white" : "bg-white border border-slate-100 shadow-sm"}`}>
                                                        <Activity className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${form.transmission === t ? "text-[#1A2B4A]" : "text-slate-400"}`}>{t}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* STEP 2: CONDITION - MECHANICAL PULSE */}
                            {step === 2 ? (
                                <div className="space-y-12">
                                    {/* Grading Matrix */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-[#1A2B4A]" />
                                            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Condition Grades</label>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: "Engine", field: "engineGrade" },
                                                { label: "Transmission", field: "transmissionGrade" },
                                                { label: "Exterior", field: "exteriorGrade" },
                                                { label: "Interior", field: "interiorGrade" }
                                            ].map((grade) => (
                                                <div key={grade.field} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 transition-all hover:bg-white hover:shadow-xl group">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{grade.label}</p>
                                                    <div className="flex justify-between gap-1">
                                                        {CONDITION_GRADES.map(g => (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() => setField(grade.field, g)}
                                                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${form[grade.field as keyof typeof form] === g
                                                                    ? "bg-[#1A2B4A] text-white scale-110 shadow-md"
                                                                    : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-100"
                                                                    }`}
                                                            >
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hardware Pulse */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#1A2B4A]/10 flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-[#1A2B4A]" />
                                                </div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Mechanical Health</h3>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Tyre Life</label>
                                                    <select
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                        value={form.tyreLife}
                                                        onChange={(e) => setField("tyreLife", e.target.value)}
                                                    >
                                                        {TYRE_LIFE.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Battery Health</label>
                                                    <select
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                        value={form.batteryStatus}
                                                        onChange={(e) => setField("batteryStatus", e.target.value)}
                                                    >
                                                        {BATTERY_STATUS.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Wrench className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Service Blueprint</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Service KM</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                        placeholder="e.g. 45000"
                                                        value={form.lastServiceKM}
                                                        onChange={(e) => setField("lastServiceKM", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Count</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                        placeholder="e.g. 5"
                                                        value={form.serviceCount}
                                                        onChange={(e) => setField("serviceCount", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Authorized Terminal</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                    placeholder="e.g. Maruti Service, Oct 2024"
                                                    value={form.lastServiceDate}
                                                    onChange={(e) => setField("lastServiceDate", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security & Health */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <button
                                            type="button"
                                            onClick={() => setField("accidentFree", !form.accidentFree)}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${form.accidentFree ? "bg-blue-50/50 border-blue-600 shadow-md" : "bg-white border-slate-100 text-slate-400"}`}
                                        >
                                            <Shield className={`w-6 h-6 ${form.accidentFree ? "text-blue-600" : ""}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Accident Free</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setField("floodAffected", !form.floodAffected)}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${form.floodAffected ? "bg-red-50/50 border-red-600 shadow-md" : "bg-white border-slate-100 text-slate-400"}`}
                                        >
                                            <Zap className={`w-6 h-6 ${form.floodAffected ? "text-red-600" : ""}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Flood Affected</span>
                                        </button>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spare Keys</span>
                                            <div className="flex gap-2">
                                                {YES_NO.map(y => (
                                                    <button
                                                        key={y}
                                                        type="button"
                                                        onClick={() => setField("spareKey", y)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${form.spareKey === y ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}
                                                    >
                                                        {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PDI SECTION */}
                                    <div className="mt-12 pt-12 border-t border-slate-100">
                                        <PDIUploadSection
                                            pdiStatus={form.pdiStatus}
                                            pdiType={form.pdiType}
                                            pdiFiles={form.pdiFiles}
                                            onChange={(data) => {
                                                if (data.pdiStatus !== undefined) setField("pdiStatus", data.pdiStatus)
                                                if (data.pdiType !== undefined) setField("pdiType", data.pdiType)
                                                if (data.pdiFiles !== undefined) setField("pdiFiles", data.pdiFiles)
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}


                            {/* STEP 3: PRICING */}
                            {step === 3 ? (
                                <div className="space-y-12 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Marketplace Title</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-10 py-7 text-3xl font-black focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900"
                                            placeholder="e.g. 2024 Premium Edition Swift ZXi+"
                                            value={form.title}
                                            onChange={(e) => setField("title", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Commercial Valuation (INR)</label>
                                        <div className="relative group">
                                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-5xl font-black text-slate-300 group-focus-within:text-blue-600 transition-all select-none">₹</div>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[3.5rem] pl-24 pr-12 py-12 text-7xl font-black focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none tracking-tighter text-slate-900 tabular-nums"
                                                placeholder="0"
                                                value={form.price}
                                                onChange={(e) => setField("price", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 px-6">
                                            <Info className="w-3.5 h-3.5 text-blue-500" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Market value intelligence active</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Professional Listing Narrative</label>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${form.description.length > 50 ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>
                                                {form.description.length} / 50 MIN
                                            </span>
                                        </div>
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-10 py-10 text-base font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none h-[300px] leading-[1.8]"
                                            placeholder="Compose a compelling cinematic description of the vehicle's heritage, maintenance record, and driving dynamics..."
                                            value={form.description}
                                            onChange={(e) => setField("description", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {/* STEP 4: MEDIA */}
                            {step === 4 ? (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Digital Asset Registry</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">ULTRA-HIGH RESOLUTION IMAGERY</p>
                                            </div>
                                            <div className="px-5 py-2 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                {images.length} / 10 ASSETS
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-8">
                                            <input type="file" hidden multiple accept="image/*" ref={imageInputRef} onChange={handleFileChange} />
                                            <button
                                                type="button"
                                                onClick={() => imageInputRef.current?.click()}
                                                className="aspect-[4/3] rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 transition-all hover:bg-blue-50/50 hover:border-blue-300 group active:scale-95"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-blue-600">Add Asset</span>
                                            </button>
                                            {images.map((img, idx) => (
                                                <div key={idx} className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative group border-4 border-white shadow-xl transition-all hover:scale-105 hover:z-10 bg-slate-50">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                            className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 hover:bg-red-700"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Cinematic Video URL</label>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100">Optional Track</span>
                                        </div>
                                        <div className="relative group">
                                            <Video className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-all" />
                                            <input
                                                type="url"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] pl-16 pr-10 py-7 text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={form.videoUrl}
                                                onChange={(e) => setField("videoUrl", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* STEP 5: REGISTRY - EXTRA PARTS */}
                            {step === 5 ? (
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Wrench className="w-5 h-5 text-blue-600" />
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Modification Registry</label>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {MOD_LIBRARY.map((mod) => (
                                                <button
                                                    key={mod.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = form.modifications;
                                                        setField("modifications", current.includes(mod.label) ? current.filter(m => m !== mod.label) : [...current, mod.label]);
                                                    }}
                                                    className={`p-6 rounded-3xl border-2 transition-all text-left group ${form.modifications.includes(mod.label) ? "bg-white border-blue-600 shadow-lg scale-[1.02]" : "bg-slate-50/50 border-slate-100 text-slate-400 hover:border-slate-200"}`}
                                                >
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">{mod.category}</p>
                                                    <p className={`text-[11px] font-bold ${form.modifications.includes(mod.label) ? "text-blue-600" : ""}`}>{mod.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Bespoke Upgrades (Custom)</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                className="grow bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                                placeholder="e.g. Stage 1 Remap, Custom Paint"
                                                value={newMod}
                                                onChange={(e) => setNewMod(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newMod.trim()) {
                                                        setField("modifications", [...form.modifications, newMod.trim()]);
                                                        setNewMod("");
                                                    }
                                                }}
                                                className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                                            >
                                                Add Item
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {form.modifications.filter(m => !MOD_LIBRARY.some(lib => lib.label === m)).map((m, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white border border-blue-100 pl-4 pr-2 py-2 rounded-xl">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{m}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setField("modifications", form.modifications.filter(x => x !== m))}
                                                        className="w-6 h-6 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* STEP 6: FEATURES */}
                            {step === 6 ? (
                                <div className="space-y-16">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 underline decoration-blue-100 decoration-4 underline-offset-8">Safety Integrity Registry</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            {SAFETY_FEATURES.map(f => (
                                                <button
                                                    key={f}
                                                    type="button"
                                                    onClick={() => toggleChecklist(safetyFeatures, setSafetyFeatures, f)}
                                                    className={`px-8 py-5 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center justify-between group ${safetyFeatures.includes(f)
                                                        ? "bg-white border-blue-600 shadow-xl scale-[1.02]"
                                                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${safetyFeatures.includes(f) ? "text-blue-600" : ""}`}>{f}</span>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${safetyFeatures.includes(f) ? "border-blue-600 bg-blue-600" : "border-slate-200"}`}>
                                                        {safetyFeatures.includes(f) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 underline decoration-blue-100 decoration-4 underline-offset-8">Comfort & Luxury Systems</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            {COMFORT_FEATURES.map(f => (
                                                <button
                                                    key={f}
                                                    type="button"
                                                    onClick={() => toggleChecklist(comfortFeatures, setComfortFeatures, f)}
                                                    className={`px-8 py-5 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center justify-between group ${comfortFeatures.includes(f)
                                                        ? "bg-white border-blue-600 shadow-xl scale-[1.02]"
                                                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${comfortFeatures.includes(f) ? "text-blue-600" : ""}`}>{f}</span>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${comfortFeatures.includes(f) ? "border-blue-600 bg-blue-600" : "border-slate-200"}`}>
                                                        {comfortFeatures.includes(f) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* STEP 7: FINALIZE */}
                            {step === 7 ? (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:bg-white focus:border-[#1A2B4A] transition-all outline-none"
                                                    placeholder="e.g. Mumbai"
                                                    value={form.city}
                                                    onChange={(e) => setField("city", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">State</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:bg-white focus:border-[#1A2B4A] transition-all outline-none"
                                                    placeholder="e.g. Maharashtra"
                                                    value={form.state}
                                                    onChange={(e) => setField("state", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-8 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-[#1A2B4A]" />
                                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Documents</label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Insurance Company</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                                    placeholder="e.g. Tata AIG"
                                                    value={form.insuranceCompany}
                                                    onChange={(e) => setField("insuranceCompany", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Policy Expiry</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                                    placeholder="e.g. Dec 2026"
                                                    value={form.insuranceExpiry}
                                                    onChange={(e) => setField("insuranceExpiry", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-3 md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">RTO Hub Location</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                                    placeholder="e.g. MH-01 (South Mumbai)"
                                                    value={form.rtoLocation}
                                                    onChange={(e) => setField("rtoLocation", e.target.value)}
                                                />
                                            </div>
                                            {/* RC Available */}
                                            <div className="space-y-3 md:col-span-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">RC (Registration Certificate) Available?</label>
                                                <div className="flex gap-4">
                                                    {["Yes", "No"].map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setField("rcAvailable", opt)}
                                                            className={`flex-1 py-5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${form.rcAvailable === opt
                                                                ? opt === "Yes"
                                                                    ? "bg-green-50 border-green-500 text-green-700 shadow-lg shadow-green-500/10"
                                                                    : "bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-500/10"
                                                                : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"}`}
                                                        >
                                                            <span className={`w-3 h-3 rounded-full ${form.rcAvailable === opt ? (opt === "Yes" ? "bg-green-500" : "bg-red-500") : "bg-slate-300"}`}></span>
                                                            {opt === "Yes" ? "✓ RC Available" : "✗ RC Not Available"}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium ml-1">Indicate whether the original Registration Certificate is available with the vehicle.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                        <div className="bg-[#1A2B4A] rounded-2xl p-8 text-white relative overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-300">Listing Status</h4>
                                                    <p className="text-lg font-bold">Set Visibility</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {["DRAFT", "PUBLISHED"].map(s => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setField("status", s)}
                                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === s
                                                                ? (s === "PUBLISHED" ? "bg-[#059669] text-white shadow-lg" : "bg-white/20 text-white border border-white/30")
                                                                : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                                                                }`}
                                                        >
                                                            {s === "PUBLISHED" ? "Live" : "Draft"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#F0B429]">Featured</h4>
                                                <p className="text-lg font-bold text-[#1A2B4A]">Featured Listing</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setField("isFeatured", !form.isFeatured)}
                                                className={`w-16 h-8 rounded-full transition-all relative ${form.isFeatured ? "bg-[#F0B429]" : "bg-slate-100"}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${form.isFeatured ? "left-9" : "left-1"}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Footer Navigation */}
                            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 text-sm font-semibold text-slate-500 hover:text-[#1A2B4A] transition-all flex items-center gap-2 group rounded-xl hover:bg-slate-50"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Previous
                                </button>

                                <div className="flex items-center gap-3">
                                    {step < 7 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-8 py-3 bg-[#1A2B4A] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#253D6A] hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
                                        >
                                            Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleSubmit()}
                                            disabled={submitting}
                                            className="px-10 py-3.5 bg-[#059669] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#047857] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" /> Publish Listing
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: LIVE PREVIEW */}
                    <div className="hidden xl:block xl:col-span-5 sticky top-[120px] h-[calc(100vh-140px)] overflow-y-auto">
                        <div className="space-y-6 pl-6 border-l border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Preview</h3>
                            </div>

                            <div className="relative group">

                                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-xl">
                                    {/* Card Image Area */}
                                    <div className="aspect-[16/11] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                        {images.length > 0 ? (
                                            <>
                                                <img src={images[0]} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80"></div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-6 text-slate-300">
                                                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
                                                    <ImageIcon className="w-10 h-10 stroke-[1.5px] animate-pulse" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Awaiting Assets</span>
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            {form.isFeatured && (
                                                <div className="px-3 py-1.5 rounded-xl bg-[#F0B429] text-white text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                                                    <Star className="w-3.5 h-3.5 fill-white" /> Featured
                                                </div>
                                            )}
                                            <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur text-white text-[10px] font-bold border border-white/40">
                                                Verified Listing
                                            </div>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                                            <div className="space-y-1">
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#F0B429]">{form.make || "Brand"}</span>
                                                <h4 className="text-3xl font-black uppercase tracking-tight leading-none">{form.model || "Model"}</h4>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <span className="text-[10px] font-semibold text-white/60">Price</span>
                                                <h4 className="text-2xl font-black tabular-nums text-white">
                                                    {form.price ? `₹${parseFloat(form.price).toLocaleString('en-IN')}` : "₹—"}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata Grid */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-3 gap-4 mb-6 border-b border-slate-100 pb-6">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Year</span>
                                                <p className="text-lg font-black text-[#1A2B4A]">{form.year}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">KM</span>
                                                <p className="text-lg font-black text-[#1A2B4A]">{form.mileage || "0"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Fuel</span>
                                                <p className="text-lg font-black text-[#1A2B4A]">{form.fuelType}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Body</span>
                                                    <p className="text-xs font-bold text-[#1A2B4A]">{form.bodyType}</p>
                                                </div>
                                                <Car className="w-4 h-4 text-[#1A2B4A]/40" />
                                            </div>
                                            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Seats</span>
                                                    <p className="text-xs font-bold text-[#1A2B4A]">{form.seatingCapacity} Seater</p>
                                                </div>
                                                <Eye className="w-4 h-4 text-[#1A2B4A]/40" />
                                            </div>
                                            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Drive</span>
                                                    <p className="text-xs font-bold text-[#1A2B4A]">{form.driveType}</p>
                                                </div>
                                                <Zap className="w-4 h-4 text-[#1A2B4A]/40" />
                                            </div>
                                            {(form.insuranceCompany || form.rtoLocation) && (
                                                <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[9px] font-semibold text-green-500 uppercase tracking-widest block">Docs</span>
                                                        <p className="text-xs font-bold text-green-700">Verified</p>
                                                    </div>
                                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Condition Grades Mini Widget */}
                                        <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Condition Grades</span>
                                                <span className="text-[10px] font-bold text-[#1A2B4A] uppercase">{form.engineGrade} Grade</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {["Engine", "Trans", "Ext", "Int"].map((pulse) => (
                                                    <div key={pulse} className="flex-1 space-y-1">
                                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#1A2B4A] transition-all duration-700 rounded-full"
                                                                style={{ width: form[`${pulse.toLowerCase() === 'trans' ? 'transmission' : pulse.toLowerCase()}Grade` as keyof typeof form] === 'A' ? '100%' : '65%' }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase block text-center">{pulse}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                                    <MapPin className="w-5 h-5 text-[#1A2B4A]" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-semibold text-slate-400 block">Location</span>
                                                    <p className="text-sm font-bold text-[#1A2B4A]">{form.city || "City"}, {form.state || "State"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Tips */}
                                    <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#F0B429] flex items-center justify-center shrink-0">
                                                <Info className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Pro Tip</h5>
                                                <p className="text-sm text-amber-800 leading-relaxed">
                                                    {step === 1 && "Verified configurations get 4× more buyer engagement."}
                                                    {step === 2 && "Detailed condition info builds buyer trust and sells faster."}
                                                    {step === 3 && "Competitive pricing and a clear description drive more inquiries."}
                                                    {step === 4 && "Clear, well-lit photos are the #1 trust factor for buyers."}
                                                    {step === 5 && "Listing modifications accurately can justify a higher price."}
                                                    {step === 6 && "Highlighting safety & comfort features attracts serious buyers."}
                                                    {step === 7 && "Featured listings get priority placement and more visibility."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </main >
        </div >
    )
}
