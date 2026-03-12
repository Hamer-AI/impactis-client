'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance, type TurnstileTheme } from '@marsidev/react-turnstile'

type TurnstileWidgetProps = {
    siteKey: string
    onTokenChange: (token: string | null) => void
    resetSignal?: number
    className?: string
    theme?: TurnstileTheme
}

export default function TurnstileWidget({
    siteKey,
    onTokenChange,
    resetSignal,
    className,
    theme = 'light',
}: TurnstileWidgetProps) {
    const turnstileRef = useRef<TurnstileInstance | null>(null)
    const [widgetReady, setWidgetReady] = useState(false)
    const onExpire = useCallback(() => onTokenChange(null), [onTokenChange])
    const onError = useCallback(() => onTokenChange(null), [onTokenChange])

    useEffect(() => {
        const turnstile = turnstileRef.current

        return () => {
            onTokenChange(null)
            turnstile?.remove()
        }
    }, [onTokenChange])

    useEffect(() => {
        if (resetSignal === undefined) {
            return
        }

        turnstileRef.current?.reset()
        onTokenChange(null)
    }, [onTokenChange, resetSignal])

    return (
        <div className={className} style={{ minHeight: 65 }}>
            {!widgetReady && (
                <div className="flex items-center justify-center py-3 text-sm text-gray-500" aria-live="polite">
                    Loading Cloudflare security check…
                </div>
            )}
            <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                options={{ theme }}
                onSuccess={onTokenChange}
                onExpire={onExpire}
                onError={onError}
                onWidgetLoad={() => setWidgetReady(true)}
            />
        </div>
    )
}
