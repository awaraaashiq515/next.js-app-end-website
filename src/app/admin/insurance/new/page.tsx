'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save, User, Upload, Plus, X, Search
} from "lucide-react"

const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Truck', 'Two Wheeler', 'Three Wheeler', 'Other']
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Petrol + CNG', 'Petrol + LPG']
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'iMT']
const USAGE_TYPES = ['Personal', 'Commercial', 'Taxi', 'Fleet', 'Rental']
const CLAIM_TYPES = ['Accident', 'Theft', 'Natural Disaster', 'Third Party', 'Fire', 'Vandalism', 'Own Damage', 'Hit and Run', 'Other']
const CLAIM_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED', 'COMPLETED']
const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Not Running']
const ACCIDENT_HISTORY = ['No Previous Accidents', '1 Previous Accident', '2+ Previous Accidents', 'Unknown']
const POLICY_TYPES = ['Comprehensive', 'Third Party', 'Third Party Fire & Theft', 'Own Damage Only']
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

interface ExistingUser {
    id: string
    name: string
    email: string
    mobile: string
}

export default function NewClaimPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showCustomCompany, setShowCustomCompany] = useState(false)
    const [customCompany, setCustomCompany] = useState('')
    const [translating, setTranslating] = useState(false)

    // User selection
    const [userMode, setUserMode] = useState<'auto' | 'existing'>('auto')
    const [userSearch, setUserSearch] = useState('')
    const [searchingUsers, setSearchingUsers] = useState(false)
    const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null)

    // Translation handler
    const handleTranslate = async () => {
        if (!formData.damageDescription.trim()) {
            alert('Please enter damage description first')
            return
        }

        setTranslating(true)
        try {
            const response = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: formData.damageDescription })
            })

            if (!response.ok) {
                const error = await response.json()
                alert(error.error || 'Translation failed')
                return
            }

            const { translatedText } = await response.json()
            setFormData({ ...formData, damageDescription: translatedText })
            alert('Translation successful!')
        } catch (error) {
            console.error('Translation error:', error)
            alert('Translation failed. Please check AI settings.')
        } finally {
            setTranslating(false)
        }
    }

    // File upload states
    const [damageImageInputs, setDamageImageInputs] = useState<number[]>([1])
    const [firInputs, setFirInputs] = useState<number[]>([1])
    const [additionalInputs, setAdditionalInputs] = useState<number[]>([1])
    // File references for all document types
    const [documentFiles, setDocumentFiles] = useState<{
        damageImages: File[]
        firDocs: File[]
        panFront: File | null
        panBack: File | null
        aadhaarFront: File | null
        aadhaarBack: File | null
        dlFront: File | null
        dlBack: File | null
        insuranceFront: File | null
        insuranceBack: File | null
        bankPassbook: File | null
        rcFront: File | null
        rcBack: File | null
        additional: File[]
    }>({
        damageImages: [],
        firDocs: [],
        panFront: null,
        panBack: null,
        aadhaarFront: null,
        aadhaarBack: null,
        dlFront: null,
        dlBack: null,
        insuranceFront: null,
        insuranceBack: null,
        bankPassbook: null,
        rcFront: null,
        rcBack: null,
        additional: []
    })

    const [formData, setFormData] = useState({
        // Customer Details
        customerName: '',
        customerMobile: '',
        customerEmail: '',
        customerCity: '',

        // Vehicle Details
        vehicleMake: '',
        vehicleModel: '',
        vehicleVariant: '',
        vehicleYear: new Date().getFullYear().toString(),
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
        policyType: '',
        policyStartDate: '',
        policyEndDate: '',
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

    // Calculate vehicle age
    const calculateVehicleAge = () => {
        if (!formData.registrationDate) return '-'
        const regDate = new Date(formData.registrationDate)
        const now = new Date()
        const years = Math.floor((now.getTime() - regDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const months = Math.floor(((now.getTime() - regDate.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
        if (years > 0) return `${years} years ${months} months`
        return `${months} months`
    }

    // Search existing users
    const searchUsers = async () => {
        if (!userSearch.trim()) return
        setSearchingUsers(true)
        try {
            const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}`)
            if (res.ok) {
                const data = await res.json()
                setExistingUsers(data.users || [])
            }
        } catch (error) {
            console.error('Error searching users:', error)
        } finally {
            setSearchingUsers(false)
        }
    }

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

    // Helper function to upload files
    const uploadFiles = async (claimId: string, files: File[], documentType: string) => {
        if (files.length === 0) return

        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        formData.append('documentType', documentType)
        formData.append('claimId', claimId)

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            console.error(`Failed to upload ${documentType}:`, error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        const required = ['vehicleMake', 'vehicleModel', 'registrationNumber', 'chassisNumber',
            'engineNumber', 'insuranceCompany', 'policyNumber', 'claimType', 'estimatedClaimAmount', 'damageDescription']

        if (userMode === 'auto') {
            required.push('customerName', 'customerMobile')
        }

        for (const field of required) {
            if (!formData[field as keyof typeof formData] ||
                (Array.isArray(formData[field as keyof typeof formData]) && (formData[field as keyof typeof formData] as string[]).length === 0)) {
                alert(`Please fill in all required fields. Missing: ${field.replace(/([A-Z])/g, ' $1')}`)
                return
            }
        }

        if (userMode === 'existing' && !selectedUser) {
            alert('Please select an existing user')
            return
        }

        try {
            setLoading(true)
            setUploadProgress(0)

            const payload = {
                ...formData,
                insuranceCompany: showCustomCompany ? customCompany : formData.insuranceCompany,
                userId: userMode === 'existing' ? selectedUser?.id : undefined,
                estimatedDamage: formData.estimatedClaimAmount ? parseFloat(formData.estimatedClaimAmount) : undefined,
                idvValue: formData.idvValue ? parseFloat(formData.idvValue) : undefined,
                odometerReading: formData.odometerReading ? parseInt(formData.odometerReading) : undefined
            }

            // Step 1: Create the claim
            const response = await fetch('/api/admin/insurance-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (!response.ok) {
                alert(`Error: ${data.error}`)
                return
            }

            const claimId = data.claim.id
            setUploadProgress(20)

            // Step 2: Upload all documents
            const totalUploads = 12
            let completedUploads = 0

            const updateProgress = () => {
                completedUploads++
                setUploadProgress(20 + Math.floor((completedUploads / totalUploads) * 80))
            }

            // Upload damage images
            if (documentFiles.damageImages.length > 0) {
                await uploadFiles(claimId, documentFiles.damageImages, 'DAMAGE_PHOTOS')
            }
            updateProgress()

            // Upload FIR documents
            if (documentFiles.firDocs.length > 0) {
                await uploadFiles(claimId, documentFiles.firDocs, 'FIR')
            }
            updateProgress()

            // Upload PAN card
            const panFiles = [documentFiles.panFront, documentFiles.panBack].filter(Boolean) as File[]
            if (panFiles.length > 0) {
                await uploadFiles(claimId, panFiles, 'PAN_CARD')
            }
            updateProgress()

            // Upload Aadhaar card
            const aadhaarFiles = [documentFiles.aadhaarFront, documentFiles.aadhaarBack].filter(Boolean) as File[]
            if (aadhaarFiles.length > 0) {
                await uploadFiles(claimId, aadhaarFiles, 'AADHAAR')
            }
            updateProgress()

            // Upload Driving License
            const dlFiles = [documentFiles.dlFront, documentFiles.dlBack].filter(Boolean) as File[]
            if (dlFiles.length > 0) {
                await uploadFiles(claimId, dlFiles, 'DRIVING_LICENSE')
            }
            updateProgress()

            // Upload Insurance Policy
            const insuranceFiles = [documentFiles.insuranceFront, documentFiles.insuranceBack].filter(Boolean) as File[]
            if (insuranceFiles.length > 0) {
                await uploadFiles(claimId, insuranceFiles, 'POLICY')
            }
            updateProgress()

            // Upload Bank Passbook
            if (documentFiles.bankPassbook) {
                await uploadFiles(claimId, [documentFiles.bankPassbook], 'BANK_PASSBOOK')
            }
            updateProgress()

            // Upload RC
            const rcFiles = [documentFiles.rcFront, documentFiles.rcBack].filter(Boolean) as File[]
            if (rcFiles.length > 0) {
                await uploadFiles(claimId, rcFiles, 'RC_BOOK')
            }
            updateProgress()

            // Upload Additional documents
            if (documentFiles.additional.length > 0) {
                await uploadFiles(claimId, documentFiles.additional, 'OTHER')
            }
            updateProgress()

            setUploadProgress(100)

            const msg = data.newUserCreated
                ? 'Claim created successfully! New customer account created and welcome email sent.'
                : 'Claim created successfully!'
            alert(msg)
            router.push(`/admin/insurance/${claimId}`)
        } catch (error) {
            console.error('Error creating claim:', error)
            alert('Failed to create claim')
        } finally {
            setLoading(false)
            setUploadProgress(0)
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

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/insurance')}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        New Insurance Claim (Walk-in)
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Create a claim for walk-in customer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Selection */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <User className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        User Selection
                    </h3>

                    <div className="flex gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => { setUserMode('auto'); setSelectedUser(null); }}
                            className={`flex-1 p-4 rounded-lg text-left transition-all ${userMode === 'auto' ? 'ring-2 ring-[#e8a317]' : ''}`}
                            style={{ backgroundColor: userMode === 'auto' ? 'rgba(232, 163, 23, 0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <div className="font-medium text-white mb-1">Auto Create New User</div>
                            <div className="text-xs" style={{ color: '#6b7080' }}>A new CRM user will be created automatically if email is provided</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserMode('existing')}
                            className={`flex-1 p-4 rounded-lg text-left transition-all ${userMode === 'existing' ? 'ring-2 ring-[#60a5fa]' : ''}`}
                            style={{ backgroundColor: userMode === 'existing' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <div className="font-medium text-white mb-1">Select Existing User</div>
                            <div className="text-xs" style={{ color: '#6b7080' }}>Link this claim to an existing customer in the system</div>
                        </button>
                    </div>

                    {userMode === 'existing' ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Search by name, email or mobile..."
                                    className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
                                    style={inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={searchUsers}
                                    disabled={searchingUsers}
                                    className="px-4 py-3 rounded-lg font-medium"
                                    style={{ backgroundColor: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
                                >
                                    {searchingUsers ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                </button>
                            </div>

                            {selectedUser && (
                                <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                                    <div>
                                        <div className="font-medium text-white">{selectedUser.name}</div>
                                        <div className="text-xs" style={{ color: '#6b7080' }}>{selectedUser.email} • {selectedUser.mobile}</div>
                                    </div>
                                    <button type="button" onClick={() => setSelectedUser(null)} className="p-1 rounded hover:bg-white/10">
                                        <X className="w-4 h-4" style={{ color: '#f87171' }} />
                                    </button>
                                </div>
                            )}

                            {existingUsers.length > 0 && !selectedUser && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {existingUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full p-3 rounded-lg text-left hover:bg-white/5 transition-colors"
                                            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <div className="font-medium text-white">{user.name}</div>
                                            <div className="text-xs" style={{ color: '#6b7080' }}>{user.email} • {user.mobile}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Customer Name *</label>
                                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                            </div>
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Phone Number *</label>
                                <input type="tel" name="customerMobile" value={formData.customerMobile} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                            </div>
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Email</label>
                                <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>City</label>
                                <input type="text" name="customerCity" value={formData.customerCity} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Vehicle Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Vehicle Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Make/Brand *</label>
                            <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Honda, Maruti" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Model *</label>
                            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. City, Swift" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Model Variant</label>
                            <input type="text" name="vehicleVariant" value={formData.vehicleVariant} onChange={handleChange} placeholder="e.g. VXi, ZXi Plus" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Manufacturing Year</label>
                            <input type="text" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Type *</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Type --</option>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Fuel Type *</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Fuel Type --</option>
                                {FUEL_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Transmission Type</label>
                            <select name="transmissionType" value={formData.transmissionType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Transmission --</option>
                                {TRANSMISSION_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Color</label>
                            <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="e.g. White, Black" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Number *</label>
                            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. MH12AB1234" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>RC Number</label>
                            <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} placeholder="RC Book Number" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Date</label>
                            <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Usage Type</label>
                            <select name="usageType" value={formData.usageType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Usage --</option>
                                {USAGE_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Odometer Reading (KM)</label>
                            <input type="number" name="odometerReading" value={formData.odometerReading} onChange={handleChange} placeholder="Total KM driven" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Age</label>
                            <div className="px-4 py-3 rounded-lg text-sm" style={{ ...inputStyle, color: '#e8a317' }}>{calculateVehicleAge()}</div>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Chassis Number (VIN) *</label>
                            <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="17-digit VIN" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Engine Number *</label>
                            <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} placeholder="Engine identification number" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
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
                                    <input type="text" value={customCompany} onChange={e => setCustomCompany(e.target.value)} placeholder="Enter company name" className="flex-1 px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
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
                                    <button type="button" onClick={() => setShowCustomCompany(true)} className="px-3 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }} title="Add custom company">
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
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Type</label>
                            <select name="policyType" value={formData.policyType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Type --</option>
                                {POLICY_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Start Date</label>
                            <input type="date" name="policyStartDate" value={formData.policyStartDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy End Date</label>
                            <input type="date" name="policyEndDate" value={formData.policyEndDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Expiry Date</label>
                            <input type="date" name="policyExpiryDate" value={formData.policyExpiryDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Claim Type *</label>
                            <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle} required>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Claim Type --</option>
                                {CLAIM_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#111318' }}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Estimated Claim Amount (₹) *</label>
                            <input type="number" name="estimatedClaimAmount" value={formData.estimatedClaimAmount} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} required />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>IDV - Insured Declared Value (₹)</label>
                            <input type="number" name="idvValue" value={formData.idvValue} onChange={handleChange} placeholder="Vehicle's market value" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Claim Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                {CLAIM_STATUSES.map(s => <option key={s} value={s} style={{ backgroundColor: '#111318' }}>{s.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Vehicle Condition Before Accident</label>
                            <select name="vehicleConditionBefore" value={formData.vehicleConditionBefore} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select Condition --</option>
                                {VEHICLE_CONDITIONS.map(c => <option key={c} value={c} style={{ backgroundColor: '#111318' }}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Previous Accident History</label>
                            <select name="previousAccidentHistory" value={formData.previousAccidentHistory} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer" style={inputStyle}>
                                <option value="" style={{ backgroundColor: '#111318' }}>-- Select History --</option>
                                {ACCIDENT_HISTORY.map(h => <option key={h} value={h} style={{ backgroundColor: '#111318' }}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Claim / Incident Details */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        Claim / Incident Details
                    </h3>

                    {/* Damage Areas */}
                    <div className="mb-6">
                        <label className="text-xs uppercase mb-3 block" style={{ color: '#6b7080' }}>Select all applicable damage areas:</label>
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
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Accident/Incident Date</label>
                            <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Accident Location</label>
                            <input type="text" name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} placeholder="e.g. Mumbai-Pune Highway" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Damage Description *</label>
                        <textarea
                            name="damageDescription"
                            value={formData.damageDescription}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Describe the damage in detail..."
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                            style={inputStyle}
                            required
                        />

                        {/* AI Translate Button */}
                        <button
                            type="button"
                            onClick={handleTranslate}
                            disabled={translating || !formData.damageDescription}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-1px]"
                            style={{
                                backgroundColor: 'rgba(96, 165, 250, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid rgba(96, 165, 250, 0.3)'
                            }}
                        >
                            {translating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Translating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    Translate to English
                                </>
                            )}
                        </button>
                        <p className="text-xs mt-1" style={{ color: '#6b7080' }}>Click to translate Hindi to English using AI</p>
                    </div>
                </div>

                {/* Documents & Images */}
                <div className="rounded-xl p-6" style={sectionStyle}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                        <Upload className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Documents & Images
                    </h3>

                    {/* Damage Images */}
                    <div className="mb-8">
                        <label className="text-sm font-medium text-white mb-3 block">
                            Damage Images
                            {documentFiles.damageImages.length > 0 && (
                                <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>
                                    ({documentFiles.damageImages.length} file(s) selected)
                                </span>
                            )}
                        </label>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({
                                        ...prev,
                                        damageImages: [...prev.damageImages, ...files]
                                    }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer hover:file:bg-[#e8a317]/30"
                                style={{ color: '#6b7080' }}
                            />
                            {documentFiles.damageImages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {documentFiles.damageImages.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                                            {file.name.slice(0, 20)}...
                                            <button type="button" onClick={() => setDocumentFiles(prev => ({
                                                ...prev,
                                                damageImages: prev.damageImages.filter((_, i) => i !== idx)
                                            }))}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs" style={{ color: '#6b7080' }}>Upload images of the damaged vehicle (JPG, PNG - max 5MB each)</p>
                        </div>
                    </div>

                    {/* FIR Document */}
                    <div className="mb-8">
                        <label className="text-sm font-medium text-white mb-3 block">
                            FIR Document (Optional)
                            {documentFiles.firDocs.length > 0 && (
                                <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>
                                    ({documentFiles.firDocs.length} file(s) selected)
                                </span>
                            )}
                        </label>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || [])
                                    setDocumentFiles(prev => ({ ...prev, firDocs: [...prev.firDocs, ...files] }))
                                }}
                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer"
                                style={{ color: '#6b7080' }}
                            />
                            <p className="text-xs" style={{ color: '#6b7080' }}>Upload FIR copy (PDF, JPG, PNG - max 5MB)</p>
                        </div>
                    </div>

                    {/* Required Identity Documents */}
                    <div className="mb-8">
                        <h4 className="text-sm font-medium text-white mb-4">Required Identity Documents</h4>
                        <p className="text-xs mb-4" style={{ color: '#6b7080' }}>Please upload the following documents (PDF, JPG, PNG - max 5MB each)</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PAN Card */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                                    PAN Card <span style={{ color: '#f87171' }}>*</span>
                                    {(documentFiles.panFront || documentFiles.panBack) && <span className="text-xs font-normal" style={{ color: '#4ade80' }}>✓</span>}
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles.panFront && `- ${documentFiles.panFront.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, panFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles.panBack && `- ${documentFiles.panBack.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, panBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar Card */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                                    Aadhaar Card <span style={{ color: '#f87171' }}>*</span>
                                    {(documentFiles.aadhaarFront || documentFiles.aadhaarBack) && <span className="text-xs font-normal" style={{ color: '#4ade80' }}>✓</span>}
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles.aadhaarFront && `- ${documentFiles.aadhaarFront.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles.aadhaarBack && `- ${documentFiles.aadhaarBack.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhaarBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Driving License */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                                    Driving License <span style={{ color: '#f87171' }}>*</span>
                                    {(documentFiles.dlFront || documentFiles.dlBack) && <span className="text-xs font-normal" style={{ color: '#4ade80' }}>✓</span>}
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles.dlFront && `- ${documentFiles.dlFront.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles.dlBack && `- ${documentFiles.dlBack.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, dlBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Policy Copy */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                                    Insurance Policy Copy <span style={{ color: '#f87171' }}>*</span>
                                    {(documentFiles.insuranceFront || documentFiles.insuranceBack) && <span className="text-xs font-normal" style={{ color: '#4ade80' }}>✓</span>}
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles.insuranceFront && `- ${documentFiles.insuranceFront.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles.insuranceBack && `- ${documentFiles.insuranceBack.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, insuranceBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Passbook */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white mb-3 block">
                                    Bank Passbook Image
                                    {documentFiles.bankPassbook && <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>✓ {documentFiles.bankPassbook.name.slice(0, 15)}...</span>}
                                </label>
                                <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, bankPassbook: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                            </div>

                            {/* RC Image */}
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <label className="text-sm font-medium text-white mb-3 block">
                                    RC Image (Registration Certificate)
                                    {(documentFiles.rcFront || documentFiles.rcBack) && <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>✓</span>}
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Front Side {documentFiles.rcFront && `- ${documentFiles.rcFront.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcFront: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                    <div>
                                        <span className="text-xs block mb-1" style={{ color: '#6b7080' }}>Back Side {documentFiles.rcBack && `- ${documentFiles.rcBack.name.slice(0, 15)}...`}</span>
                                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setDocumentFiles(prev => ({ ...prev, rcBack: e.target.files?.[0] || null }))} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer" style={{ color: '#6b7080' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Documents */}
                    <div>
                        <label className="text-sm font-medium text-white mb-3 block">
                            Additional Documents (Optional)
                            {documentFiles.additional.length > 0 && (
                                <span className="ml-2 text-xs font-normal" style={{ color: '#4ade80' }}>
                                    ({documentFiles.additional.length} file(s) selected)
                                </span>
                            )}
                        </label>
                        <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || [])
                                setDocumentFiles(prev => ({ ...prev, additional: [...prev.additional, ...files] }))
                            }}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#e8a317]/20 file:text-[#e8a317] file:font-medium file:cursor-pointer"
                            style={{ color: '#6b7080' }}
                        />
                        <p className="text-xs mt-2" style={{ color: '#6b7080' }}>Upload any additional supporting documents</p>
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
                        onClick={() => router.push('/admin/insurance')}
                        className="px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d8d8d8' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #e8a317, #d49510)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                        }}
                    >
                        {loading ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Claim...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Create Insurance Claim</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
