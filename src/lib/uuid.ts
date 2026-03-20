/** RFC 4122 UUID (any version), case-insensitive */
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string | null | undefined): boolean {
    if (!value || typeof value !== 'string') return false
    return UUID_REGEX.test(value.trim())
}
