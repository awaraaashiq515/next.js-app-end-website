"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { Car, Bike, Wrench, ChevronRight } from "lucide-react"

interface FeaturedVehicle {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  fuelType?: string
  transmission?: string
  color?: string
  city?: string
  state?: string
  images?: string
  dealer: {
    name: string
    dealerBusinessName?: string
  }
}

export default function Home() {
  const [featuredVehicles, setFeaturedVehicles] = useState<FeaturedVehicle[]>([])

  useEffect(() => {
    fetch("/api/vehicles/featured")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.vehicles) setFeaturedVehicles(data.vehicles) })
      .catch(() => { })
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#08090c' }}>
      {/* ════════════════ NAVBAR ════════════════ */}
      {/* ════════════════ NAVBAR ════════════════ */}
      <Navbar />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Ambient Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Hero Pill */}
        <div className="glass inline-flex items-center gap-2 px-5 py-2 rounded-full mb-9 animate-fade-down">
          <span className="w-2 h-2 rounded-full animate-blink" style={{ backgroundColor: '#e8a317' }}></span>
          <span className="text-[13px] font-semibold tracking-[0.8px] uppercase" style={{ color: '#e8a317' }}>Premium Car Care Services</span>
        </div>

        {/* Heading */}
        <h1 className="font-display text-[clamp(64px,11vw,120px)] leading-[0.95] tracking-[4px] text-white animate-fade-up-delay-1">
          All Car Services<br />
          <span className="font-['Playfair_Display'] italic font-bold bg-gradient-to-r from-[#e8a317] via-[#ff6b35] to-[#ff6b35] bg-clip-text text-transparent">
            In One Place
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-[500px] mt-8 text-base leading-relaxed font-light animate-fade-up-delay-2" style={{ color: '#6b7080' }}>
          From repairs to detailing, PDI inspections to insurance work — we handle everything your car needs. Book online, track progress, and get your vehicle delivered.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center animate-fade-up-delay-3">
          <button className="btn-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book Service
          </button>
          <button className="btn-secondary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            WhatsApp
          </button>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <span className="text-[10px] tracking-[2.5px] uppercase" style={{ color: '#6b7080' }}>Scroll</span>
          <div className="w-5 h-5 border-r-2 border-b-2 rotate-45 animate-bounce-arrow" style={{ borderColor: '#e8a317' }}></div>
        </div>
      </section>

      {/* ════════════════ SERVICES ════════════════ */}
      <section id="services" className="py-28 px-6 md:px-14" style={{ backgroundColor: '#08090c' }}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#e8a317' }}></span>
            <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#e8a317' }}>What We Offer</span>
          </div>
          <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">Our Services</h2>
          <p className="max-w-[520px] mx-auto mt-4 text-[15px] leading-relaxed font-light" style={{ color: '#6b7080' }}>
            Complete automobile care under one roof. Expert technicians, genuine parts, and guaranteed satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1080px] mx-auto">
          {/* Card 1 */}
          <div className="service-card">
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-3">Car Workshop & Repair</h3>
            <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Full mechanical repairs — engine work, suspension, brakes, and all electrical systems handled by certified professionals.</p>
            <a href="#" className="learn-more mt-5">
              Learn More
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Card 2 */}
          <div className="service-card">
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(192, 132, 252, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#c084fc' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-3">Car Detailing</h3>
            <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Interior & exterior detailing, ceramic coating, paint protection, and deep cleaning to restore your car's showroom shine.</p>
            <a href="#" className="learn-more mt-5">
              Learn More
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Card 3 */}
          <div className="service-card">
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-3">PDI Inspection</h3>
            <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Pre-Delivery Inspection for new vehicles. Comprehensive checklist and quality assurance before you drive off.</p>
            <a href="#" className="learn-more mt-5">
              Learn More
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Card 4 */}
          <div className="service-card">
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#fb923c' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-3">Insurance & Accident</h3>
            <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Cashless insurance claims, incident quotes, accident denting, painting, and full restoration — completely stress-free.</p>
            <a href="#" className="learn-more mt-5">
              Learn More
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Card 5 */}
          <div className="service-card">
            <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#f87171' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-white mb-3">Old Car Buy & Sell</h3>
            <p className="text-sm leading-relaxed font-light" style={{ color: '#6b7080' }}>Get fair valuations, instant quotes, and hassle-free transactions. Sell your old car or find quality pre-owned vehicles.</p>
            <a href="#" className="learn-more mt-5">
              Learn More
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED USED CARS ════════════════ */}
      {featuredVehicles.filter(v => (v as any).vehicleType === 'CAR').length > 0 && (
        <section id="featured-cars" className="py-28 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #08090c 0%, #111318 100%)' }}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#e8a317' }}></span>
              <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#e8a317' }}>Dealer Listings</span>
            </div>
            <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">Featured <span className="text-[#e8a317]">Used Cars</span></h2>
            <p className="max-w-[520px] mx-auto mt-4 text-[15px] leading-relaxed font-light" style={{ color: '#6b7080' }}>
              Handpicked quality pre-owned cars from our top-rated verified dealers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
            {featuredVehicles.filter(v => (v as any).vehicleType === 'CAR').map(vehicle => {
              const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
              const thumb = imgs[0] || null
              return (
                <div key={vehicle.id} className="group rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]" style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* Image */}
                  <div className="h-56 flex items-center justify-center relative overflow-hidden" style={{ background: '#0e1015' }}>
                    {thumb ? (
                      <img src={thumb} alt={vehicle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <Car className="w-16 h-16 opacity-10" />
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ background: 'rgba(232,163,23,0.15)', color: '#e8a317', backdropFilter: 'blur(10px)', border: '1px solid rgba(232,163,23,0.3)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8a317] animate-pulse"></span>
                      Featured
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-white line-clamp-1">{vehicle.title}</h3>
                      <span className="text-[17px] font-black text-[#e8a317]">₹{vehicle.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[12px] mb-4 flex items-center gap-2 font-medium" style={{ color: '#6b7080' }}>
                      <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center"><Wrench className="w-3 h-3" /></span>
                      {vehicle.dealer.dealerBusinessName || vehicle.dealer.name}
                      {(vehicle.city || vehicle.state) && ` · ${[vehicle.city, vehicle.state].filter(Boolean).join(', ')}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[vehicle.year, vehicle.fuelType, vehicle.transmission, vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null].filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: '#555', border: '1px solid rgba(255,255,255,0.05)' }}>{tag}</span>
                      ))}
                    </div>
                    <button className="w-full text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 bg-white/5 text-white border border-white/5 hover:bg-white hover:text-black hover:scale-[1.03]">
                      View Full Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-16 text-center">
            <Link href="/cars" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#6b7080] hover:text-white transition-all group">
              Browse All Cars <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════ FEATURED USED BIKES ════════════════ */}
      {featuredVehicles.filter(v => (v as any).vehicleType === 'BIKE').length > 0 && (
        <section id="featured-bikes" className="py-28 px-6 md:px-14" style={{ background: '#08090c' }}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#60a5fa' }}></span>
              <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#60a5fa' }}>Premium Two-Wheelers</span>
            </div>
            <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">Featured <span className="text-[#60a5fa]">Used Bikes</span></h2>
            <p className="max-w-[520px] mx-auto mt-4 text-[15px] leading-relaxed font-light" style={{ color: '#6b7080' }}>
              Explore certified used bikes and scooters with detailed history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[10800px] mx-auto">
            {featuredVehicles.filter(v => (v as any).vehicleType === 'BIKE').map(vehicle => {
              const imgs = (() => { try { return JSON.parse(vehicle.images || '[]') } catch { return [] } })()
              const thumb = imgs[0] || null
              return (
                <div key={vehicle.id} className="group rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:border-white/20" style={{ background: 'linear-gradient(135deg, #161921 0%, #111318 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Image */}
                  <div className="h-56 flex items-center justify-center relative overflow-hidden" style={{ background: 'black' }}>
                    {thumb ? (
                      <img src={thumb} alt={vehicle.title} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-60" />
                    ) : (
                      <Bike className="w-16 h-16 opacity-10" />
                    )}
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', backdropFilter: 'blur(10px)', border: '1px solid rgba(96,165,250,0.3)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse"></span>
                      Verified
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[17px] font-bold text-white line-clamp-1">{vehicle.title}</h3>
                      <span className="text-[17px] font-black text-white">₹{vehicle.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[12px] mb-4 flex items-center gap-2 font-medium" style={{ color: '#6b7080' }}>
                      <Wrench className="w-3 h-3" />
                      {vehicle.dealer.dealerBusinessName || vehicle.dealer.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[vehicle.year, (vehicle as any).engineCC ? `${(vehicle as any).engineCC} CC` : null, vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : null].filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-black text-[#444] border border-white/5">{tag}</span>
                      ))}
                    </div>
                    <button className="w-full text-[11px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 border border-white/5 text-[#888] group-hover:bg-[#60a5fa] group-hover:text-black group-hover:border-[#60a5fa]">
                      Examine Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-16 text-center">
            <Link href="/bikes" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#6b7080] hover:text-white transition-all group">
              Browse All Bikes <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how-it-works" className="py-28 px-6 md:px-14 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #111318 0%, #08090c 100%)' }}>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232, 163, 23, 0.07) 0%, transparent 70%)' }}></div>

        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#e8a317' }}></span>
            <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#e8a317' }}>Process</span>
          </div>
          <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">How It Works</h2>
          <p className="mt-4 text-[15px] font-light" style={{ color: '#6b7080' }}>Book your service in just 4 simple steps</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 max-w-[1000px] mx-auto relative z-10">
          {/* Step 1 */}
          <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#e8a317', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #e8a317' }}>
              1
            </div>
            <h4 className="text-[15px] font-semibold text-white mb-2">Choose Service</h4>
            <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Select from our wide range of car services based on your needs.</p>
          </div>

          {/* Step 2 */}
          <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#60a5fa', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #60a5fa' }}>
              2
            </div>
            <h4 className="text-[15px] font-semibold text-white mb-2">Book Appointment</h4>
            <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Pick a convenient date and time. Book online or call us directly.</p>
          </div>

          {/* Step 3 */}
          <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#4ade80', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #4ade80' }}>
              3
            </div>
            <h4 className="text-[15px] font-semibold text-white mb-2">Service & Inspection</h4>
            <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Our experts handle your vehicle with care. Track progress in real-time.</p>
          </div>

          {/* Step 4 */}
          <div className="flex-1 min-w-[200px] max-w-[220px] text-center">
            <div className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center font-display text-[22px] tracking-wide" style={{ backgroundColor: '#111318', color: '#ff6b35', boxShadow: '0 0 0 3px #111318, 0 0 0 5px #ff6b35' }}>
              4
            </div>
            <h4 className="text-[15px] font-semibold text-white mb-2">Delivery / Report</h4>
            <p className="text-[13px] leading-relaxed max-w-[160px] mx-auto" style={{ color: '#6b7080' }}>Get your vehicle delivered or receive a detailed inspection report.</p>
          </div>
        </div>
      </section>

      {/* ════════════════ APP SECTION ════════════════ */}
      <section className="py-28 px-6 md:px-14" style={{ backgroundColor: '#08090c' }}>
        <div className="max-w-[1060px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-wide" style={{ color: '#6b7080' }}>
              <svg className="w-4 h-4" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Website & Mobile App
            </div>
            <h2 className="font-display text-[clamp(40px,5.5vw,54px)] leading-none tracking-[3px] text-white">
              Manage Everything<br />From Your Phone
            </h2>
            <p className="max-w-[440px] mt-5 mx-auto lg:mx-0 text-[15px] leading-relaxed font-light" style={{ color: '#6b7080' }}>
              Our platform lets you book services, track your vehicle's progress, view inspection reports, and manage everything — anytime, anywhere.
            </p>

            <div className="mt-8 flex flex-col gap-5 max-w-[440px] mx-auto lg:mx-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <strong className="text-sm font-semibold text-white">Easy Booking</strong>
                  <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Schedule services in just a few taps</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <strong className="text-sm font-semibold text-white">Real-time Tracking</strong>
                  <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Know exactly when your car is ready</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <strong className="text-sm font-semibold text-white">Digital Reports</strong>
                  <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Access inspection & service history</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <strong className="text-sm font-semibold text-white">Secure Payments</strong>
                  <span className="block text-[13px] mt-0.5" style={{ color: '#6b7080' }}>Pay online with full confidence</span>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap justify-center lg:justify-start gap-3">
              <button className="btn-primary text-sm px-7 py-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none" />
                </svg>
                Get Started
              </button>
              <button className="btn-secondary text-sm px-7 py-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Download App <span className="text-[11px] ml-1" style={{ color: '#6b7080' }}>(Coming Soon)</span>
              </button>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-shrink-0 relative">
            <div className="phone-glow"></div>
            <div className="w-[260px] h-[500px] rounded-[42px] relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(150deg, #161921, #0e1015)', border: '1px solid rgba(255, 255, 255, 0.07)', boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
              {/* Notch */}
              <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[76px] h-[20px] rounded-xl z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}></div>
              {/* Inner Screen */}
              <div className="absolute inset-[10px] rounded-[34px] flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(160deg, #161921 0%, #0f1117 100%)' }}>
                <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center animate-float" style={{ background: 'linear-gradient(135deg, #e8a317, #ff6b35)' }}>
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[15px] font-semibold text-white">App Preview</div>
                <div className="text-[11px] text-center max-w-[140px] leading-relaxed" style={{ color: '#6b7080' }}>Your complete car care hub in one app</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ WHY CHOOSE US ════════════════ */}
      <section id="about" className="py-28 px-6 md:px-14 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #08090c 0%, #111318 50%, #08090c 100%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(232, 163, 23, 0.06) 0%, transparent 65%)' }}></div>

        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-0.5 rounded" style={{ backgroundColor: '#e8a317' }}></span>
            <span className="text-xs font-semibold tracking-[2.5px] uppercase" style={{ color: '#e8a317' }}>Why Us</span>
          </div>
          <h2 className="font-display text-[clamp(38px,5vw,54px)] tracking-[3px] text-white">Why Choose Us?</h2>
          <p className="mt-4 text-[15px] font-light" style={{ color: '#6b7080' }}>Trusted by thousands of car owners. Quality service guaranteed.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 max-w-[920px] mx-auto relative z-10">
          {/* Stat 1 */}
          <div className="stat-card flex-1 min-w-[250px] max-w-[290px] text-center">
            <div className="w-[58px] h-[58px] mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#e8a317' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="font-display text-[46px] tracking-wide text-white">10<span style={{ color: '#e8a317' }}>+</span> Years</div>
            <div className="text-[15px] font-semibold text-white mt-2">Experience</div>
            <div className="text-[13px] mt-3 leading-relaxed" style={{ color: '#6b7080' }}>Over a decade of excellence in automobile services and customer satisfaction.</div>
          </div>

          {/* Stat 2 */}
          <div className="stat-card flex-1 min-w-[250px] max-w-[290px] text-center">
            <div className="w-[58px] h-[58px] mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(96, 165, 250, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#60a5fa' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="font-display text-[46px] tracking-wide text-white">5000<span style={{ color: '#e8a317' }}>+</span></div>
            <div className="text-[15px] font-semibold text-white mt-2">Happy Customers</div>
            <div className="text-[13px] mt-3 leading-relaxed" style={{ color: '#6b7080' }}>Happy customers who trust us with their vehicles every year.</div>
          </div>

          {/* Stat 3 */}
          <div className="stat-card flex-1 min-w-[250px] max-w-[290px] text-center">
            <div className="w-[58px] h-[58px] mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="font-display text-[46px] tracking-wide text-white">4.9</div>
            <div className="text-[15px] font-semibold text-white mt-2">Rating</div>
            <div className="text-[13px] mt-3 leading-relaxed" style={{ color: '#6b7080' }}>Consistently rated excellent by our customers for quality and service.</div>
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section id="contact" className="py-28 px-6 md:px-14 text-center relative overflow-hidden" style={{ backgroundColor: '#08090c' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(232, 163, 23, 0.07) 0%, transparent 68%)' }}></div>

        <div className="max-w-[600px] mx-auto relative z-10">
          <h2 className="font-display text-[clamp(40px,6vw,58px)] tracking-[3px] text-white">Ready to Get Started?</h2>
          <p className="text-base mt-4 leading-relaxed font-light" style={{ color: '#6b7080' }}>
            Book your service today and experience the difference. We're here to help with all your automobile needs.
          </p>
          <div className="mt-11 flex flex-wrap justify-center gap-4">
            <button className="btn-primary">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Book Now
            </button>
            <button className="btn-secondary">
              <svg className="w-5 h-5" style={{ color: '#6b7080' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us
            </button>
            <button className="btn-secondary">
              <svg className="w-5 h-5" style={{ color: '#6b7080' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Download App
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
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
    </div>
  )
}
