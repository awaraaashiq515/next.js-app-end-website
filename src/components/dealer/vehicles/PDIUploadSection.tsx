"use client"

import { useState, useRef } from "react"
import {
    FileText,
    Image as ImageIcon,
    Plus,
    Trash2,
    X,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Download,
    Eye
} from "lucide-react"

interface PDIUploadSectionProps {
    pdiStatus: string
    pdiType: string | null
    pdiFiles: string[]
    onChange: (data: { pdiStatus?: string, pdiType?: string | null, pdiFiles?: string[] }) => void
}

export function PDIUploadSection({ pdiStatus, pdiType, pdiFiles, onChange }: PDIUploadSectionProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pdfInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PDF' | 'IMAGES') => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setError(null)
        setUploading(true)

        const formData = new FormData()
        formData.append('type', type)
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i])
        }

        try {
            const res = await fetch('/api/dealer/vehicles/upload-pdi', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload files')
            }

            const newFilePaths = data.files.map((f: any) => f.filePath)

            if (type === 'PDF') {
                onChange({ pdiStatus: 'Yes', pdiType: 'PDF', pdiFiles: newFilePaths })
            } else {
                onChange({
                    pdiStatus: 'Yes',
                    pdiType: 'IMAGES',
                    pdiFiles: [...pdiFiles, ...newFilePaths]
                })
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
            if (pdfInputRef.current) pdfInputRef.current.value = ""
            if (imageInputRef.current) imageInputRef.current.value = ""
        }
    }

    const removeFile = (index: number) => {
        const updatedFiles = pdiFiles.filter((_, i) => i !== index)
        onChange({ pdiFiles: updatedFiles })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* PDI Status Toggle */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">PDI Certification</h3>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Has the vehicle undergone Pre-Delivery Inspection?</p>
                    </div>

                    <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
                        {["No", "Yes"].map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => onChange({ pdiStatus: status, pdiType: status === 'No' ? null : pdiType, pdiFiles: status === 'No' ? [] : pdiFiles })}
                                className={`px-10 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${pdiStatus === status
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* PDI Upload UI - Only if Yes */}
            {pdiStatus === 'Yes' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    {/* Upload Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className={`group relative flex flex-col items-center justify-center p-12 rounded-[3.5rem] border-2 border-dashed transition-all duration-500 ${pdiType === 'PDF'
                                    ? "bg-white border-blue-600 shadow-[0_40px_80px_rgba(37,99,235,0.08)]"
                                    : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white"
                                }`}
                        >
                            <input
                                type="file"
                                hidden
                                accept="application/pdf"
                                ref={pdfInputRef}
                                onChange={(e) => handleFileChange(e, 'PDF')}
                            />
                            <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 ${pdiType === 'PDF' ? "bg-blue-600 text-white rotate-6 scale-110 shadow-3xl" : "bg-white text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                }`}>
                                <FileText className="w-8 h-8" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 mb-2">Upload PDI as PDF</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Only PDF files (Max 5MB)</p>

                            {pdiType === 'PDF' && pdiFiles.length > 0 && (
                                <div className="absolute top-6 right-6 p-2 rounded-full bg-blue-100 text-blue-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className={`group relative flex flex-col items-center justify-center p-12 rounded-[3.5rem] border-2 border-dashed transition-all duration-500 ${pdiType === 'IMAGES'
                                    ? "bg-white border-blue-600 shadow-[0_40px_80px_rgba(37,99,235,0.08)]"
                                    : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white"
                                }`}
                        >
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                ref={imageInputRef}
                                onChange={(e) => handleFileChange(e, 'IMAGES')}
                            />
                            <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 ${pdiType === 'IMAGES' ? "bg-blue-600 text-white -rotate-6 scale-110 shadow-3xl" : "bg-white text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                }`}>
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 mb-2">Upload PDI as Images</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-image select (Max 5MB each)</p>

                            {pdiType === 'IMAGES' && pdiFiles.length > 0 && (
                                <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black">
                                    {pdiFiles.length} FILES
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Loading & Error States */}
                    {uploading && (
                        <div className="flex items-center justify-center gap-3 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl text-blue-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-xs font-black uppercase tracking-widest">Processing Digital Protocol...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-6 bg-red-50/50 border border-red-100 rounded-3xl text-red-600 animate-shake">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-100 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Preview Area */}
                    {pdiFiles.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                                <FileText className="w-32 h-32" />
                            </div>

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="space-y-1">
                                    <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Attached Documentation</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Registry Active</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onChange({ pdiType: null, pdiFiles: [] })}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {pdiType === 'PDF' ? (
                                <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-3xl group relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-red-500 shadow-sm">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{pdiFiles[0].split('/').pop()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified PDF Report</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={`/${pdiFiles[0]}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <a href={`/${pdiFiles[0]}`} download className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
                                    {pdiFiles.map((path, idx) => (
                                        <div key={idx} className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-105">
                                            <img src={`/${path}`} alt="PDI" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="p-3 bg-white text-red-500 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 transition-all group"
                                    >
                                        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
