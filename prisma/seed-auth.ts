import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // 1. Create default login purposes
    console.log('Creating login purposes...')
    const purposes = [
        { name: 'Personal Use', description: 'For individual/personal vehicle inspection needs' },
        { name: 'Business Partnership', description: 'For business collaboration and partnerships' },
        { name: 'Dealer Services', description: 'For authorized dealers and service providers' },
        { name: 'Insurance Claim', description: 'For insurance-related vehicle inspections' },
        { name: 'Pre-Purchase Inspection', description: 'For buyers inspecting vehicles before purchase' },
    ]

    for (const purpose of purposes) {
        await prisma.loginPurpose.upsert({
            where: { name: purpose.name },
            update: {},
            create: purpose,
        })
    }
    console.log('✅ Login purposes created')

    // 2. Create default OTP settings
    console.log('Creating OTP settings...')
    const existingOTPSettings = await prisma.oTPSettings.findFirst()
    if (!existingOTPSettings) {
        await prisma.oTPSettings.create({
            data: {
                emailOTPEnabled: true,
                mobileOTPEnabled: false,
                otpExpiryMinutes: 10,
            },
        })
        console.log('✅ OTP settings created')
    } else {
        console.log('⏭️  OTP settings already exist')
    }

    // 3. Create default admin user (if doesn't exist)
    console.log('Creating default admin user...')
    const adminEmail = 'admin@example.com'
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
                status: 'APPROVED',
                emailVerified: true,
                mobileVerified: true,
            },
        })
        console.log('✅ Default admin user created')
        console.log('   Email: admin@example.com')
        console.log('   Password: admin123')
    } else {
        console.log('⏭️  Admin user already exists')
    }

    // 4. Update existing users to APPROVED status if needed
    console.log('Checking existing users...')
    const allUsers = await prisma.user.findMany()

    let updatedCount = 0
    for (const user of allUsers) {
        // Update users who are not ADMIN and don't have a proper status
        if (user.role !== 'ADMIN' && (!user.status || user.status === 'PENDING')) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    status: 'APPROVED',
                    emailVerified: true,
                    mobileVerified: true
                }
            })
            updatedCount++
        }
    }
    console.log(`✅ Updated ${updatedCount} existing users to APPROVED status`)

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
