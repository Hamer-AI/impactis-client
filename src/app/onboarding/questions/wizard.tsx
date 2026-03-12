'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveOnboardingQuestionnaireAction } from './actions'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = { role: string }

const state: { error: string | null } = { error: null }

function normalizeRole(role: string): 'investor' | 'advisor' | 'startup' {
    const r = role.trim().toLowerCase()
    if (r === 'investor') return 'investor'
    if (r === 'advisor') return 'advisor'
    return 'startup'
}

type WizardValues = z.infer<typeof baseSchema>

function computeScore(role: 'investor' | 'advisor' | 'startup', values: WizardValues): number {
    // Simple 100pt rubric so "Skip" still shows remaining completion later.
    const weights: Array<{ key: keyof WizardValues; w: number }> =
        role === 'investor'
            ? [
                  { key: 'investing_years', w: 10 },
                  { key: 'total_investments', w: 10 },
                  { key: 'typical_check_size', w: 15 },
                  { key: 'investable_capital_12mo', w: 15 },
                  { key: 'investments_planned', w: 10 },
                  { key: 'preferred_structure', w: 10 },
                  { key: 'primary_industries', w: 15 },
                  { key: 'regions', w: 15 },
              ]
            : role === 'advisor'
                ? [
                      { key: 'business_type', w: 15 },
                      { key: 'years_consulting', w: 15 },
                      { key: 'previous_experience', w: 10 },
                      { key: 'expertise_tags', w: 20 },
                      { key: 'service_models', w: 20 },
                      { key: 'client_types', w: 20 },
                  ]
                : [
                      { key: 'company_stage', w: 15 },
                      { key: 'elevator_pitch', w: 20 },
                      { key: 'team_overview', w: 15 },
                      { key: 'target_market', w: 15 },
                      { key: 'business_model', w: 15 },
                      { key: 'traction_summary', w: 20 },
                  ]

    let score = 0
    for (const { key, w } of weights) {
        const v = values[key]
        if (typeof v === 'string' && v.trim().length > 0) {
            score += w
        }
    }
    return Math.max(0, Math.min(100, Math.round(score)))
}

const baseSchema = z.object({
    // Investor
    investing_years: z.string().optional(),
    total_investments: z.string().optional(),
    notable_exits: z.string().optional(),
    typical_check_size: z.string().optional(),
    investable_capital_12mo: z.string().optional(),
    investments_planned: z.string().optional(),
    preferred_structure: z.string().optional(),
    primary_industries: z.string().optional(),
    regions: z.string().optional(),

    // Advisor
    business_type: z.string().optional(),
    years_consulting: z.string().optional(),
    previous_experience: z.string().optional(),
    expertise_tags: z.string().optional(),
    service_models: z.string().optional(),
    client_types: z.string().optional(),

    // Startup
    company_stage: z.string().optional(),
    elevator_pitch: z.string().max(140).optional(),
    team_overview: z.string().optional(),
    target_market: z.string().optional(),
    business_model: z.string().optional(),
    traction_summary: z.string().optional(),
})

function parseCommaList(value: string | undefined): string[] {
    if (!value) return []
    return value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
}

function getRoleSchema(role: 'investor' | 'advisor' | 'startup') {
    if (role === 'investor') {
        return baseSchema
            .extend({
                investing_years: z.string().min(1, 'This is required.'),
            })
            .superRefine((values, ctx) => {
                const industries = parseCommaList(values.primary_industries)
                if (industries.length > 5) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['primary_industries'],
                        message: 'Please limit industries to 5.',
                    })
                }
            })
    }
    if (role === 'advisor') {
        return baseSchema.extend({
            business_type: z.string().min(1, 'This is required.'),
        })
    }
    return baseSchema.extend({
        company_stage: z.string().min(1, 'This is required.'),
    })
}

