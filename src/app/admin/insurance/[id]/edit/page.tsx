'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save, User, Upload, Plus, X
} from "lucide-react"

const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Truck', 'Two Wheeler', 'Three Wheeler', 'Other']
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Petrol + CNG', 'Petrol + LPG']
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'iMT']
const USAGE_TYPES = ['Personal', 'Commercial', 'Taxi', 'Fleet', 'Rental']
const CLAIM_TYPES = ['Accident', 'Theft', 'Natural Disaster', 'Third Party', 'Fire', 'Vandalism', 'Own Damage', 'Hit and Run', 'Other']
const CLAIM_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'COMPLETED']
const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Not Running']
const ACCIDENT_HISTORY = ['No Previous Accidents', '1 Previous Accident', '2+ Previous Accidents', 'Unknown']
const INSURANCE_COMPANIES = [
    'ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'New India Assurance',
    'National Insurance', 'United India Insurance', 'Oriental Insurance',
    'Tata AIG', 'Reliance General', 'SBI General', 'Cholamandalam MS',
    'Royal Sundaram', 'Future Generali', 'Bharti AXA', 'IFFCO Tokio'
]

const DAMAGE_AREAS = [
    'Front Bumper', 'Rear Bumper', 'Left Side', 'Right Side',
    'Roof', 'Hood/Bonnet', 'Trunk/Boot', 'Windshield', 'Rear Glass',
    'Left Headlight', 'Right Headlight', 'Left Tail Light', 'Right Tail Light',
    'Left Door (Front)', 'Left Door (Rear)', 'Right Door (Front)', 'Right Door (Rear)',
    'Left Fender', 'Right Fender', 'Engine', 'Suspension', 'Axle',
    'Wheels/Tyres', 'Interior', 'Electrical System', 'Total Loss'
]

