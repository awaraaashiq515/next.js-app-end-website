'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Shield, ArrowLeft, Car, FileCheck, AlertTriangle,
    RefreshCw, Save
} from "lucide-react"

const CLAIM_TYPES = [
    'Accident',
    'Theft',
    'Natural Disaster',
    'Third Party',
    'Fire',
    'Vandalism',
    'Other'
]

const POLICY_TYPES = [
    'Comprehensive',
    'Third Party',
    'Third Party Fire & Theft',
    'Own Damage Only'
]

const INSURANCE_COMPANIES = [
    'ICICI Lombard',
    'HDFC ERGO',
    'Bajaj Allianz',
    'New India Assurance',
    'National Insurance',
    'United India Insurance',
    'Oriental Insurance',
    'Tata AIG',
    'Reliance General',
    'SBI General',
    'Other'
]

export default function NewClaimPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        // Vehicle
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        registrationNumber: '',
        vin: '',
        engineNumber: '',
        // Policy
        policyNumber: '',
        insuranceCompany: '',
        policyType: '',
        policyStartDate: '',
        policyEndDate: '',
        // Incident
        claimType: '',
        incidentDate: '',
        incidentLocation: '',
        incidentDescription: '',
        estimatedDamage: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        const required = ['vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor',
            'registrationNumber', 'policyNumber', 'insuranceCompany', 'policyType',
            'claimType', 'incidentDate', 'incidentLocation', 'incidentDescription']

        for (const field of required) {
            if (!formData[field as keyof typeof formData]) {
                alert(`Please fill in all required fields. Missing: ${field.replace(/([A-Z])/g, ' $1')}`)
                return
            }
        }

        try {
            setLoading(true)
            const response = await fetch('/api/insurance-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                alert('Your insurance claim has been submitted successfully! You will receive updates via email and notifications.')
                router.push('/client/insurance-claims')
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error('Error creating claim:', error)
            alert('Failed to submit claim. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#d8d8d8'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/client/insurance-claims')}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <ArrowLeft className="w-5 h-5" style={{ color: '#d8d8d8' }} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: '#60a5fa' }} />
                        Submit Insurance Claim
                    </h2>
                    <p className="mt-1" style={{ color: '#6b7080' }}>Fill in your vehicle and incident details</p>
                </div>
            </div>

            {/* Info Banner */}
            <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)' }}
            >
                <p className="text-sm" style={{ color: '#60a5fa' }}>
                    📋 Once submitted, our team will review your claim and notify you of any updates via email and dashboard notifications.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Details */}
                <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Vehicle Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Make *</label>
                            <input
                                type="text"
                                name="vehicleMake"
                                value={formData.vehicleMake}
                                onChange={handleChange}
                                placeholder="e.g. Maruti, Honda"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Model *</label>
                            <input
                                type="text"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                placeholder="e.g. Swift, City"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Year *</label>
                            <input
                                type="text"
                                name="vehicleYear"
                                value={formData.vehicleYear}
                                onChange={handleChange}
                                placeholder="e.g. 2023"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Color *</label>
                            <input
                                type="text"
                                name="vehicleColor"
                                value={formData.vehicleColor}
                                onChange={handleChange}
                                placeholder="e.g. White"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Registration Number *</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="e.g. MH12AB1234"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>VIN/Chassis (Optional)</label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Engine No. (Optional)</label>
                            <input
                                type="text"
                                name="engineNumber"
                                value={formData.engineNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Insurance Policy */}
                <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <FileCheck className="w-5 h-5" style={{ color: '#60a5fa' }} />
                        Insurance Policy Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Number *</label>
                            <input
                                type="text"
                                name="policyNumber"
                                value={formData.policyNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Insurance Company *</label>
                            <select
                                name="insuranceCompany"
                                value={formData.insuranceCompany}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
                                style={inputStyle}
                                required
                            >
                                <option value="" style={{ backgroundColor: '#111318' }}>Select Company</option>
                                {INSURANCE_COMPANIES.map(company => (
                                    <option key={company} value={company} style={{ backgroundColor: '#111318' }}>{company}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Policy Type *</label>
                            <select
                                name="policyType"
                                value={formData.policyType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
                                style={inputStyle}
                                required
                            >
                                <option value="" style={{ backgroundColor: '#111318' }}>Select Type</option>
                                {POLICY_TYPES.map(type => (
                                    <option key={type} value={type} style={{ backgroundColor: '#111318' }}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Start Date</label>
                                <input
                                    type="date"
                                    name="policyStartDate"
                                    value={formData.policyStartDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 rounded-lg text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>End Date</label>
                                <input
                                    type="date"
                                    name="policyEndDate"
                                    value={formData.policyEndDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 rounded-lg text-sm outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Incident Details */}
                <div className="rounded-xl p-6" style={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                        Incident Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Claim Type *</label>
                            <select
                                name="claimType"
                                value={formData.claimType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
                                style={inputStyle}
                                required
                            >
                                <option value="" style={{ backgroundColor: '#111318' }}>Select Type</option>
                                {CLAIM_TYPES.map(type => (
                                    <option key={type} value={type} style={{ backgroundColor: '#111318' }}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Date *</label>
                            <input
                                type="date"
                                name="incidentDate"
                                value={formData.incidentDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Estimated Damage (₹)</label>
                            <input
                                type="number"
                                name="estimatedDamage"
                                value={formData.estimatedDamage}
                                onChange={handleChange}
                                placeholder="e.g. 50000 (optional)"
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Location *</label>
                        <input
                            type="text"
                            name="incidentLocation"
                            value={formData.incidentLocation}
                            onChange={handleChange}
                            placeholder="e.g. MG Road, Near XYZ Mall, Mumbai"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase mb-2 block" style={{ color: '#6b7080' }}>Incident Description *</label>
                        <textarea
                            name="incidentDescription"
                            value={formData.incidentDescription}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Please describe in detail how the incident occurred, what damages resulted, and any other relevant information..."
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/client/insurance-claims')}
                        className="px-6 py-3 rounded-lg font-medium transition-colors hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#d8d8d8' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #e8a317, #d49510)',
                            color: '#000',
                            boxShadow: '0 4px 15px rgba(232, 163, 23, 0.3)'
                        }}
                    >
                        {loading ? (
                            <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Submit Claim</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
