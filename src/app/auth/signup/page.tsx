'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import {
    buildSignupMetadata,
    getPostSignupRedirectPath,
    getSignupRoleFromSearchParams,
    sanitizeNextPath,
} from '@/modules/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Rocket, TrendingUp, Briefcase, Check, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { signupSchema, verifyEmailSchema, type SignupFormValues, type VerifyEmailFormValues } from '@/schemas/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const roles = [
    { id: 'founder', title: 'Founder', icon: Rocket, description: 'Raising capital or seeking strategic partners.' },
    { id: 'investor', title: 'Investor', icon: TrendingUp, description: 'Seeking high-impact investment opportunities.' },
    { id: 'advisor', title: 'Advisor', icon: Briefcase, description: 'Providing expert professional advisory services.' },
]

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAACd7X251ebzrdbGy'
// Always require the Cloudflare Turnstile security check (even in dev).
const CAPTCHA_REQUIRED = true

export default function SignupPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [nextPath, setNextPath] = useState<string | null>(null)
    const [emailForVerify, setEmailForVerify] = useState('')
    const router = useRouter()

    const signupForm = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { role: undefined, email: '', password: '', fullName: '' },
    })
    const verifyForm = useForm<VerifyEmailFormValues>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: { otpCode: '' },
    })

    const roleValue = signupForm.watch('role')

    useEffect(() => {
        const query = new URLSearchParams(window.location.search)
        const roleFromSearch = getSignupRoleFromSearchParams(query)
        setNextPath(sanitizeNextPath(query.get('next')))
        if (roleFromSearch) {
            signupForm.setValue('role', roleFromSearch as SignupFormValues['role'])
            setStep(2)
        }
    }, [signupForm])

    const onSignupSubmit = async (values: SignupFormValues) => {
        if (!values.role) {
            toast.error('Please select your role first.')
            setStep(1)
            return
        }
        if (CAPTCHA_REQUIRED && !captchaToken) {
            toast.error('Please complete the security check.')
            return
        }
        setIsLoading(true)
        try {
            const queryNextPath = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'))
            const resolvedNextPath = nextPath ?? queryNextPath
            const origin = typeof window !== 'undefined' ? window.location.origin : ''
            const fallbackPath = getPostSignupRedirectPath(null)
            const callbackPath = resolvedNextPath ?? fallbackPath
            const callbackURL =
                callbackPath.startsWith('http://') || callbackPath.startsWith('https://')
                    ? callbackPath
                    : origin
                        ? `${origin}${callbackPath}`
                        : callbackPath
            const metadata = buildSignupMetadata({
                fullName: values.fullName,
                role: values.role as string,
            })
            const { data: betterAuthData, error: betterAuthError } = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.fullName,
                callbackURL,
                raw_user_meta_data: JSON.stringify(metadata),
                fetchOptions: {
                    headers: {
                        ...(captchaToken ? { 'x-captcha-response': captchaToken } : {}),
                    },
                },
            } as any)
            if (betterAuthError || !betterAuthData) {
                toast.error(betterAuthError?.message ?? 'Unable to create account')
                setCaptchaResetSignal((c) => c + 1)
                return
            }
            setEmailForVerify(values.email)
            toast.success('Account created! Please enter the 6-digit code sent to your email.')
            setStep(3)
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const onVerifySubmit = async (values: VerifyEmailFormValues) => {
        setIsLoading(true)
        try {
            const { data, error } = await authClient.emailOtp.verifyEmail({
                email: emailForVerify,
                otp: values.otpCode,
            } as any)
            if (error || !data) {
                toast.error(error?.message ?? 'Invalid or expired verification code')
                return
            }
            toast.success('Successfully verified. Redirecting to login...')
            const queryNextPath = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'))
            const loginPath = queryNextPath
                ? `/auth/login?registered=true&next=${encodeURIComponent(queryNextPath)}`
                : '/auth/login?registered=true'
            router.push(loginPath)
        } catch {
            toast.error('An unexpected error occurred during verification')
        } finally {
            setIsLoading(false)
        }
    }

    const isCreateDisabled =
        isLoading ||
        (CAPTCHA_REQUIRED && !captchaToken) ||
        !signupForm.formState.isValid

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full">
                <div className="text-center mb-10">
                    <Link href="/" className="text-4xl font-black text-[#0B3D2E] tracking-tighter">
                        Impactis
                    </Link>
                </div>

                <div className="mb-12 flex justify-between items-center px-4">
                    {[1, 2].map((num) => (
                        <div key={num} className="flex items-center flex-1 last:flex-none">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                                    step >= num ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]' : 'bg-white text-gray-400 border-gray-200'
                                }`}
                            >
                                {step > num ? <Check className="w-5 h-5" /> : num}
                            </div>
                            {num < 2 ? (
                                <div className={`flex-1 h-0.5 mx-4 ${step > num ? 'bg-[#0B3D2E]' : 'bg-gray-200'}`} />
                            ) : null}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
                    {step === 3 ? (
                        <Form {...verifyForm}>
                            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Check your email</h2>
                                    <p className="mt-2 text-gray-500 font-medium tracking-tight">
                                        We sent a 6-digit code to <span className="text-[#0B3D2E] font-bold">{emailForVerify}</span>
                                    </p>
                                </div>
                                <FormField
                                    control={verifyForm.control}
                                    name="otpCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1 text-center">Verification Code</FormLabel>
                                            <FormControl>
                                                <div className="flex justify-center">
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={field.value}
                                                        onChange={(value) => field.onChange(value.replace(/[^0-9]/g, ''))}
                                                        inputMode="numeric"
                                                        autoFocus
                                                    >
                                                        <InputOTPGroup>
                                                            {Array.from({ length: 6 }).map((_, idx) => (
                                                                <InputOTPSlot key={idx} index={idx} />
                                                            ))}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-center text-sm text-gray-500">
                                    Enter the 6-digit code from your email above, then click below.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-2xl bg-[#0B3D2E] text-white font-black text-lg hover:shadow-xl hover:shadow-green-900/20 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>
                        </Form>
                    ) : step === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">How will you participate?</h2>
                                <p className="mt-2 text-gray-500 font-medium tracking-tight">Select your primary role in the ecosystem.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => {
                                            signupForm.setValue('role', role.id as SignupFormValues['role'])
                                            setStep(2)
                                        }}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                                            roleValue === role.id ? 'border-[#0B3D2E] bg-green-50' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                                    roleValue === role.id
                                                        ? 'bg-[#0B3D2E] text-white'
                                                        : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                                }`}
                                            >
                                                <role.icon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900">{role.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create your account</h2>
                                    <p className="mt-2 text-gray-500 font-medium tracking-tight">
                                        You selected{' '}
                                        <span className="text-[#0B3D2E] font-bold capitalize">{roleValue ?? ''}</span>
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <FormField
                                        control={signupForm.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-400 uppercase tracking-widest">Full Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <Input
                                                            className="w-full pl-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/90 text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#0B3D2E] outline-none transition dark:bg-gray-50 dark:text-gray-900 dark:border-gray-200"
                                                            placeholder="John Doe"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <Input
                                                            type="email"
                                                            className="w-full pl-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/90 text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#0B3D2E] outline-none transition dark:bg-gray-50 dark:text-gray-900 dark:border-gray-200"
                                                            placeholder="john@example.com"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={signupForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-gray-400 uppercase tracking-widest">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 bg-gray-50/90 text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#0B3D2E] outline-none transition dark:bg-gray-50 dark:text-gray-900 dark:border-gray-200"
                                                            placeholder="Minimum 8 characters"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword((c) => !c)}
                                                            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {CAPTCHA_REQUIRED ? (
                                    <TurnstileWidget
                                        siteKey={TURNSTILE_SITE_KEY}
                                        onTokenChange={setCaptchaToken}
                                        resetSignal={captchaResetSignal}
                                        className="flex justify-center"
                                    />
                                ) : (
                                    <p className="text-center text-sm text-gray-500">Security check skipped in development.</p>
                                )}
                                <div className="flex space-x-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreateDisabled}
                                        className="flex-[2] py-4 rounded-2xl bg-[#0B3D2E] text-white font-black text-lg hover:shadow-xl hover:shadow-green-900/20 transition disabled:opacity-50"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </Form>
                    )}

                    <div className="mt-10 text-center">
                        <p className="text-gray-400 font-medium">
                            Already part of the network?{' '}
                            <Link
                                href={(() => {
                                    if (!nextPath) {
                                        return '/auth/login'
                                    }

                                    return `/auth/login?next=${encodeURIComponent(nextPath)}`
                                })()}
                                className="text-[#0B3D2E] font-bold hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
