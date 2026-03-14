export type UserProfile = {
    id: string
    full_name: string | null
    location: string | null
    bio: string | null
    avatar_url: string | null
    phone: string | null
    headline: string | null
    website_url: string | null
    linkedin_url: string | null
    timezone_name: string | null
    preferred_contact_method: 'email' | 'phone' | 'linkedin' | null
    /** 0-100, persisted when profile is saved */
    profile_completeness_percent: number | null
}
