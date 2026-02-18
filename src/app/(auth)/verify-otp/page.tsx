"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ShieldCheck, Mail, Smartphone, ArrowLeft, RefreshCw, Loader2 } from "lucide-react"

function VerifyOTPContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get("userId")

    const [emailOTP, setEmailOTP] = useState("")
    const [mobileOTP, setMobileOTP] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [otpSettings, setOTPSettings] = useState({ emailOTPEnabled: true, mobileOTPEnabled: false })
    const [timer, setTimer] = useState(600) // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        if (!userId) {
            router.push("/register")
            return
        }

        // Fetch OTP settings
        async function fetchOTPSettings() {
            try {
                const response = await fetch("/api/settings/otp")
                if (response.ok) {
                    const data = await response.json()
                    setOTPSettings(data.settings || { emailOTPEnabled: true, mobileOTPEnabled: false })
                }
            } catch (error) {
                console.error("Failed to fetch OTP settings:", error)
            }
        }
        fetchOTPSettings()
    }, [userId, router])

    // Countdown timer
    useEffect(() => {
        if (timer > 0 && !success) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [timer, success])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    async function handleVerify() {
        if (!userId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    emailOTP: otpSettings.emailOTPEnabled ? emailOTP : undefined,
                    mobileOTP: otpSettings.mobileOTPEnabled ? mobileOTP : undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Verification failed")
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResend(type: "EMAIL" | "MOBILE") {
        if (!userId) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, type }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Failed to resend OTP")
                return
            }

            setTimer(600) // Reset timer
            setCanResend(false)
            alert("OTP resent successfully!")

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Failed to resend OTP")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-[#08090c]">
                <div className="relative w-full max-w-md">
                    {/* Glowing effect */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-30 blur-xl animate-pulse" />

                    <Card className="relative w-full border-green-500/30 bg-[#111318] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/50 animate-bounce">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                Verification Successful!
                            </CardTitle>
                            <CardDescription className="text-lg pt-2 text-gray-400">
                                Your account has been securely verified.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-8 space-y-4">
                            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                                <p className="text-sm text-green-400">
                                    Please wait for admin approval before logging in. You will receive an email once approved.
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Redirecting to login...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#08090c]">
            <div className="relative w-full max-w-md">
                {/* Background Glow */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 opacity-50 blur-xl" />

                <Card className="relative w-full border-white/10 bg-[#111318] shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <ShieldCheck className="h-6 w-6 text-amber-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            Verify Your Account
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter the OTP code sent to your device
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                <ShieldCheck className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        {otpSettings.emailOTPEnabled && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-amber-500" /> Email OTP
                                    </label>
                                    {canResend && (
                                        <button
                                            onClick={() => handleResend("EMAIL")}
                                            className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className="h-3 w-3" /> Resend
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={emailOTP}
                                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-black/40 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all text-white placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        {otpSettings.mobileOTPEnabled && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-amber-500" /> Mobile OTP
                                    </label>
                                    {canResend && (
                                        <button
                                            onClick={() => handleResend("MOBILE")}
                                            className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className="h-3 w-3" /> Resend
                                        </button>
                                    )}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="• • • • • •"
                                    value={mobileOTP}
                                    onChange={(e) => setMobileOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-black/40 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all text-white placeholder:text-gray-700"
                                />
                            </div>
                        )}

                        <div className="text-center">
                            {timer > 0 ? (
                                <p className="text-sm text-gray-400 bg-white/5 py-1.5 px-3 rounded-full inline-block">
                                    Expires in <span className="font-mono font-medium text-amber-500 w-12 inline-block">{formatTime(timer)}</span>
                                </p>
                            ) : (
                                <p className="text-sm text-red-500 font-medium">OTP expired</p>
                            )}
                        </div>

                        <Button
                            onClick={handleVerify}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold text-base shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading || timer === 0}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying...
                                </div>
                            ) : "Verify Account"}
                        </Button>

                        <div className="text-center pt-2">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Login
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#08090c] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#e8a317]" />
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    )
}
