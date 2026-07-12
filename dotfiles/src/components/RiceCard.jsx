import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export default function RiceCard({ rice, index = 0 }) {
  const date = rice.created_at ? new Date(rice.created_at) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/rice/${rice.slug}`} className="group block">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-2">
          {rice.image_url ? (
            <img
              src={rice.image_url}
              alt={rice.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted">No preview</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {rice.wm && (
            <span className="absolute top-3 left-3 px-3 py-2 rounded-full bg-surface/80 text-[11px] font-medium text-text-dim">
              {rice.wm}
            </span>
          )}

          {rice.palette?.length > 0 && (
            <div className="absolute bottom-3 right-3 flex -space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {rice.palette.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full ring-2 ring-surface"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-medium text-text leading-snug truncate">
              {rice.title}
            </h3>
            <p className="mt-1 text-[13px] text-muted truncate">
              {rice.author ?? 'anonymous'}
              {date && <span> · {formatDistanceToNow(date, { addSuffix: true })}</span>}
            </p>
          </div>

          <div className="flex items-center gap-1 text-[12.5px] text-muted flex-shrink-0 pt-0.5">
            <span className="transition-colors duration-200 group-hover:text-accent">
              {rice.likes ?? 0}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
