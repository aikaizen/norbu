import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  show: boolean
}

export function DiamondPop({ show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1.3, y: -16 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-6 right-6 text-amber-500 font-bold text-xl pointer-events-none z-50 select-none"
        >
          +1 ◆
        </motion.div>
      )}
    </AnimatePresence>
  )
}
