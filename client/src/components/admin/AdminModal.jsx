import {useEffect,useRef} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {X} from 'lucide-react'
export default function AdminModal({open,title,children,onClose,size='md'}){
  const ref=useRef(null)
  const sizes={sm:'max-w-md',md:'max-w-lg',lg:'max-w-2xl',xl:'max-w-3xl'}
  useEffect(()=>{if(!open)return;ref.current?.focus();const k=e=>{if(e.key==='Escape')onClose?.()};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[open,onClose])
  return <AnimatePresence>{open&&(<div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true"><motion.div className="absolute inset-0 bg-forest-deep/50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/><motion.div className={`relative w-full ${sizes[size]||sizes.md} max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-cream-soft shadow-xl border border-forest/10`} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}}><div className="sticky top-0 flex items-center justify-between border-b border-forest/10 bg-cream-soft px-5 py-4 z-10"><h2 className="font-display text-lg text-forest-deep">{title}</h2><button ref={ref} type="button" onClick={onClose} className="rounded-lg p-1.5 text-forest/50 hover:bg-forest/5" aria-label="Close"><X size={18}/></button></div><div className="p-5">{children}</div></motion.div></div>)}</AnimatePresence>
}
