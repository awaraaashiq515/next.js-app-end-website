import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * POST - Upload document files for insurance claims
 * Files are stored in public/uploads/insurance-documents/
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const documentType = formData.get('documentType') as string || 'OTHER'
        const claimId = formData.get('claimId') as string

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'insurance-documents')
        await mkdir(uploadDir, { recursive: true })

        const uploadedFiles: Array<{
            fileName: string
            fileUrl: string
            fileType: string
        }> = []

        for (const file of files) {
            if (!(file instanceof File)) continue

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({
                    error: `File ${file.name} exceeds 5MB limit`
                }, { status: 400 })
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({
                    error: `File type ${file.type} not allowed`
                }, { status: 400 })
            }

            // Generate unique filename
            const ext = path.extname(file.name)
            const uniqueId = crypto.randomUUID()
            const fileName = `${documentType.toLowerCase()}_${uniqueId}${ext}`
            const filePath = path.join(uploadDir, fileName)

            // Convert file to buffer and save
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            await writeFile(filePath, buffer)

            // Public URL for the file
            const fileUrl = `/uploads/insurance-documents/${fileName}`

            uploadedFiles.push({
                fileName: file.name,
                fileUrl,
                fileType: documentType
            })
        }

        // If claimId is provided, also save to database
        if (claimId) {
            const { db } = await import('@/lib/db')

            await db.insuranceDocument.createMany({
                data: uploadedFiles.map(f => ({
                    claimId,
                    fileName: f.fileName,
                    fileUrl: f.fileUrl,
                    fileType: f.fileType
                }))
            })
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        })
    } catch (error: any) {
        console.error('Error uploading files:', error)
        return NextResponse.json({
            error: error.message || 'Failed to upload files'
        }, { status: 500 })
    }
}
