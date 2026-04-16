import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export type UploadToastState = {
  id: number
  variant: 'success' | 'error'
  message: string
} | null

type Props = {
  toast: UploadToastState
  onDismiss: () => void
}

export function UploadToast({ toast, onDismiss }: Props) {
  const dismiss = useCallback(() => onDismiss(), [onDismiss])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(dismiss, 4200)
    return () => window.clearTimeout(t)
  }, [toast, dismiss])

  return (
    <div className="upload-toast-host" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            className={`upload-toast upload-toast--${toast.variant}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            {toast.variant === 'success' ? (
              <CheckCircle2 className="upload-toast-icon" size={20} aria-hidden />
            ) : (
              <AlertCircle className="upload-toast-icon" size={20} aria-hidden />
            )}
            <span className="upload-toast-text">{toast.message}</span>
            <button
              type="button"
              className="upload-toast-dismiss"
              onClick={dismiss}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
