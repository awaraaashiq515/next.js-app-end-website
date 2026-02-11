"use client"

import * as React from "react"
import { ImageCategory, PDIImageData } from "./pdi-types"
import { Button } from "@/components/ui/button"
import { Camera, X, Upload, Loader2, AlertCircle } from "lucide-react"

interface VehicleImageUploadProps {
    images: PDIImageData[]
    onChange: (images: PDIImageData[]) => void
}

const IMAGE_CATEGORIES: { value: ImageCategory; label: string }[] = [
    { value: 'FRONT_VIEW', label: 'Front View' },
    { value: 'REAR_VIEW', label: 'Rear View' },
    { value: 'LEFT_SIDE', label: 'Left Side View' },
    { value: 'RIGHT_SIDE', label: 'Right Side View' },
    { value: 'INTERIOR', label: 'Interior' },
    { value: 'DASHBOARD', label: 'Dashboard' },
    { value: 'ENGINE', label: 'Engine' },
    { value: 'BOOT_SPACE', label: 'Boot Space' },
    { value: 'STEPNEY', label: 'Stepney / Spare Wheel' },
    { value: 'TYRE_FRONT_LEFT', label: 'Tyre - Front Left' },
    { value: 'TYRE_FRONT_RIGHT', label: 'Tyre - Front Right' },
    { value: 'TYRE_REAR_LEFT', label: 'Tyre - Rear Left' },
    { value: 'TYRE_REAR_RIGHT', label: 'Tyre - Rear Right' },
    { value: 'UNDERBODY', label: 'Underbody' },
    { value: 'OTHER', label: 'Other Images' },
]

export function VehicleImageUpload({ images, onChange }: VehicleImageUploadProps) {
    const [uploading, setUploading] = React.useState<Record<string, boolean>>({})
    const [uploadError, setUploadError] = React.useState<string | null>(null)

    const handleFileSelect = async (category: ImageCategory, files: FileList | null) => {
        if (!files || files.length === 0) return

        setUploadError(null)
        const categoryKey = category

        // Upload each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Validate file
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                setUploadError(`Invalid file type: ${file.name}. Only jpg, jpeg, png, webp allowed.`)
                continue
            }

            if (file.size > 5 * 1024 * 1024) {
                setUploadError(`File too large: ${file.name}. Maximum size is 5MB.`)
                continue
            }

            // Set uploading state
            setUploading(prev => ({ ...prev, [categoryKey]: true }))

            try {
                // Upload to server
                const formData = new FormData()
                formData.append('file', file)
                formData.append('category', category)

                const response = await fetch('/api/pdi/upload-image', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Upload failed')
                }

                const result = await response.json()

                // Add to images array
                const newImage: PDIImageData = {
                    tempId: `temp-${Date.now()}-${i}`,
                    category,
                    imagePath: result.data.filePath,
                    fileName: result.data.fileName,
                    fileSize: result.data.fileSize,
                    preview: result.data.preview
                }

                onChange([...images, newImage])
            } catch (error: any) {
                console.error('Upload error:', error)
                setUploadError(error.message || 'Failed to upload image')
            } finally {
                setUploading(prev => ({ ...prev, [categoryKey]: false }))
            }
        }
    }

    const handleRemoveImage = (imageToRemove: PDIImageData) => {
        onChange(images.filter(img =>
            img.tempId ? img.tempId !== imageToRemove.tempId : img.id !== imageToRemove.id
        ))
    }

    const getImagesForCategory = (category: ImageCategory) => {
        return images.filter(img => img.category === category)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Camera className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-white">Vehicle Images</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </div>

            {uploadError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{uploadError}</p>
                    <button
                        onClick={() => setUploadError(null)}
                        className="ml-auto text-red-400 hover:text-red-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {IMAGE_CATEGORIES.map(({ value, label }) => {
                    const categoryImages = getImagesForCategory(value)
                    const isUploading = uploading[value]

                    return (
                        <div
                            key={value}
                            className="rounded-xl border border-white/10 bg-[#111318] overflow-hidden"
                        >
                            {/* Category Header */}
                            <div className="bg-gradient-to-r from-blue-500/20 to-transparent px-4 py-3 border-b border-white/10">
                                <h3 className="text-sm font-bold text-white">{label}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {categoryImages.length} {categoryImages.length === 1 ? 'image' : 'images'}
                                </p>
                            </div>

                            {/* Images Grid */}
                            <div className="p-4 space-y-3">
                                {categoryImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryImages.map((img) => (
                                            <div
                                                key={img.tempId || img.id}
                                                className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"
                                            >
                                                <img
                                                    src={img.preview || `/${img.imagePath}`}
                                                    alt={label}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleRemoveImage(img)}
                                                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <p className="text-[10px] text-white truncate">{img.fileName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Button */}
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        multiple
                                        onChange={(e) => handleFileSelect(value, e.target.files)}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-white/20 hover:border-blue-500/50 bg-white/[0.02] hover:bg-blue-500/5 cursor-pointer transition-all">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                <span className="text-xs text-blue-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-400">Upload Images</span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                <p className="text-[10px] text-gray-600 text-center">
                                    Max 5MB • JPG, PNG, WEBP
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                <div className="flex items-start gap-3">
                    <Camera className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-300">Image Upload Tips</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Upload multiple images per category for comprehensive documentation</li>
                            <li>• Ensure images are clear and well-lit for better visibility in reports</li>
                            <li>• You can remove images before saving by clicking the X button</li>
                            <li>• Supported formats: JPG, JPEG, PNG, WEBP (max 5MB each)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
