import { redirect } from 'next/navigation'

/** Legacy URL: sidebar used to point here; keep redirect for bookmarks. */
export default function LegacySyndicateRouteRedirect() {
    redirect('/workspace/invite-teams')
}
