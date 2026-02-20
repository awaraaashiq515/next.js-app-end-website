import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { saveUploadedFile } from '@/lib/utils/file-upload.utils'
import path from 'path'

/**
 * POST /api/dealer/vehicles/upload-pdi
 * Handle PDI file uploads (PDF or Images) for dealers
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'DEALER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const type = formData.get('type') as string // 'PDF' or 'IMAGES'

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        const uploadDir = 'uploads/vehicles/pdi'
        const uploadedFiles: Array<{
            fileName: string
            filePath: string
            fileSize: number
        }> = []

        for (const file of files) {
            if (!(file instanceof File)) continue

            // Basic validation
            if (type === 'PDF' && file.type !== 'application/pdf') {
                return NextResponse.json({ error: 'Only PDF files are allowed for PDF type' }, { status: 400 })
            }

            if (type === 'IMAGES' && !file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only image files are allowed for IMAGES type' }, { status: 400 })
            }

            // Max size 5MB
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit` }, { status: 400 })
            }

            const fileInfo = await saveUploadedFile(file, uploadDir)

            // Normalize path for web usage
            const normalizedPath = fileInfo.filePath.replace(/\\/g, '/')

            uploadedFiles.push({
                fileName: fileInfo.fileName,
                filePath: normalizedPath,
                fileSize: fileInfo.fileSize
            })
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        })
    } catch (error: any) {
        console.error('PDI Upload error:', error)
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 })
    }
}
