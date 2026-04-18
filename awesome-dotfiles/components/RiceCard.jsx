import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
export default function RiceCard({ rice, index = 0 }) {
  const date = rice.createdAt?.toDate?.() ?? (rice.createdAt ? new Date(rice.createdAt) : null)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.02, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={`/rice/${rice.id}`}
        className="group block bg-[var(--color-surface-2)] border border-white/5 hover:border-[#e8ff47]/30 transition-all duration-300 rounded-xl overflow-hidden"
      >
        <div className="aspect-video overflow-hidden relative bg-black">
          {rice.imageUrl ? (
            <img
              src={rice.imageUrl}
              alt={rice.title}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-white/10 uppercase tracking-widest">no preview</span>
            </div>
          )}
          {rice.wm && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-semibold text-white/70">
              {rice.wm}
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1 group-hover:text-[#e8ff47] transition-colors">
              {rice.title}
            </h3>
            {rice.palette?.length > 0 && (
              <div className="flex gap-1 shrink-0 mt-0.5">
                {rice.palette.slice(0, 4).map((color, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#e8ff47] uppercase">
                {rice.author?.[0] ?? '?'}
              </div>
              <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">
                {rice.author ?? 'anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/20">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-yellow-500/40 group-hover:text-yellow-500/70 transition-colors" />
                {rice.stars ?? 0}
              </span>
              {date && <span>{formatDistanceToNow(date, { addSuffix: true })}</span>}
            </div>
          </div>
        </div>
        <div className="h-px w-0 bg-[#e8ff47] group-hover:w-full transition-all duration-500" />
      </Link>
    </motion.div>
  )
}