export default function OnboardingQuestionsWizard({ role }: Props) {
    const normalizedRole = normalizeRole(role)
    const [step, setStep] = useState(1)
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const schema = useMemo(() => getRoleSchema(normalizedRole), [normalizedRole])

    const form = useForm<WizardValues>({
        resolver: zodResolver(schema),
        defaultValues: {},
    })

    const values = form.watch()
    const score = useMemo(() => computeScore(normalizedRole, values), [normalizedRole, values])

    const totalSteps = 2
    const canSkip = step === 2

    const save = async (input: { completed: boolean; skipped: boolean }) => {
        setPending(true)
        setError(null)
        try {
            const fd = new FormData()
            fd.set('answers', JSON.stringify(values))
            fd.set('score', String(score))
            fd.set('completed', String(input.completed))
            fd.set('skipped', String(input.skipped))
            const res = await saveOnboardingQuestionnaireAction(state, fd)
            if (res?.error) {
                setError(res.error)
            }
        } finally {
            setPending(false)
        }
    }

    const title =
        normalizedRole === 'investor'
            ? 'Investor onboarding'
            : normalizedRole === 'advisor'
                ? 'Advisor onboarding'
                : 'Startup onboarding'

    const stageItems = useMemo(
        () =>
            normalizedRole === 'investor'
                ? [
                      { n: 1, label: 'Step 1', title: 'Investment experience', hint: 'How long and how many deals.' },
                      { n: 2, label: 'Step 2', title: 'Check size & capital', hint: 'Typical checks and capital for 12 months.' },
                      { n: 3, label: 'Step 3', title: 'Stage & industries', hint: 'Stages and sectors you focus on.' },
                      { n: 4, label: 'Step 4', title: 'Philosophy & value add', hint: 'How you work with founders.' },
                  ]
                : normalizedRole === 'advisor'
                    ? [
                          { n: 1, label: 'Step 1', title: 'Professional identity', hint: 'Business type and experience.' },
                          { n: 2, label: 'Step 2', title: 'Core expertise', hint: 'What you are best at.' },
                          { n: 3, label: 'Step 3', title: 'Service models', hint: 'How you work and price.' },
                          { n: 4, label: 'Step 4', title: 'Ideal clients', hint: 'Stages and types you support.' },
                      ]
                    : [
                          { n: 1, label: 'Step 1', title: 'Basics & identity', hint: 'Stage and one-line pitch.' },
                          { n: 2, label: 'Step 2', title: 'Team & market', hint: 'Team snapshot and target market.' },
                          { n: 3, label: 'Step 3', title: 'Business model', hint: 'How you make money.' },
                          { n: 4, label: 'Step 4', title: 'Traction & materials', hint: 'Progress and docs you can add later.' },
                      ],
        [normalizedRole],
    )

    return (
        <section className="w-full">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                    {/* Left milestone rail */}
                    <aside className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-emerald-50 via-white to-white p-8 dark:border-slate-800 dark:from-emerald-500/10 dark:via-slate-950 dark:to-slate-950 lg:border-b-0 lg:border-r">
                        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/10" />
                        <div className="relative">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                                        {title}
                                    </h2>
                                    <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Get set up in two quick steps.
                                    </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
                                    {score}/100
                                </Badge>
                            </div>

                            <div className="mt-8 space-y-5 relative">
                                {/* Longer vertical connector line */}
                                <div className="absolute left-4 top-10 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
                                {stageItems.map((item) => {
                                    const active = step === item.n
                                    const done = step > item.n
                                    return (
                                        <div key={item.n} className="relative flex gap-3">
                                            <div
                                                className={[
                                                    'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black',
                                                    done
                                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                                        : active
                                                            ? 'border-[#0B3D2E] bg-white text-[#0B3D2E] dark:border-emerald-500/60 dark:bg-slate-950 dark:text-emerald-200'
                                                            : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400',
                                                ].join(' ')}
                                            >
                                                {item.n}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                    {item.label}
                                                </p>
                                                <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-slate-100">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    {item.hint}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Right content */}
                    <div className="p-8 lg:p-10">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                                    {step === 1 ? 'Create your profile baseline' : 'Set your preferences'}
                                </h3>
                                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {step === 1
                                        ? 'This is required to personalize your workspace.'
                                        : 'You can skip this step and complete it later from Profile.'}
                                </p>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-900 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-200">
                                Step {step}/{totalSteps}
                            </Badge>
                        </div>

                        <div className="mt-8">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(async () => {
                                        if (step === 1) {
                                            const ok = await form.trigger()
                                            if (!ok) return
                                            setStep(2)
                                            return
                                        }
                                        await save({ completed: true, skipped: false })
                                    })}
                                    className="space-y-6"
                                >
                            {normalizedRole === 'investor' ? (
                                <>
                                    {step === 1 ? (
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="investing_years"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>How long have you been investing?</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. 1-3 yrs" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="total_investments"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Total startup investments made</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. 6-15" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="notable_exits"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel>Notable exits (optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Names / returns (optional)" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : step === 2 ? (
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="typical_check_size"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Typical check size</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="$5K – $10M+" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="investable_capital_12mo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Total investable capital (12mo)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Under $100K – $50M+" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="investments_planned"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Investments planned</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. 3-5" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="preferred_structure"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Preferred structure</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Equity, SAFE, Note..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : null}
                                </>
                            ) : normalizedRole === 'advisor' ? (
                                <>
                                    {step === 1 ? (
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="business_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Business type</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Independent, Boutique..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="years_consulting"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Years in consulting</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="2-5 yrs, 10-20 yrs..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="previous_experience"
                                                render={({ field }) => (
                                                    <FormItem className="sm:col-span-2">
                                                        <FormLabel>Previous experience</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Former Founder, VC, Exec..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : step === 2 ? (
                                        <div className="grid gap-5">
                                            <FormField
                                                control={form.control}
                                                name="expertise_tags"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expertise tags</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Go-to-market, Hiring, Finance..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="service_models"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Service delivery models</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Strategic consulting, Fractional..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    {step === 1 ? (
                                        <div className="grid gap-5">
                                            <FormField
                                                control={form.control}
                                                name="company_stage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Company stage</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Pre-seed, Seed, Series A..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="elevator_pitch"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Elevator pitch (max 140 chars)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="One sentence pitch..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : step === 2 ? (
                                        <div className="grid gap-5">
                                            <FormField
                                                control={form.control}
                                                name="team_overview"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Team overview</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Founders + key roles..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="target_market"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Target market</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Who do you sell to?" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ) : null}
                                </>
                            )}

                            {error ? (
                                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                    {error}
                                </p>
                            ) : null}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex gap-3">
                                    {step > 1 ? (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setStep((s) => Math.max(1, s - 1))}
                                            disabled={pending}
                                        >
                                            Back
                                        </Button>
                                    ) : null}
                                    {canSkip ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => save({ completed: false, skipped: true })}
                                            disabled={pending}
                                        >
                                            Skip for now
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="flex gap-3 sm:justify-end">
                                    <Button type="submit" disabled={pending}>
                                        {step < totalSteps ? 'Continue' : 'Finish & continue'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

