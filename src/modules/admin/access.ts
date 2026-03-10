type User = {
    id: string
    email?: string | null
    last_sign_in_at?: string | null
}

function getConfiguredAdminEmails(): Set<string> {
    const raw = process.env.ADMIN_EMAILS ?? ''
    const emails = raw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0)

    return new Set(emails)
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
    if (!email) {
        return false
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
        return false
    }

    return getConfiguredAdminEmails().has(normalizedEmail)
}

export function isPlatformAdminUser(user: Pick<User, 'email'> | null | undefined): boolean {
    return isPlatformAdminEmail(user?.email)
}
