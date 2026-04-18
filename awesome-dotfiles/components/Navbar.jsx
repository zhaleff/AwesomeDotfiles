import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faMagnifyingGlass, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/blacknode.png'
import clsx from 'clsx'


const navLinks = [
  { label: 'Gallery', to: '/' },
  { label: 'Recents', to: '/recent' },
]
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)
  const location = useLocation()
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [searchOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c] border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <img src={logo} alt="logo" className="h-7 w-auto object-contain" />
            <span className="text-white">Awesome Dotfiles</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, to }) => (
              <NavLink key={label} to={to} end className={({ isActive }) => clsx(
                'px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded',
                isActive ? 'bg-[#e8ff47] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
              )}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <AnimatePresence mode="wait">
              {searchOpen && (
                <motion.div
                  key="search-input"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                    placeholder="Search rices..."
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder:text-white/20 outline-none focus:border-[#e8ff47]/40 font-mono"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              <FontAwesomeIcon icon={searchOpen ? faXmark : faMagnifyingGlass} className="w-3 h-3" />
            </button>
            <Link
              to="/submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
              Share your build
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rices..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs text-white placeholder:text-white/20 outline-none focus:border-[#e8ff47]/40 font-mono"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#0a0a0c] border-b border-white/5 md:hidden"
          >
            <nav className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink key={label} to={to} end className={({ isActive }) => clsx(
                  'px-3 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-colors',
                  isActive ? 'bg-[#e8ff47] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                )}>
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 mt-1 border-t border-white/5">
                <Link
                  to="/submit"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
                  Share your build
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
