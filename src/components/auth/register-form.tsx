"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginPurpose {
    id: string
    name: string
    description: string | null
}

export function RegisterForm() {
    const [loginPurposes, setLoginPurposes] = useState<LoginPurpose[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            password: "",
            confirmPassword: "",
            role: "CLIENT",
            purposeOfLoginId: "",
            dealerBusinessName: "",
            dealerGstNumber: "",
            dealerCity: "",
            dealerState: "",
            dealerBankName: "",
            dealerAccountNum: "",
            dealerIfscCode: "",
        },
    })

    const role = form.watch("role")

    const router = useRouter()

    // Fetch login purposes on component mount
    useEffect(() => {
        async function fetchLoginPurposes() {
            try {
                const response = await fetch("/api/login-purposes")
                if (response.ok) {
                    const data = await response.json()
                    setLoginPurposes(data.purposes || [])
                }
            } catch (error) {
                console.error("Failed to fetch login purposes:", error)
            }
        }
        fetchLoginPurposes()
    }, [])

    async function onSubmit(data: RegisterValues) {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || "Registration failed")
                return
            }

            // Check if OTP verification is required
            if (result.requiresOTP) {
                // Redirect to OTP verification page
                router.push(`/verify-otp?userId=${result.userId}`)
            } else {
                // No OTP required, show success message
                alert("Registration successful! Please wait for admin approval. You will receive an email notification once approved.")
                router.push("/login")
            }

        } catch (error) {
            console.error(error)
            setError(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                    Enter your information to get started. Your account will be activated after admin approval.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 8900" {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CLIENT">Client</SelectItem>
                                                <SelectItem value="DEALER">Dealer</SelectItem>
                                                <SelectItem value="AGENT">Agent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="purposeOfLoginId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose of Login <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                <SelectValue placeholder="Select purpose of login" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loginPurposes.length === 0 ? (
                                                <SelectItem value="none" disabled>No purposes available</SelectItem>
                                            ) : (
                                                loginPurposes.map((purpose) => (
                                                    <SelectItem key={purpose.id} value={purpose.id}>
                                                        {purpose.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {role === "DEALER" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-300">
                                <div className="p-4 bg-[#e8a317]/5 border border-[#e8a317]/20 rounded-xl mb-2">
                                    <h3 className="text-sm font-bold text-[#e8a317] uppercase tracking-wider">Dealer Business Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerBusinessName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business / Agency Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Super Car Dealers Pvt Ltd" {...field} className="bg-white/5 border-white/10 text-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerGstNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST Number <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="22AAAAA0000A1Z5" {...field} className="bg-white/5 border-white/10 text-white font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerCity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Mumbai" {...field} className="bg-white/5 border-white/10 text-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Maharashtra" {...field} className="bg-white/5 border-white/10 text-white" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl my-4">
                                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Bank Details (For Payouts)</h3>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="dealerBankName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="HDFC Bank" {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dealerAccountNum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="000123456789" {...field} className="bg-white/5 border-white/10 text-white font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dealerIfscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IFSC Code <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HDFC0000123" {...field} className="bg-white/5 border-white/10 text-white font-mono" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#e8a317] text-black hover:bg-[#d49510] transition-colors mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-400 pb-8">
                Already have an account? <a href="/login" className="ml-1 text-[#e8a317] hover:underline font-medium">Sign in</a>
            </CardFooter>
        </Card >
    )
}
