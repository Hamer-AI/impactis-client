export default function WorkspaceLoading() {
    return (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden animate-pulse" role="status" aria-label="Loading">
            <div className="h-16 shrink-0 bg-slate-200/50 dark:bg-white/5" />
            <div className="flex-1 p-6 md:p-10">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="h-8 w-48 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                        ))}
                    </div>
                    <div className="h-64 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                </div>
            </div>
        </div>
    )
}
