'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { updatePasswordSchema, type UpdatePasswordFormValues } from '@/schemas/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export default function UpdatePasswordPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<UpdatePasswordFormValues>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { password: '', confirmPassword: '' },
    })

    const onSubmit = async (values: UpdatePasswordFormValues) => {
        const token = new URLSearchParams(window.location.search).get('token')
        if (!token) {
            toast.error('Reset token is missing or invalid.')
            return
        }
        setIsLoading(true)
        try {
            const { error } = await authClient.resetPassword({
                newPassword: values.password,
                token,
            })
            if (error) {
                toast.error(error.message ?? 'Unable to reset password.')
                return
            }
            toast.success('Password updated. Please sign in.')
            router.push('/auth/login')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-20">
            <section className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <h1 className="text-2xl font-black text-gray-900">Set New Password</h1>
                <p className="mt-3 text-gray-600">Choose a new password for your account.</p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Minimum 8 characters"
                                                className="pr-12 px-4 py-3"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((c) => !c)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Repeat password"
                                                className="pr-12 px-4 py-3"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((c) => !c)}
                                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-[#0B3D2E] px-5 py-3 font-semibold text-white transition hover:bg-[#082a20] disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </Form>

                <div className="mt-6 text-center">
                    <Link href="/auth/login" className="font-semibold text-[#0B3D2E] hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </section>
        </main>
    )
}