export default function EditClaimPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [customCompany, setCustomCompany] = useState('')
    const [showCustomCompany, setShowCustomCompany] = useState(false)

    const [formData, setFormData] = useState({
        // Vehicle Details
        vehicleMake: '',
        vehicleModel: '',
        vehicleVariant: '',
        vehicleYear: '',
        vehicleType: '',
        fuelType: '',
        transmissionType: '',
        vehicleColor: '',
        registrationNumber: '',
        rcNumber: '',
        registrationDate: '',
        usageType: '',
        odometerReading: '',
        chassisNumber: '',
        engineNumber: '',

        // Insurance Details
        insuranceCompany: '',
        policyNumber: '',
        policyExpiryDate: '',
        claimType: '',
        estimatedClaimAmount: '',
        idvValue: '',
        status: 'SUBMITTED',
        vehicleConditionBefore: '',
        previousAccidentHistory: '',

        // Incident Details
        damageAreas: [] as string[],
        incidentDate: '',
        incidentLocation: '',
        damageDescription: '',

        // Admin Notes
        adminNotes: ''
    })

    const [claimInfo, setClaimInfo] = useState<{
        claimNumber: string
        source: string
        user?: { name: string; email: string; mobile?: string }
    } | null>(null)

    // Fetch existing claim data
    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/admin/insurance-claims/${id}`)
                const data = await response.json()
                if (response.ok) {
                    setClaimInfo({
                        claimNumber: data.claimNumber,
                        source: data.source,
                        user: data.user
                    })

                    // Parse damage areas if stored as JSON string
                    let damageAreas: string[] = []
                    if (data.damageAreas) {
                        try {
                            damageAreas = typeof data.damageAreas === 'string'
                                ? JSON.parse(data.damageAreas)
                                : data.damageAreas
                        } catch { damageAreas = [] }
                    }

                    setFormData({
                        vehicleMake: data.vehicleMake || '',
                        vehicleModel: data.vehicleModel || '',
                        vehicleVariant: data.vehicleVariant || '',
                        vehicleYear: data.vehicleYear || '',
                        vehicleType: data.vehicleType || '',
                        fuelType: data.fuelType || '',
                        transmissionType: data.transmissionType || '',
                        vehicleColor: data.vehicleColor || '',
                        registrationNumber: data.registrationNumber || '',
                        rcNumber: data.rcNumber || '',
                        registrationDate: data.registrationDate ? data.registrationDate.split('T')[0] : '',
                        usageType: data.usageType || '',
                        odometerReading: data.odometerReading?.toString() || '',
                        chassisNumber: data.chassisNumber || '',
                        engineNumber: data.engineNumber || '',
                        insuranceCompany: data.insuranceCompany || '',
                        policyNumber: data.policyNumber || '',
                        policyExpiryDate: data.policyExpiryDate ? data.policyExpiryDate.split('T')[0] : '',
                        claimType: data.claimType || '',
                        estimatedClaimAmount: data.estimatedDamage?.toString() || '',
                        idvValue: data.idvValue?.toString() || '',
                        status: data.status || 'SUBMITTED',
                        vehicleConditionBefore: data.vehicleConditionBefore || '',
                        previousAccidentHistory: data.previousAccidentHistory || '',
                        damageAreas: damageAreas,
                        incidentDate: data.incidentDate ? data.incidentDate.split('T')[0] : '',
                        incidentLocation: data.incidentLocation || '',
                        damageDescription: data.incidentDescription || '',
                        adminNotes: data.adminNotes || ''
                    })

                    // Check if insurance company is custom
                    if (data.insuranceCompany && !INSURANCE_COMPANIES.includes(data.insuranceCompany)) {
                        setShowCustomCompany(true)
                        setCustomCompany(data.insuranceCompany)
                    }
                }
            } catch (error) {
                console.error('Error fetching claim:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchClaim()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleDamageArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            damageAreas: prev.damageAreas.includes(area)
                ? prev.damageAreas.filter(a => a !== area)
                : [...prev.damageAreas, area]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setSaving(true)

            const payload = {
                ...formData,
                insuranceCompany: showCustomCompany ? customCompany : formData.insuranceCompany,
                estimatedDamage: formData.estimatedClaimAmount ? parseFloat(formData.estimatedClaimAmount) : undefined,
                idvValue: formData.idvValue ? parseFloat(formData.idvValue) : undefined,
                odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined,
                incidentDescription: formData.damageDescription,
                damageAreas: JSON.stringify(formData.damageAreas)
            }

            const response = await fetch(`/api/admin/insurance-claims/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (response.ok) {
                alert('Claim updated successfully!')
                router.push(`/admin/insurance/${id}`)
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Error updating claim:', error)
            alert('Failed to update claim')
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#d8d8d8'
    }

    const sectionStyle = {
        backgroundColor: '#111318',
        border: '1px solid rgba(255,255,255,0.07)'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#e8a317' }} />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push(`/admin/insurance/${id}`)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        Edit Claim: {claimInfo?.claimNumber}
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>
                        Customer: {claimInfo?.user?.name} • {claimInfo?.source === 'WALK_IN' ? '🏢 Walk-in' : '🌐 Online'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Vehicle Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Make/Brand *</label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Model *</label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Year</label>
                            <input type="text" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Type</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Fuel Type</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {FUEL_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Transmission</label>
                            <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {TRANSMISSION_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Color</label>
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Number *</label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>RC Number</label>
                            <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Date</label>
                            <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Usage Type</label>
                            <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {USAGE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Odometer (KM)</label>
                            <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Chassis Number *</label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Engine Number *</label>
                            <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                    </div>
                </div>

                {/* Insurance Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <FileCheck className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Insurance Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Insurance Company *</label>
                            {showCustomCompany ? (
                                <div className="flex gap-2">
                                    <input type="text" value={customCompany} onChange={e => setCustomCompany(e.target.value)} className="flex-1 px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                                    <button type="button" onClick={() => { setShowCustomCompany(false); setCustomCompany(''); }} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange} className="flex-1 px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                        <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                        {INSURANCE_COMPANIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#111318' }}>{c}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-lg" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Number *</label>
                            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Expiry Date</label>
                            <input type="date" name="policyExpiryDate" value={formData.policyExpiryDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Claim Type *</label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {CLAIM_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Estimated Amount (₹) *</label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>IDV (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                {CLAIM_STATUSES.map(s => <option key={s} value={s} style={{ backgroundColor: '#111318' }}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Condition</label>
                            <select name="vehicleConditionBefore" value={formData.vehicleConditionBefore} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select --</option>
                                {VEHICLE_CONDITIONS.map(c => <option key={c} value={c} style={{ backgroundColor: '#111318' }}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Incident Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        Incident Details
                    </h3>

                    {/* Damage Areas */}
                    <div className="mb-6">
                        <label className="text-xs uppercase mb-3 block" style={{ color: '#6b7080' }}>Select damage areas:</label>
                        <div className="flex flex-wrap gap-2">
                            {DAMAGE_AREAS.map(area => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => toggleDamageArea(area)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${formData.damageAreas.includes(area) ? 'ring-2 ring-[#e8a317]' : ''}`}
                                    style={{
                                        backgroundColor: formData.damageAreas.includes(area) ? 'rgba(232, 163, 23, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: formData.damageAreas.includes(area) ? '#e8a317' : '#6b7080',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Damage Description *</label>
                        <textarea
                            name="damageDescription"
                            value={formData.damageDescription}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* Admin Notes */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white mb-4">Admin Notes</h3>
                    <textarea
                        name="adminNotes"
                        value={formData.adminNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Internal notes (not visible to customer)..."
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                        style={inputStyle}
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pb-6">
                    <button
                        type="button"
                        onClick={() => router.push(`/admin/insurance/${id}`)}
                        className="px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d8d8d8' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #e8a317, #d49510)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                        }}
                    >
                        {saving ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
