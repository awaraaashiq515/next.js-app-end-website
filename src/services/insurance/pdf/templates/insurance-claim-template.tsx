import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { join } from 'path'
import { readFileSync } from 'fs'

// Types for insurance claim PDF
export interface InsuranceClaimPDFData {
    claim: {
        claimNumber: string
        createdAt: string
        status: string
        source: string

        // Vehicle Details
        vehicleMake: string
        vehicleModel: string
        vehicleVariant?: string
        vehicleYear: string
        vehicleType?: string
        fuelType?: string
        transmissionType?: string
        vehicleColor?: string
        registrationNumber: string
        rcNumber?: string
        registrationDate?: string
        usageType?: string
        odometerReading?: number
        chassisNumber?: string
        engineNumber?: string

        // Insurance Details
        policyNumber: string
        insuranceCompany: string
        policyType?: string
        policyStartDate?: string
        policyEndDate?: string
        policyExpiryDate?: string
        idvValue?: number
        vehicleConditionBefore?: string
        previousAccidentHistory?: string

        // Incident Details
        claimType: string
        incidentDate: string
        incidentLocation: string
        incidentDescription: string
        damageAreas?: string
        estimatedDamage?: number

        // Customer Details (for walk-in)
        customerCity?: string

        // Admin
        adminNotes?: string
        reviewedBy?: string
        reviewedAt?: string
    }
    customer: {
        name: string
        email?: string
        mobile?: string
    }
    documents?: Array<{
        fileName: string
        fileType: string
        fileUrl: string
    }>
}

// ─── Professional Color Palette ────────────────────────────────────────────
const C = {
    // Primary Brand Colors
    primary: '#2563EB',        // Professional Blue
    primaryDark: '#1E40AF',
    primaryLight: '#DBEAFE',

    // Accent Colors
    gold: '#F59E0B',           // Warm Gold
    goldLight: '#FEF3C7',
    goldDark: '#D97706',

    // Neutral Colors
    dark: '#111827',           // Almost Black
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#9CA3AF',

    // Background Colors
    white: '#FFFFFF',
    bgPrimary: '#F9FAFB',
    bgSecondary: '#F3F4F6',
    bgTertiary: '#E5E7EB',

    // Border Colors
    borderLight: '#E5E7EB',
    borderMedium: '#D1D5DB',
    borderDark: '#9CA3AF',

    // Status Colors
    success: '#10B981',
    successBg: '#D1FAE5',
    successBorder: '#6EE7B7',

    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningBorder: '#FCD34D',

    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    dangerBorder: '#FCA5A5',

    info: '#3B82F6',
    infoBg: '#DBEAFE',
    infoBorder: '#93C5FD',
}

