'use client'

import { z } from 'zod'
import type { StepConfig } from '../OnboardingWizard'
import { startupOnboardingSchema, STARTUP_STAGE_OPTIONS, SECTORS, type StartupOnboardingValues } from '@/modules/onboarding/startup'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const inputClass = 'min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-[#0B3D2E] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const labelClass = 'text-base font-bold'

function SelectField(input: {
    label: string
    name: keyof StartupOnboardingValues
    options: readonly string[]
    form: any
}) {
    return (
        <FormField
            control={input.form.control}
            name={input.name as any}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className={labelClass}>{input.label}</FormLabel>
                    <FormControl>
                        <select
                            className={inputClass}
                            value={(field.value as any) ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            {input.options.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const step1Schema = startupOnboardingSchema.pick({
    companyName: true,
    websiteUrl: true,
    companyStage: true,
    industry: true,
    countryOfIncorporation: true,
})
const step2Schema = startupOnboardingSchema.pick({
    elevatorPitch: true,
    problemStatement: true,
    solution: true,
    uniqueValueProposition: true,
})
const step3Schema = startupOnboardingSchema.pick({
    tam: true,
    sam: true,
    som: true,
    marketUnit: true,
    competitiveLandscape: true,
})
const step4Schema = startupOnboardingSchema.pick({
    waitlistSize: true,
    betaTesters: true,
    userGrowthMomPercent: true,
    lettersOfIntent: true,
    mrrUsd: true,
    momGrowthPercent: true,
    cacUsd: true,
    ltvUsd: true,
    churnRatePercent: true,
    totalCustomers: true,
})
const step5Schema = startupOnboardingSchema.pick({
    numberOfFounders: true,
    teamEngineering: true,
    teamSales: true,
    teamMarketing: true,
    teamOperations: true,
    teamDesign: true,
    teamOther: true,
})
const step6Schema = startupOnboardingSchema.pick({
    fundingRoundType: true,
    amountRaisingUsd: true,
    amountCommittedUsd: true,
})

export function getStartupSteps(): Array<StepConfig<StartupOnboardingValues>> {
    return [
        {
            id: 'startup-step-1',
            label: 'Basics',
            schema: step1Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['companyName', 'companyStage', 'industry', 'countryOfIncorporation', 'websiteUrl'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel className={labelClass}>Company Name</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="Your company name" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="websiteUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={labelClass}>Website URL (optional)</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="https://..." {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SelectField form={form} name="companyStage" label="Company Stage" options={STARTUP_STAGE_OPTIONS} />
                        <SelectField form={form} name="industry" label="Industry" options={SECTORS} />
                        <FormField
                            control={form.control}
                            name="countryOfIncorporation"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel className={labelClass}>Country of Incorporation</FormLabel>
                                    <FormControl>
                                        <Input className={inputClass} placeholder="e.g. Ethiopia" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'startup-step-2',
            label: 'Pitch',
            schema: step2Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['elevatorPitch', 'problemStatement', 'solution', 'uniqueValueProposition'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-5">
                        <FormField
                            control={form.control}
                            name="elevatorPitch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Elevator Pitch (max 140)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="We help [who] do [what] by [how]." {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="problemStatement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Problem Statement (max 500)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="solution"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Solution (max 500)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="uniqueValueProposition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unique Value Proposition</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1 sentence" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'startup-step-3',
            label: 'Market',
            schema: step3Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['tam', 'sam', 'som', 'marketUnit', 'competitiveLandscape'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="tam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>TAM</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" placeholder="0" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SAM</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" placeholder="0" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="som"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SOM</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" placeholder="0" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <SelectField form={form} name="marketUnit" label="Unit" options={['$M', '$B']} />
                        <FormField
                            control={form.control}
                            name="competitiveLandscape"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Competitive Landscape</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Top 3 competitors..." {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'startup-step-4',
            label: 'Traction',
            schema: step4Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['waitlistSize', 'betaTesters', 'userGrowthMomPercent', 'lettersOfIntent', 'mrrUsd', 'momGrowthPercent', 'cacUsd', 'ltvUsd', 'churnRatePercent', 'totalCustomers'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField control={form.control} name="waitlistSize" render={({ field }) => (
                            <FormItem><FormLabel>Waitlist Size</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="betaTesters" render={({ field }) => (
                            <FormItem><FormLabel>Beta Testers</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="userGrowthMomPercent" render={({ field }) => (
                            <FormItem><FormLabel>User Growth (MoM %)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="lettersOfIntent" render={({ field }) => (
                            <FormItem><FormLabel>Letters of Intent</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="mrrUsd" render={({ field }) => (
                            <FormItem><FormLabel>MRR ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="momGrowthPercent" render={({ field }) => (
                            <FormItem><FormLabel>MoM Growth (%)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="cacUsd" render={({ field }) => (
                            <FormItem><FormLabel>CAC ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="ltvUsd" render={({ field }) => (
                            <FormItem><FormLabel>LTV ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="churnRatePercent" render={({ field }) => (
                            <FormItem><FormLabel>Churn Rate (%)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="totalCustomers" render={({ field }) => (
                            <FormItem><FormLabel>Total Customers</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                    </div>
                </Form>
            ),
        },
        {
            id: 'startup-step-5',
            label: 'Team',
            schema: step5Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['numberOfFounders', 'teamEngineering', 'teamSales', 'teamMarketing', 'teamOperations', 'teamDesign', 'teamOther'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField control={form.control} name="numberOfFounders" render={({ field }) => (
                            <FormItem className="sm:col-span-2"><FormLabel>Number of Founders</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                        )} />
                        {[
                            { k: 'teamEngineering', l: 'Engineering' },
                            { k: 'teamSales', l: 'Sales' },
                            { k: 'teamMarketing', l: 'Marketing' },
                            { k: 'teamOperations', l: 'Operations' },
                            { k: 'teamDesign', l: 'Design' },
                            { k: 'teamOther', l: 'Other' },
                        ].map((row) => (
                            <FormField
                                key={row.k}
                                control={form.control}
                                name={row.k as any}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{row.l} headcount</FormLabel>
                                        <FormControl>
                                            <Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </Form>
            ),
        },
        {
            id: 'startup-step-6',
            label: 'Ask',
            schema: step6Schema as unknown as z.ZodSchema<StartupOnboardingValues>,
            fields: ['fundingRoundType', 'amountRaisingUsd', 'amountCommittedUsd'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="fundingRoundType"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Funding Round Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seed, SAFE, Note..." {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amountRaisingUsd"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount Raising ($)</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amountCommittedUsd"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount Already Committed ($)</FormLabel>
                                    <FormControl>
                                        <Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
    ]
}

