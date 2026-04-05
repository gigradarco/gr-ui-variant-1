import { motion } from 'framer-motion'
import { ArrowLeft, Mail } from 'lucide-react'
import { useAppState } from '../../store/appStore'

function GoogleMark() {
  return (
    <span className="welcome-signin-google-mark" aria-hidden>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </span>
  )
}

export function SignInSheet() {
  const { closeSignIn, completeSignInDemo } = useAppState()

  return (
    <motion.div
      className="welcome-signin-sheet"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="welcome-signin-header">
        <button
          type="button"
          className="welcome-signin-back"
          onClick={closeSignIn}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="welcome-signin-title">Sign in to Buzo</span>
        <span className="welcome-signin-spacer" aria-hidden />
      </header>

      <div className="welcome-signin-body">
        <p className="welcome-signin-lead">
          Save plans, sync taste, and see what your crew is doing — one account across the app.
        </p>

        <button
          type="button"
          className="welcome-signin-google"
          onClick={() => {
            window.alert(
              'Demo: start Google OAuth here. Continuing will mark you signed in for this preview.',
            )
            completeSignInDemo()
          }}
        >
          <GoogleMark />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          className="welcome-signin-email"
          onClick={() => {
            window.alert('Demo: open your email magic-link or password flow here.')
            completeSignInDemo()
          }}
        >
          <Mail size={18} strokeWidth={2} aria-hidden />
          <span>Continue with email</span>
        </button>

        <p className="welcome-signin-note">
          You can still explore the app first — sign in whenever you&apos;re ready.
        </p>
      </div>
    </motion.div>
  )
}
