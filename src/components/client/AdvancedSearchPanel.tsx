"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search,
    ChevronDown,
    Filter,
    X,
    SlidersHorizontal,
    Car,
    MapPin,
    Fuel,
    Gauge,
    Calendar,
    Zap,
    DollarSign,
    RotateCcw,
    ChevronUp,
    Sparkles,
} from "lucide-react"

interface FilterOptions {
    makes: string[]
    modelsByMake: Record<string, string[]>
    years: number[]
    fuelTypes: string[]
    transmissions: string[]
    cities: string[]
    conditions: string[]
}

interface Filters {
    make: string
    model: string
    minPrice: string
    maxPrice: string
    minYear: string
    maxYear: string
    fuelType: string
    transmission: string
    condition: string
    city: string
    minMileage: string
    maxMileage: string
}

interface AdvancedSearchPanelProps {
    onSearch: (filters: Filters) => void
    initialFilters?: Partial<Filters>
}

const emptyFilters: Filters = {
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    fuelType: "",
    transmission: "",
    condition: "",
    city: "",
    minMileage: "",
    maxMileage: "",
}

const PRICE_OPTIONS = [
    { v: "50000", l: "₹50K" },
    { v: "100000", l: "₹1 Lakh" },
    { v: "200000", l: "₹2 Lakh" },
    { v: "300000", l: "₹3 Lakh" },
    { v: "500000", l: "₹5 Lakh" },
    { v: "700000", l: "₹7 Lakh" },
    { v: "1000000", l: "₹10 Lakh" },
    { v: "1500000", l: "₹15 Lakh" },
    { v: "2000000", l: "₹20 Lakh" },
    { v: "3000000", l: "₹30 Lakh" },
    { v: "5000000", l: "₹50 Lakh" },
    { v: "10000000", l: "₹1 Cr" },
]

const MILEAGE_OPTIONS = [
    { v: "5000", l: "5,000 km" },
    { v: "10000", l: "10,000 km" },
    { v: "20000", l: "20,000 km" },
    { v: "30000", l: "30,000 km" },
    { v: "50000", l: "50,000 km" },
    { v: "75000", l: "75,000 km" },
    { v: "100000", l: "1,00,000 km" },
    { v: "150000", l: "1,50,000 km" },
]

