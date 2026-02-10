"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, AlertCircle } from "lucide-react"
import { DamageMarker, DamageType, DamageSeverity, DamageView, VehicleDamageData } from "./pdi-types"

interface VehicleDamageMarkerProps {
    damageData: VehicleDamageData
    onChange: (data: VehicleDamageData) => void
}

const damageTypes: { value: DamageType; label: string; color: string }[] = [
    { value: 'scratch', label: 'Scratch', color: '#fbbf24' },
    { value: 'dent', label: 'Dent', color: '#f97316' },
    { value: 'crack', label: 'Crack', color: '#ef4444' },
    { value: 'chip', label: 'Chip', color: '#a855f7' },
    { value: 'rust', label: 'Rust', color: '#dc2626' },
    { value: 'paint-damage', label: 'Paint Damage', color: '#14b8a6' },
    { value: 'broken', label: 'Broken', color: '#ec4899' },
    { value: 'missing', label: 'Missing Part', color: '#6366f1' },
    { value: 'other', label: 'Other', color: '#64748b' },
]


const vehicleViews: { value: DamageView; label: string; aspectRatio: string; imagePath: string }[] = [
    { value: 'top', label: 'Top View', aspectRatio: '3/5', imagePath: '/pdi/assets/vehicles/top-view.png' },
    { value: 'side', label: 'Side View', aspectRatio: '2/1', imagePath: '/pdi/assets/vehicles/side-view.png' },
    { value: 'interior', label: 'Interior View', aspectRatio: '1/1', imagePath: '/pdi/assets/vehicles/interior-view.jpg' },
    { value: 'boot', label: 'Boot/Luggage', aspectRatio: '8/7', imagePath: '/pdi/assets/vehicles/boot-view.jpg' },
]



export function VehicleDamageMarker({ damageData, onChange }: VehicleDamageMarkerProps) {
    const [selectedView, setSelectedView] = React.useState<DamageView>('top')
    const [selectedType, setSelectedType] = React.useState<DamageType>('scratch')
    const [selectedSeverity, setSelectedSeverity] = React.useState<DamageSeverity>('minor')
    const [editingMarker, setEditingMarker] = React.useState<string | null>(null)
    const viewRefs = React.useRef<{ [key in DamageView]?: HTMLDivElement }>({})

    // Helper to get damage code from type
    const getDamageCode = (type: DamageType): import('./pdi-types').DamageCode => {
        const codeMap: Record<DamageType, import('./pdi-types').DamageCode> = {
            'scratch': 'S',
            'dent': 'D',
            'crack': 'CR',
            'chip': 'CH',
            'rust': 'RS',
            'paint-damage': 'S',
            'broken': 'BR',
            'missing': 'MS',
            'tear': 'TR',
            'stain': 'ST',
            'not-working': 'NW',
            'other': 'OT',
        }
        return codeMap[type]
    }

    const handleViewClick = (e: React.MouseEvent<HTMLDivElement>, view: DamageView) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        const newMarker: DamageMarker = {
            id: `marker-${Date.now()}`,
            x,
            y,
            type: selectedType,
            code: getDamageCode(selectedType),
            severity: selectedSeverity,
            view,
        }

        onChange({
            ...damageData,
            markers: [...damageData.markers, newMarker],
        })
    }

    const removeMarker = (markerId: string) => {
        onChange({
            ...damageData,
            markers: damageData.markers.filter(m => m.id !== markerId),
        })
    }

    const updateMarkerDescription = (markerId: string, description: string) => {
        onChange({
            ...damageData,
            markers: damageData.markers.map(m =>
                m.id === markerId ? { ...m, description } : m
            ),
        })
    }

    const getMarkerColor = (type: DamageType) => {
        return damageTypes.find(dt => dt.value === type)?.color || '#64748b'
    }

    const currentViewMarkers = damageData.markers.filter(m => m.view === selectedView)

    return (
        <Card className="bg-white/[0.02] border-white/[0.05] rounded-none backdrop-blur-sm overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 transition-all duration-500 group-hover:w-2" />
            <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                    Vehicle Damage Marking
                </CardTitle>
                <CardDescription className="text-gray-500 text-xs">
                    Click on vehicle diagrams to mark any damages or defects
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
                {/* Damage Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Damage Type
                        </Label>
                        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DamageType)}>
                            <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-none text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {damageTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                            {type.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Severity
                        </Label>
                        <Select value={selectedSeverity} onValueChange={(value) => setSelectedSeverity(value as DamageSeverity)}>
                            <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 rounded-none text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="minor">Minor</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="major">Major</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-2 border-b border-white/10">
                    {vehicleViews.map((view) => (
                        <button
                            key={view.value}
                            type="button"
                            onClick={() => setSelectedView(view.value)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedView === view.value
                                ? 'text-red-500 border-b-2 border-red-500'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>

                {/* Vehicle Diagram */}
                <div className="relative">
                    <div
                        ref={(el) => {
                            if (el) viewRefs.current[selectedView] = el
                        }}
                        onClick={(e) => handleViewClick(e, selectedView)}
                        className="relative bg-white/[0.05] border-2 border-dashed border-white/20 cursor-crosshair hover:border-red-500/50 transition-colors overflow-hidden mx-auto"
                        style={{
                            aspectRatio: vehicleViews.find(v => v.value === selectedView)?.aspectRatio,
                            minHeight: '300px',
                            maxHeight: '500px',
                            maxWidth: '800px',
                            width: '100%',
                        }}
                    >
                        {/* Vehicle Diagram Image */}
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={vehicleViews.find(v => v.value === selectedView)?.imagePath}
                                alt={`${selectedView} view of vehicle`}
                                className="w-full h-full object-contain pointer-events-none"
                            />
                        </div>


                        {/* Damage Markers */}
                        {currentViewMarkers.map((marker) => (
                            <div
                                key={marker.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                                style={{
                                    left: `${marker.x}%`,
                                    top: `${marker.y}%`,
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center cursor-pointer hover:scale-125 transition-transform shadow-lg"
                                    style={{ backgroundColor: getMarkerColor(marker.type) }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingMarker(marker.id)
                                    }}
                                >
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeMarker(marker.id)
                                    }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/marker:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Marker Info */}
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Selected: <span className="font-bold" style={{ color: getMarkerColor(selectedType) }}>
                            {damageTypes.find(dt => dt.value === selectedType)?.label}
                        </span>
                        ({selectedSeverity})
                    </div>
                </div>

                {/* Markers List */}
                {damageData.markers.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Damage List ({damageData.markers.length})
                        </Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {damageData.markers.map((marker) => (
                                <div
                                    key={marker.id}
                                    className="bg-white/[0.03] border border-white/10 p-3 rounded space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getMarkerColor(marker.type) }}
                                            />
                                            <span className="text-xs font-bold text-white">
                                                {damageTypes.find(dt => dt.value === marker.type)?.label}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase">
                                                {marker.view} ({marker.severity})
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeMarker(marker.id)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {editingMarker === marker.id && (
                                        <Input
                                            placeholder="Add description..."
                                            value={marker.description || ''}
                                            onChange={(e) => updateMarkerDescription(marker.id, e.target.value)}
                                            onBlur={() => setEditingMarker(null)}
                                            className="h-8 bg-white/[0.05] border-white/10 rounded text-white text-xs"
                                            autoFocus
                                        />
                                    )}
                                    {marker.description && editingMarker !== marker.id && (
                                        <p
                                            className="text-xs text-gray-400 cursor-pointer hover:text-white"
                                            onClick={() => setEditingMarker(marker.id)}
                                        >
                                            {marker.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}