// ─── Enhanced Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        paddingTop: 0,
        paddingBottom: 60,
        paddingHorizontal: 0,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: C.white,
    },

    // ── Body Container ────────────────────────────────────────────────
    body: {
        paddingHorizontal: 32,
        paddingTop: 4,
    },

    // ── Header Section ────────────────────────────────────────────────
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        marginTop: 8,
        paddingHorizontal: 32,
        paddingBottom: 6,
        borderBottomWidth: 2,
        borderBottomColor: C.primary,
    },
    reportTitle: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        letterSpacing: 0.8,
    },
    claimBadge: {
        backgroundColor: C.gold,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 6,
    },
    claimBadgeText: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 0.5,
    },

    // ── Status Badge ──────────────────────────────────────────────────
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        paddingHorizontal: 32,
    },
    statusPill: {
        paddingHorizontal: 24,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    statusPillText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    // ── Section Container ─────────────────────────────────────────────
    section: {
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: C.borderMedium,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: C.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.bgSecondary,
        borderBottomWidth: 1.5,
        borderBottomColor: C.borderMedium,
    },
    sectionAccent: {
        width: 5,
        backgroundColor: C.primary,
        alignSelf: 'stretch',
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        paddingVertical: 8,
        paddingHorizontal: 12,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    sectionBody: {
        padding: 10,
        backgroundColor: C.white,
    },

    // ── Form Fields ───────────────────────────────────────────────────
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 8,
    },
    fieldCell: {
        flex: 1,
    },
    fieldCellLast: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.mediumGray,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        backgroundColor: C.bgPrimary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.borderLight,
    },
    fieldValueEmpty: {
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: C.lightGray,
        backgroundColor: C.bgPrimary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.borderLight,
    },
    fieldValueHighlight: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: C.primary,
        backgroundColor: C.primaryLight,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.primary,
    },

    // ── Text Area Fields ──────────────────────────────────────────────
    textAreaBox: {
        backgroundColor: C.bgPrimary,
        borderWidth: 1,
        borderColor: C.borderLight,
        borderRadius: 6,
        padding: 8,
        marginTop: 4,
        minHeight: 35,
    },
    textAreaText: {
        fontSize: 9.5,
        lineHeight: 1.7,
        color: C.dark,
        fontFamily: 'Helvetica',
    },

    // ── Special Boxes ─────────────────────────────────────────────────
    adminNotesBox: {
        backgroundColor: C.warningBg,
        borderWidth: 1.5,
        borderColor: C.warningBorder,
        borderRadius: 6,
        padding: 8,
    },
    damageValue: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.danger,
        backgroundColor: C.dangerBg,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: C.dangerBorder,
    },

    // ── Documents Table ───────────────────────────────────────────────    // Document Grid
    docGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    docImageBox: {
        width: '48%',
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: C.borderMedium,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: C.white,
    },
    docImage: {
        width: '100%',
        height: 180,
        objectFit: 'contain',
        backgroundColor: C.bgSecondary,
    },
    docImageLabel: {
        padding: 8,
        backgroundColor: C.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: C.borderLight,
    },
    docImageType: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ── Footer ────────────────────────────────────────────────────────
    footerWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    // ── Info Badge ────────────────────────────────────────────────────
    infoBadge: {
        backgroundColor: C.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.primary,
    },
    infoBadgeText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.primary,
    },
})

// ─── Helper Functions ───────────────────────────────────────────────────────

function getBrandingImageBase64(filename: string): string {
    try {
        const imagePath = join(process.cwd(), 'public', 'branding', filename)
        const imageBuffer = readFileSync(imagePath)
        const base64 = imageBuffer.toString('base64')
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
        return `data:${mimeType};base64,${base64}`
    } catch (error) {
        console.error(`Failed to load branding image ${filename}:`, error)
        return ''
    }
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'APPROVED':
        case 'COMPLETED':
            return { bg: C.successBg, border: C.successBorder, text: C.success }
        case 'REJECTED':
            return { bg: C.dangerBg, border: C.dangerBorder, text: C.danger }
        case 'UNDER_REVIEW':
        case 'PENDING_DOCUMENTS':
            return { bg: C.warningBg, border: C.warningBorder, text: C.warning }
        default:
            return { bg: C.infoBg, border: C.infoBorder, text: C.info }
    }
}

function formatCurrency(amount?: number): string {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return dateString
    }
}

// ─── Reusable Components ────────────────────────────────────────────────────

function Field({
    label,
    value,
    isLast,
    isDamage,
    isHighlight
}: {
    label: string
    value: string
    isLast?: boolean
    isDamage?: boolean
    isHighlight?: boolean
}) {
    const isEmpty = !value || value === '-'

    let valueStyle = s.fieldValue
    if (isDamage) valueStyle = s.damageValue
    else if (isHighlight) valueStyle = s.fieldValueHighlight
    else if (isEmpty) valueStyle = s.fieldValueEmpty

    return (
        <View style={isLast ? s.fieldCellLast : s.fieldCell}>
            <Text style={s.fieldLabel}>{label}</Text>
            <Text style={valueStyle}>
                {isEmpty ? '—' : value}
            </Text>
        </View>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <View style={s.sectionAccent} />
                <Text style={s.sectionTitle}>{title}</Text>
            </View>
            <View style={s.sectionBody}>
                {children}
            </View>
        </View>
    )
}

// ─── Main PDF Template ──────────────────────────────────────────────────────

