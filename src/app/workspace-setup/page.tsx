import { redirect } from 'next/navigation'
import { getOnboardingQuestionsPath } from '@/modules/onboarding'

export default async function WorkspaceSetupPage() {
    redirect(getOnboardingQuestionsPath())
}
