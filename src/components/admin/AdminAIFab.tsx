import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminAIChat from '@/components/admin/AdminAIChat'
import stPaulsLogo from '@/assets/st-pauls-logo.png'

const AdminAIFab: React.FC = () => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Floating launcher */}
      <button
        aria-label="Open administrative assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-glow focus:outline-none focus:ring-2 focus:ring-ring bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <img src={stPaulsLogo} alt="St. Paul’s" className="w-7 h-7 drop-shadow" />
      </button>

      {/* Overlay + floating chat window */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed z-50 bottom-24 right-6 w-[360px] sm:w-[420px] h-[540px] rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              role="dialog"
              aria-label="Administrative AI Assistant"
            >
              <div className="relative p-3 border-b bg-gradient-to-r from-emerald-500/15 to-teal-500/10">
                <div className="flex items-center gap-3">
                  <img src={stPaulsLogo} alt="St. Paul’s" className="w-6 h-6" />
                  <div>
                    <div className="font-semibold text-foreground">Administrative AI Assistant</div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="ml-auto text-muted-foreground hover:text-foreground rounded-md px-2 py-1"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <AdminAIChat />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminAIFab


