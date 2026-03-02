'use client'

import { Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type ReadinessRulesSectionProps = {
    startupReadiness: {
        profile_completion_percent?: number
        readiness_score?: number
        required_docs_uploaded?: boolean
        section_scores?: Array<{
            section: string
            weight: number
            completion_percent: number
            score_contribution: number
        }>
        missing_steps?: string[]
    } | null
    readinessSectionLabelMap: Record<string, string>
    isLight: boolean
    labelClass: string
    textMainClass: string
    textMutedClass: string
    titleMutedClass: string
    mutedPanelClass: string
}

const DEFAULT_READINESS_SECTION_SCORES = [
    { section: 'team', weight: 15, completion_percent: 0, score_contribution: 0 },
    { section: 'product', weight: 20, completion_percent: 0, score_contribution: 0 },
    { section: 'market', weight: 15, completion_percent: 0, score_contribution: 0 },
    { section: 'traction', weight: 20, completion_percent: 0, score_contribution: 0 },
    { section: 'financials', weight: 10, completion_percent: 0, score_contribution: 0 },
    { section: 'legal', weight: 10, completion_percent: 0, score_contribution: 0 },
    { section: 'pitch_materials', weight: 10, completion_percent: 0, score_contribution: 0 },
]

function toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ReadinessRulesSection(input: ReadinessRulesSectionProps) {
    const {
        startupReadiness,
        readinessSectionLabelMap,
        isLight,
        labelClass,
        textMainClass,
        textMutedClass,
        titleMutedClass,
        mutedPanelClass
    } = input

    const hasReadinessSnapshot = Boolean(startupReadiness)
    const profileCompletionPercent = startupReadiness?.profile_completion_percent ?? null
    const readinessScore = startupReadiness?.readiness_score ?? null
    const requiredDocsUploaded = startupReadiness?.required_docs_uploaded ?? null
    const missingSteps = startupReadiness?.missing_steps ?? []
    const sectionScores = (startupReadiness?.section_scores?.length ?? 0) > 0
        ? startupReadiness?.section_scores ?? []
        : DEFAULT_READINESS_SECTION_SCORES

    const missingStepLabelMap: Record<string, string> = {
        upload_pitch_deck: 'Upload a pitch deck in Investor Data Room',
        add_team_info: 'Add team overview and team size',
        upload_financial_doc: 'Upload at least one financial document in Investor Data Room',
        upload_legal_doc: 'Upload at least one legal document in Investor Data Room',
        complete_profile_70: 'Reach profile completion of at least 70%',
        reach_score_60: 'Reach readiness score of at least 60%',
        upload_required_docs: 'Ensure pitch, financial, and legal documents all exist in Investor Data Room',
    }

    return (
        <div id="settings-readiness-rules" className={`rounded-3xl border p-6 ${mutedPanelClass} shadow-xl backdrop-blur-2xl`}>
            <div className="mb-8 flex items-center gap-3">
                <div className={`rounded-xl border p-2 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <Settings2 className="h-4 w-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                </div>
                <div>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${labelClass}`}>Readiness Qualification Rules</p>
                    <p className={`text-[11px] font-bold ${textMutedClass}`}>Discovery eligibility passes only when every active gate is satisfied.</p>
                </div>
            </div>

            <div className="divide-y divide-slate-200/5">
                {/* Core Thresholds Row */}
                <div className="grid gap-4 py-8 md:grid-cols-3 md:gap-8 first:pt-0">
                    <div className="md:col-span-1">
                        <label className={`mb-1.5 block text-xs font-black uppercase tracking-[0.14em] ${labelClass}`}>
                            Core Thresholds
                        </label>
                        <p className={`text-sm font-medium leading-relaxed ${textMutedClass}`}>
                            Exact discovery gates from the startup readiness engine.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <div className="grid gap-3 max-w-xl">
                            <div className={`rounded-2xl border p-4 ${mutedPanelClass}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className={`text-sm font-black ${textMainClass}`}>Profile Completion</p>
                                        <p className={`text-[11px] font-bold ${textMutedClass}`}>Rule: profile_completion_percent &gt;= 70</p>
                                    </div>
                                    <Badge
                                        variant={!hasReadinessSnapshot ? 'secondary' : (profileCompletionPercent ?? 0) >= 70 ? 'success' : 'warning'}
                                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        {profileCompletionPercent === null ? 'N/A' : `${profileCompletionPercent}%`}
                                    </Badge>
                                </div>
                            </div>
                            <div className={`rounded-2xl border p-4 ${mutedPanelClass}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className={`text-sm font-black ${textMainClass}`}>Readiness Score</p>
                                        <p className={`text-[11px] font-bold ${textMutedClass}`}>Rule: readiness_score &gt;= 60</p>
                                    </div>
                                    <Badge
                                        variant={!hasReadinessSnapshot ? 'secondary' : (readinessScore ?? 0) >= 60 ? 'success' : 'warning'}
                                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        {readinessScore === null ? 'N/A' : `${readinessScore}%`}
                                    </Badge>
                                </div>
                            </div>
                            <div className={`rounded-2xl border p-4 ${mutedPanelClass}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className={`text-sm font-black ${textMainClass}`}>Required Documents</p>
                                        <p className={`text-[11px] font-bold ${textMutedClass}`}>Rule: pitch, financial, and legal docs all exist</p>
                                    </div>
                                    <Badge
                                        variant={!hasReadinessSnapshot ? 'secondary' : requiredDocsUploaded ? 'success' : 'warning'}
                                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter"
                                    >
                                        {!hasReadinessSnapshot ? 'N/A' : requiredDocsUploaded ? 'Complete' : 'Missing'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Breakdown Row */}
                <div className="grid gap-4 py-8 md:grid-cols-3 md:gap-8">
                    <div className="md:col-span-1">
                        <label className={`mb-1.5 block text-xs font-black uppercase tracking-[0.14em] ${labelClass}`}>
                            Section Breakdown
                        </label>
                        <p className={`text-sm font-medium leading-relaxed ${textMutedClass}`}>
                            Weighted scoring model used by readiness_score.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        {!hasReadinessSnapshot ? (
                            <p className={`mb-3 text-[11px] font-bold ${titleMutedClass}`}>
                                No readiness snapshot yet. Weights below are the active rule definition.
                            </p>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
                            {sectionScores.map((section) => (
                                <div key={section.section} className={`rounded-2xl border p-4 transition-all hover:bg-slate-50/50 ${mutedPanelClass}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className={`text-xs font-black uppercase tracking-tight ${textMainClass}`}>
                                            {readinessSectionLabelMap[section.section] ?? toTitleCase(section.section.replace(/_/g, ' '))}
                                        </p>
                                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-black uppercase tracking-widest border-slate-200">
                                            {section.weight}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-base font-black ${textMainClass}`}>
                                            {hasReadinessSnapshot ? `${section.completion_percent}%` : '--'}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${textMutedClass}`}>Completion</span>
                                    </div>
                                    <p className={`mt-1 text-[11px] font-bold ${textMutedClass}`}>
                                        Contribution: <span className={textMainClass}>{hasReadinessSnapshot ? `${section.score_contribution} pts` : '--'}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Blocking Logic Row */}
                <div className="grid gap-4 py-8 md:grid-cols-3 md:gap-8">
                    <div className="md:col-span-1">
                        <label className={`mb-1.5 block text-xs font-black uppercase tracking-[0.14em] ${labelClass}`}>
                            Missing Steps
                        </label>
                        <p className={`text-sm font-medium leading-relaxed ${textMutedClass}`}>
                            Live gap list from startup_readiness.missing_steps.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        {!hasReadinessSnapshot ? (
                            <div className={`rounded-2xl border p-5 max-w-xl ${mutedPanelClass}`}>
                                <p className={`text-sm font-bold ${textMutedClass}`}>
                                    No readiness snapshot is available yet.
                                </p>
                            </div>
                        ) : missingSteps.length === 0 ? (
                            <div className={`rounded-2xl border p-5 max-w-xl ${mutedPanelClass}`}>
                                <p className="text-sm font-bold text-emerald-600">
                                    All qualification requirements are currently satisfied.
                                </p>
                            </div>
                        ) : (
                            <div className={`rounded-2xl border border-amber-200/50 bg-amber-50/20 p-5 max-w-xl`}>
                                <div className="space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">Current Blocks</p>
                                    <div className="flex flex-wrap gap-2">
                                        {missingSteps.map((step: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="bg-white/80 text-amber-700 border-amber-200 text-[10px] font-black uppercase">
                                                {(missingStepLabelMap[step] ?? step.replace(/_/g, ' '))}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
