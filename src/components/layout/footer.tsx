export function Footer() {
    return (
        <footer className="py-10 px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: '#111318', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <div className="font-display text-lg tracking-[3px] text-white">
                Detailing<span style={{ color: '#e8a317' }}>Garage</span>
            </div>
            <p className="text-[13px]" style={{ color: '#6b7080' }}>© 2026 DetailingGarage. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="text-[13px] hover:text-[#e8a317] transition-colors" style={{ color: '#6b7080' }}>Privacy</a>
                <a href="#" className="text-[13px] hover:text-[#e8a317] transition-colors" style={{ color: '#6b7080' }}>Terms</a>
                <a href="#" className="text-[13px] hover:text-[#e8a317] transition-colors" style={{ color: '#6b7080' }}>Contact</a>
            </div>
        </footer>
    )
}
