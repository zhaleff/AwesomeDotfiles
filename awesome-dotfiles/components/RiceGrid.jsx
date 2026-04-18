import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFire, faStar, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import RiceCard from './RiceCard'
import clsx from 'clsx'

const WM_OPTIONS = ['All', 'Hyprland', 'i3', 'Sway', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'MiracleWM', 'KDE', 'GNOME']
const DISTRO_OPTIONS = ['All', 'Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'openSUSE']

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent', icon: faClock },
  { label: 'Popular', value: 'popular', icon: faFire },
  { label: 'Top', value: 'top', icon: faStar },
]


function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-all',
          value && value !== 'All'
            ? 'bg-[#e8ff47] border-[#e8ff47] text-black'
            : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
        )}
      >
        {value !== 'All' ? value : label}
        <FontAwesomeIcon icon={faChevronDown} className={clsx('w-2.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.11 }}
            className="absolute top-full mt-1.5 left-0 z-50 w-44 bg-[#111113] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-56 overflow-y-auto p-1">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                      value === opt ? 'bg-[#e8ff47]/10 text-[#e8ff47]' : 'text-white/40 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}


export default function RiceGrid({ defaultSort = 'recent' }) {
  const [rices, setRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(defaultSort)
  const [wm, setWm] = useState('All')
  const [distro, setDistro] = useState('All')

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const field = sort === 'recent' ? 'createdAt' : sort === 'popular' ? 'views' : 'stars'
        const q = query(
          collection(db, 'rices'),
          where('status', '==', 'approved'),
          orderBy(field, 'desc'),
          limit(48)
        )
        const snap = await getDocs(q)
        let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (wm !== 'All') docs = docs.filter((r) => r.wm === wm)
        if (distro !== 'All') docs = docs.filter((r) => r.distro === distro)
        setRices(docs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sort, wm, distro])

  const hasFilters = wm !== 'All' || distro !== 'All'

  return (
    <div>
      <div className="relative z-40 py-3 border-y border-white/5 bg-[#0e0e10] mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">




          <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-xl p-1">
            {SORT_OPTIONS.map(({ label, value, icon }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                  sort === value ? 'bg-white/10 text-[#e8ff47]' : 'text-white/30 hover:text-white'
                )}
              >
                <FontAwesomeIcon icon={icon} className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Dropdown label="WM / DE" options={WM_OPTIONS} value={wm} onChange={setWm} />
            <Dropdown label="Distro" options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
            {hasFilters && (
              <button
                onClick={() => { setWm('All'); setDistro('All') }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-white/[0.03] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : rices.length === 0 ? (
        <div className="py-28 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/20">
            {hasFilters ? 'No results for these filters.' : 'No setups yet.'}
          </p>
          {!hasFilters && (
            <Link to="/submit" className="text-xs text-[#e8ff47] hover:underline">
              Be the first to submit →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rices.map((rice, i) => (
            <RiceCard key={rice.id} rice={rice} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
