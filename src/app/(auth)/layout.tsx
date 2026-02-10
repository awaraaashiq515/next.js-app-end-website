export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#08090c] p-8 md:p-12">
            {children}
        </div>
    )
}