export default function AdvancedSearchPanel({ onSearch, initialFilters }: AdvancedSearchPanelProps) {
    const [filters, setFilters] = useState<Filters>({ ...emptyFilters, ...initialFilters })
    const [options, setOptions] = useState<FilterOptions | null>(null)
    const [showMore, setShowMore] = useState(false)
    const [loadingOptions, setLoadingOptions] = useState(true)

    // Fetch filter options on mount
    useEffect(() => {
        fetch("/api/vehicles/filters")
            .then(r => r.json())
            .then(data => setOptions(data))
            .catch(() => { })
            .finally(() => setLoadingOptions(false))
    }, [])

    const handleChange = useCallback((key: keyof Filters, value: string) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value }
            // Reset model when brand changes
            if (key === "make") next.model = ""
            return next
        })
    }, [])

    const activeCount = Object.values(filters).filter(v => v !== "").length

    const handleClear = useCallback(() => {
        setFilters({ ...emptyFilters })
        onSearch({ ...emptyFilters })
    }, [onSearch])

    const handleSearch = useCallback(() => {
        onSearch(filters)
    }, [filters, onSearch])

    // Available models based on selected make
    const availableModels = filters.make && options?.modelsByMake
        ? options.modelsByMake[filters.make] || []
        : []

    return (
        <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden transition-all duration-500">

            {/* ─── Row 1: Primary Filters ─── */}
            <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                    {/* Brand */}
                    <FilterSelect
                        icon={<Car className="w-4 h-4" />}
                        label="Brand"
                        value={filters.make}
                        onChange={v => handleChange("make", v)}
                        options={options?.makes.map(m => ({ v: m, l: m })) || []}
                        loading={loadingOptions}
                    />

                    {/* Model */}
                    <FilterSelect
                        icon={<Sparkles className="w-4 h-4" />}
                        label="Model"
                        value={filters.model}
                        onChange={v => handleChange("model", v)}
                        options={availableModels.map(m => ({ v: m, l: m }))}
                        disabled={!filters.make}
                        loading={loadingOptions}
                    />

                    {/* Min Price */}
                    <FilterSelect
                        icon={<DollarSign className="w-4 h-4" />}
                        label="Min Price"
                        value={filters.minPrice}
                        onChange={v => handleChange("minPrice", v)}
                        options={PRICE_OPTIONS}
                    />

                    {/* Max Price */}
                    <FilterSelect
                        icon={<DollarSign className="w-4 h-4" />}
                        label="Max Price"
                        value={filters.maxPrice}
                        onChange={v => handleChange("maxPrice", v)}
                        options={PRICE_OPTIONS}
                    />
                </div>
            </div>

            {/* ─── Row 2: Extended Filters (collapsible on mobile) ─── */}
            <div className={`
                border-t border-zinc-100 overflow-hidden transition-all duration-500 ease-in-out
                ${showMore ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[600px] md:opacity-100'}
            `}>
                <div className="p-4 md:p-5 pt-3 md:pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                        {/* Year */}
                        <FilterSelect
                            icon={<Calendar className="w-4 h-4" />}
                            label="Year"
                            value={filters.minYear}
                            onChange={v => handleChange("minYear", v)}
                            options={options?.years.map(y => ({ v: String(y), l: String(y) })) || []}
                            loading={loadingOptions}
                        />

                        {/* Fuel Type */}
                        <FilterSelect
                            icon={<Fuel className="w-4 h-4" />}
                            label="Fuel Type"
                            value={filters.fuelType}
                            onChange={v => handleChange("fuelType", v)}
                            options={options?.fuelTypes.map(f => ({ v: f, l: f })) || []}
                            loading={loadingOptions}
                        />

                        {/* Transmission */}
                        <FilterSelect
                            icon={<Zap className="w-4 h-4" />}
                            label="Transmission"
                            value={filters.transmission}
                            onChange={v => handleChange("transmission", v)}
                            options={options?.transmissions.map(t => ({ v: t, l: t })) || []}
                            loading={loadingOptions}
                        />

                        {/* Condition */}
                        <FilterSelect
                            icon={<SlidersHorizontal className="w-4 h-4" />}
                            label="Condition"
                            value={filters.condition}
                            onChange={v => handleChange("condition", v)}
                            options={[
                                { v: "New", l: "New" },
                                { v: "Used", l: "Used" },
                            ]}
                        />

                        {/* Location */}
                        <FilterSelect
                            icon={<MapPin className="w-4 h-4" />}
                            label="Location"
                            value={filters.city}
                            onChange={v => handleChange("city", v)}
                            options={options?.cities.map(c => ({ v: c, l: c })) || []}
                            loading={loadingOptions}
                        />
                    </div>

                    {/* Mileage Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
                        <FilterSelect
                            icon={<Gauge className="w-4 h-4" />}
                            label="Min Mileage"
                            value={filters.minMileage}
                            onChange={v => handleChange("minMileage", v)}
                            options={MILEAGE_OPTIONS}
                        />
                        <FilterSelect
                            icon={<Gauge className="w-4 h-4" />}
                            label="Max Mileage"
                            value={filters.maxMileage}
                            onChange={v => handleChange("maxMileage", v)}
                            options={MILEAGE_OPTIONS}
                        />
                    </div>
                </div>
            </div>

            {/* ─── Action Row ─── */}
            <div className="border-t border-zinc-100 px-4 md:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

                {/* Mobile: More Filters Toggle */}
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex md:hidden items-center justify-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-900 transition-colors py-2"
                >
                    {showMore ? (
                        <>
                            <ChevronUp className="w-4 h-4" /> Less Filters
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" /> More Filters
                        </>
                    )}
                </button>

                <div className="flex items-center gap-3 flex-1 sm:flex-none">
                    {/* Clear All */}
                    {activeCount > 0 && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:border-zinc-400 hover:text-zinc-900 transition-all active:scale-[0.97]"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="flex-1 sm:flex-none relative bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2.5 active:scale-[0.97] shadow-lg shadow-zinc-900/10"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Search Inventory
                        {activeCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-zinc-900 text-[9px] font-black flex items-center justify-center shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ────────────────────────────────────────────
   Reusable Custom Select Dropdown
   ──────────────────────────────────────────── */

interface FilterSelectProps {
    icon: React.ReactNode
    label: string
    value: string
    onChange: (value: string) => void
    options: { v: string; l: string }[]
    disabled?: boolean
    loading?: boolean
}

function FilterSelect({ icon, label, value, onChange, options, disabled, loading }: FilterSelectProps) {
    return (
        <div className={`relative group ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-600 transition-colors z-10 pointer-events-none">
                {icon}
            </div>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled || loading}
                className={`
                    w-full appearance-none cursor-pointer
                    bg-zinc-50/60 border border-zinc-100 rounded-2xl
                    py-3.5 pl-11 pr-10
                    text-xs font-semibold
                    ${value ? 'text-zinc-900' : 'text-zinc-400'}
                    hover:bg-white hover:border-zinc-200
                    focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100
                    outline-none transition-all duration-200
                `}
            >
                <option value="">{loading ? "Loading..." : label}</option>
                {options.map(opt => (
                    <option key={opt.v} value={opt.v}>{opt.l}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none group-focus-within:text-zinc-500 transition-colors" />
        </div>
    )
}
