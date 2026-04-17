import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppState } from '../../store/appStore'

export function WelcomeBackScreen() {
  const { userProfile, dismissWelcomeBack } = useAppState()
  const displayName = userProfile.displayName.trim() || userProfile.username

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissWelcomeBack()
    }, 2000)
    return () => clearTimeout(timer)
  }, [dismissWelcomeBack])

  return (
    <motion.div
      className="welcome-back-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="welcome-back-content"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.h1
          className="welcome-back-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Welcome back,
        </motion.h1>
        <motion.p
          className="welcome-back-name"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {displayName}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
