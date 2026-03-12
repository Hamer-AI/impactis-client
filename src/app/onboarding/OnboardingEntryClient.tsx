'use client'

import type { OnboardingRole } from '@/modules/onboarding/store'
import { OnboardingWizard } from './OnboardingWizard'
import { getInvestorSteps } from './investor/steps'
import type { InvestorOnboardingValues } from '@/modules/onboarding/investor'
import { getStartupSteps } from './startup/steps'
import type { StartupOnboardingValues } from '@/modules/onboarding/startup'
import { getAdvisorSteps } from './advisor/steps'
import type { AdvisorOnboardingValues } from '@/modules/onboarding/advisor'

type Props = {
    role: string
    initialStep: number
    initialValues: Record<string, unknown>
}

export function OnboardingEntryClient({ role, initialStep, initialValues }: Props) {
    const normalizedRole = (role as OnboardingRole) || 'startup'

    if (normalizedRole === 'investor') {
        return (
            <OnboardingWizard<InvestorOnboardingValues>
                role="investor"
                steps={getInvestorSteps()}
                initialStep={initialStep}
                initialValues={initialValues as Partial<InvestorOnboardingValues>}
            />
        )
    }

    if (normalizedRole === 'startup') {
        return (
            <OnboardingWizard<StartupOnboardingValues>
                role="startup"
                steps={getStartupSteps()}
                initialStep={initialStep}
                initialValues={initialValues as Partial<StartupOnboardingValues>}
            />
        )
    }

    return (
        <OnboardingWizard<AdvisorOnboardingValues>
            role="advisor"
            steps={getAdvisorSteps()}
            initialStep={initialStep}
            initialValues={initialValues as Partial<AdvisorOnboardingValues>}
        />
    )
}

