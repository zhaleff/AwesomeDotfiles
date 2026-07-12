import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faThumbsUp, faShuffle, faChevronDown, faXmark, faMagnifyingGlass, faCheck } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import RiceCard from './RiceCard'
import clsx from 'clsx'

const WM_OPTIONS = ['All', 'Niri', 'Hyprland', 'i3', 'MangoWM', 'Sway', 'Omarchy', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'MiracleWM', 'KDE', 'GNOME']
const DISTRO_OPTIONS = ['All', 'Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!OS', 'openSUSE']

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent', icon: faClock, field: 'created_at' },
  { label: 'Most liked', value: 'liked', icon: faThumbsUp, field: 'likes' },
  { label: 'Random', value: 'random', icon: faShuffle, field: null },
]

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const active = value && value !== 'All'
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 pl-4 pr-3 h-10 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer',
          active
            ? 'bg-accent text-surface'
            : open
              ? 'bg-surface-3 text-text'
              : 'bg-surface-2 text-text-dim hover:text-text hover:bg-surface-3'
        )}
      >
        {active ? value : label}
        <FontAwesomeIcon icon={faChevronDown} className={clsx('w-2.5 h-2.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 right-0 z-50 w-48 bg-surface-2 rounded-2xl shadow-2xl p-1.5 origin-top-right"
          >
            <div className="max-h-64 overflow-y-auto flex flex-col gap-0.5">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className={clsx(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-colors duration-150 cursor-pointer',
                      value === opt ? 'text-accent font-medium' : 'text-text-dim hover:text-text hover:bg-surface-3'
                    )}
                  >
                    {opt}
                    {value === opt && <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
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

function CardSkeleton() {
  return (
    <div>
      <div className="aspect-video rounded-2xl bg-surface-2 animate-pulse" />
      <div className="pt-3.5 space-y-2">
        <div className="h-3 w-32 rounded-full bg-surface-2 animate-pulse" />
        <div className="h-2.5 w-20 rounded-full bg-surface-2 animate-pulse" />
      </div>
    </div>
  )
}

export default function RiceGrid({ defaultSort = 'recent' }) {
  const [rices, setRices] = useState([])
  const [allRices, setAllRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(defaultSort)
  const [wm, setWm] = useState('All')
  const [distro, setDistro] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchRices() {
      setLoading(true)
      try {
        const sortOption = SORT_OPTIONS.find((o) => o.value === sort)
        let q = supabase.from('rices').select('*').eq('status', 'approved').limit(48)
        q = sort === 'random' ? q.order('created_at', { ascending: false }) : q.order(sortOption.field, { ascending: false })

        const { data, error } = await q
        if (error) throw error

        let docs = data
        if (sort === 'random') docs = docs.sort(() => Math.random() - 0.5)
        setAllRices(docs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRices()
  }, [sort])

  useEffect(() => {
    let filtered = [...allRices]
    if (wm !== 'All') filtered = filtered.filter((r) => r.wm === wm)
    if (distro !== 'All') filtered = filtered.filter((r) => r.distro === distro)
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.author?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.wm?.toLowerCase().includes(q) ||
          r.distro?.toLowerCase().includes(q)
      )
    }
    setRices(filtered)
  }, [allRices, wm, distro, search])

  const hasFilters = wm !== 'All' || distro !== 'All' || search.trim() !== ''
  const clearAll = () => { setWm('All'); setDistro('All'); setSearch('') }

  return (
    <div>
      <div className="mb-10 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-0.5 bg-surface-2 p-1 rounded-full w-fit">
          {SORT_OPTIONS.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={clsx(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors duration-200 cursor-pointer',
                sort === value ? 'text-accent' : 'text-text-dim hover:text-text'
              )}
            >
              {sort === value && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-full bg-surface-3"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <FontAwesomeIcon icon={icon} className="relative z-10 w-3 h-3" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, WM, distro…"
            className="w-full h-10 pl-10 pr-9 bg-surface-2 rounded-full text-[13px] text-text placeholder-muted focus:outline-none focus:bg-surface-3 transition-colors duration-200"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text-dim transition-colors duration-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Dropdown label="WM / DE" options={WM_OPTIONS} value={wm} onChange={setWm} />
          <Dropdown label="Distro" options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 40 }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={clearAll}
                aria-label="Clear filters"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-2 text-text-dim hover:text-text transition-colors duration-200 cursor-pointer flex-shrink-0"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!loading && hasFilters && rices.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12.5px] text-muted mb-5">
          {rices.length} result{rices.length !== 1 ? 's' : ''}
        </motion.p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : rices.length === 0 ? (
        <div className="py-28 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-muted" />
          </div>
          <p className="text-[13.5px] text-text-dim">
            {hasFilters ? 'No results for these filters.' : 'No setups yet.'}
          </p>
          {hasFilters ? (
            <button onClick={clearAll} className="text-[13px] text-accent hover:text-accent-dim transition-colors duration-200 cursor-pointer">
              Clear filters
            </button>
          ) : (
            <Link to="/submit" className="text-[13px] text-accent hover:text-accent-dim transition-colors duration-200">
              Be the first to submit →
            </Link>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
          <AnimatePresence mode="popLayout">
            {rices.map((rice, i) => (
              <motion.div
                key={rice.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: i < 6 ? i * 0.04 : 0, ease: [0.16, 1, 0.3, 1] }}
              >
                <RiceCard rice={rice} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
