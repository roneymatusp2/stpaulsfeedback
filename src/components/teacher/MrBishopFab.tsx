import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MrBishopChat from '@/components/teacher/MrBishopChat'
import stPaulsLogo from '@/assets/st-pauls-logo.png'

const MrBishopFab: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        aria-label="Open Mr Bishop assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-glow focus:outline-none focus:ring-2 focus:ring-ring bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <img src={stPaulsLogo} alt="St. Paul’s" className="w-7 h-7 drop-shadow" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="fixed z-50 bottom-24 right-6 w-[360px] sm:w-[420px] h-[540px] rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              role="dialog"
              aria-label="Mr Bishop AI"
            >
              <div className="relative p-3 border-b bg-gradient-to-r from-blue-600/15 to-indigo-600/10">
                <div className="flex items-center gap-3">
                  <img src={stPaulsLogo} alt="St. Paul’s" className="w-6 h-6" />
                  <div className="font-semibold text-foreground">Mr Bishop AI</div>
                  <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground rounded-md px-2 py-1" aria-label="Close">×</button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <MrBishopChat />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MrBishopFab