export function InsuranceClaimTemplate({ data }: { data: InsuranceClaimPDFData }) {
    const st = getStatusStyle(data.claim.status)

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* ── Header Branding ───────────────────────────────── */}
                <Image
                    src={getBrandingImageBase64('pdi-header.jpg')}
                    style={{ width: '100%', marginBottom: 0 }}
                />

                {/* ── Title Bar ─────────────────────────────────────── */}
                <View style={s.titleRow}>
                    <Text style={s.reportTitle}>Insurance Claim Report</Text>
                    <View style={s.claimBadge}>
                        <Text style={s.claimBadgeText}>{data.claim.claimNumber}</Text>
                    </View>
                </View>

                {/* ── Status Badge ──────────────────────────────────── */}
                <View style={s.statusRow}>
                    <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[s.statusPillText, { color: st.text }]}>
                            {data.claim.status.replace(/_/g, ' ')}
                        </Text>
                    </View>
                </View>

                {/* ── Main Content ──────────────────────────────────── */}
                <View style={s.body}>

                    {/* ── Customer Information ──────────────────────── */}
                    <Section title="Customer Information">
                        <View style={s.fieldRow}>
                            <Field label="Full Name" value={data.customer.name} />
                            <Field label="Email Address" value={data.customer.email || '-'} />
                            <Field label="Mobile Number" value={data.customer.mobile || '-'} isLast />
                        </View>
                        {data.claim.customerCity && (
                            <View style={s.fieldRow}>
                                <Field label="City" value={data.claim.customerCity} isLast />
                            </View>
                        )}
                    </Section>

                    {/* ── Vehicle Details ───────────────────────────── */}
                    <Section title="Vehicle Details">
                        {/* Row 1: Make/Brand, Model, Model Variant, Manufacturing Year */}
                        <View style={s.fieldRow}>
                            <Field label="Vehicle Make/Brand" value={data.claim.vehicleMake} />
                            <Field label="Model" value={data.claim.vehicleModel} />
                            <Field label="Model Variant" value={data.claim.vehicleVariant || '-'} />
                            <Field label="Manufacturing Year" value={data.claim.vehicleYear} isLast />
                        </View>
                        {/* Row 2: Vehicle Type, Fuel Type, Transmission Type, Vehicle Color */}
                        <View style={s.fieldRow}>
                            <Field label="Vehicle Type" value={data.claim.vehicleType || '-'} />
                            <Field label="Fuel Type" value={data.claim.fuelType || '-'} />
                            <Field label="Transmission Type" value={data.claim.transmissionType || '-'} />
                            <Field label="Vehicle Color" value={data.claim.vehicleColor || '-'} isLast />
                        </View>
                        {/* Row 3: Registration Number, RC Number, Registration Date, Usage Type */}
                        <View style={s.fieldRow}>
                            <Field
                                label="Registration Number"
                                value={data.claim.registrationNumber}
                                isHighlight
                            />
                            <Field label="RC Number" value={data.claim.rcNumber || '-'} />
                            <Field label="Registration Date" value={formatDate(data.claim.registrationDate)} />
                            <Field label="Usage Type" value={data.claim.usageType || '-'} isLast />
                        </View>
                        {/* Row 4: Odometer Reading, Vehicle Age, Chassis Number (VIN), Engine Number */}
                        <View style={s.fieldRow}>
                            <Field label="Odometer Reading (KM)" value={data.claim.odometerReading?.toString() || '-'} />
                            <Field label="Vehicle Age" value={'-'} />
                            <Field label="Chassis Number (VIN)" value={data.claim.chassisNumber || '-'} />
                            <Field label="Engine Number" value={data.claim.engineNumber || '-'} isLast />
                        </View>
                    </Section>

                    {/* ── Insurance Details ─────────────────────────── */}
                    <Section title="Insurance Details">
                        {/* Row 1: Insurance Company, Policy Number, Policy Type, Policy Start Date */}
                        <View style={s.fieldRow}>
                            <Field label="Insurance Company" value={data.claim.insuranceCompany} />
                            <Field
                                label="Policy Number"
                                value={data.claim.policyNumber}
                                isHighlight
                            />
                            <Field label="Policy Type" value={data.claim.policyType || '-'} />
                            <Field label="Policy Start Date" value={formatDate(data.claim.policyStartDate)} isLast />
                        </View>
                        {/* Row 2: Policy End Date, Policy Expiry Date, Claim Type, Estimated Claim Amount */}
                        <View style={s.fieldRow}>
                            <Field label="Policy End Date" value={formatDate(data.claim.policyEndDate)} />
                            <Field label="Policy Expiry Date" value={formatDate(data.claim.policyExpiryDate)} />
                            <Field label="Claim Type" value={data.claim.claimType} />
                            <Field label="Estimated Claim Amount (₹)" value={formatCurrency(data.claim.estimatedDamage)} isLast isDamage={!!data.claim.estimatedDamage} />
                        </View>
                        {/* Row 3: IDV, Claim Status, Vehicle Condition Before Accident, Previous Accident History */}
                        <View style={s.fieldRow}>
                            <Field label="IDV - Insured Declared Value (₹)" value={formatCurrency(data.claim.idvValue)} />
                            <Field label="Claim Status" value={data.claim.status.replace(/_/g, ' ')} isHighlight />
                            <Field label="Vehicle Condition Before Accident" value={data.claim.vehicleConditionBefore || '-'} />
                            <Field label="Previous Accident History" value={data.claim.previousAccidentHistory || '-'} isLast />
                        </View>
                    </Section>

                    {/* ── Claim & Incident Details ──────────────────── */}
                    <Section title="Claim & Incident Details">
                        {/* Row 1: Claim Type, Incident Date, Estimated Damage - 3 columns */}
                        <View style={s.fieldRow}>
                            <Field label="Claim Type" value={data.claim.claimType} />
                            <Field label="Incident Date" value={formatDate(data.claim.incidentDate)} />
                            <Field
                                label="Estimated Damage"
                                value={formatCurrency(data.claim.estimatedDamage)}
                                isLast
                                isDamage={!!data.claim.estimatedDamage}
                            />
                        </View>
                        {/* Incident Location - Full width */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={s.fieldLabel}>Incident Location</Text>
                            <Text style={s.fieldValue}>{data.claim.incidentLocation || '—'}</Text>
                        </View>
                        {/* Incident Description - Full width textarea */}
                        <View style={{ marginBottom: data.claim.damageAreas ? 8 : 0 }}>
                            <Text style={s.fieldLabel}>Incident Description</Text>
                            <View style={s.textAreaBox}>
                                <Text style={s.textAreaText}>{data.claim.incidentDescription}</Text>
                            </View>
                        </View>
                        {/* Damage Areas - Full width textarea */}
                        {data.claim.damageAreas && (
                            <View>
                                <Text style={s.fieldLabel}>Damage Areas</Text>
                                <View style={s.textAreaBox}>
                                    <Text style={s.textAreaText}>{data.claim.damageAreas}</Text>
                                </View>
                            </View>
                        )}
                    </Section>

                    {/* ── Admin Notes ───────────────────────────────── */}
                    {data.claim.adminNotes && (
                        <Section title="Admin Notes & Recommendations">
                            <View style={s.adminNotesBox}>
                                <Text style={s.textAreaText}>{data.claim.adminNotes}</Text>
                            </View>
                            {data.claim.reviewedBy && (
                                <Text style={{ fontSize: 7.5, color: C.mediumGray, marginTop: 8, fontFamily: 'Helvetica' }}>
                                    Reviewed by: {data.claim.reviewedBy} on {formatDate(data.claim.reviewedAt)}
                                </Text>
                            )}
                        </Section>
                    )}

                    {/* ── Attached Documents ────────────────────────── */}
                    {data.documents && data.documents.length > 0 && (
                        <Section title={`Attached Documents (${data.documents.length})`}>
                            <View style={s.docGrid}>
                                {data.documents.map((doc, idx) => (
                                    <View key={idx} style={s.docImageBox}>
                                        <Image
                                            src={doc.fileUrl}
                                            style={s.docImage}
                                        />
                                        <View style={s.docImageLabel}>
                                            <Text style={s.docImageType}>{doc.fileType.replace(/_/g, ' ')}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </Section>
                    )}
                </View>

                {/* ── Footer Branding ───────────────────────────────── */}
                <View style={s.footerWrap}>
                    <Image
                        src={getBrandingImageBase64('pdi-footer.jpg')}
                        style={{ width: '100%' }}
                    />
                </View>
            </Page>
        </Document>
    )
}
