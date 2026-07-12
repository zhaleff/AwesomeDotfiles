import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/blacknode.png'
import clsx from 'clsx'

const navLinks = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
]

const EMPHASIZED = [0.05, 0.7, 0.1, 1]
const STANDARD = [0.2, 0, 0, 1]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 pl-2.5 pr-4 h-11 rounded-full bg-surface-2 border border-border flex-shrink-0"
          >
            <img
              src={logo}
              alt="Awesome Dotfiles logo"
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-text text-[13px] font-semibold tracking-tight whitespace-nowrap">
              Awesome <span className="text-accent">Dotfiles</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 h-11 px-1.5 rounded-full bg-surface-2 border border-border absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className="relative px-4 py-2 text-[13px] font-medium rounded-full transition-colors duration-200 cursor-pointer"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-surface-3 border border-border"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span
                      className={clsx(
                        'relative z-10 transition-colors duration-200',
                        isActive ? 'text-accent' : 'text-text-dim hover:text-text'
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/submit"
            className="group hidden md:flex items-center gap-1.5 h-11 pl-4 pr-3.5 rounded-full bg-accent text-surface text-[13px] font-semibold transition-colors duration-200 hover:bg-accent-dim flex-shrink-0 cursor-pointer"
          >
            Share your build
            <FontAwesomeIcon
              icon={faArrowRight}
              className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-surface-2 border border-border text-text-dim hover:text-text transition-colors duration-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface/70 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EMPHASIZED }}
            className="fixed top-20 left-4 right-4 z-50 rounded-3xl md:hidden overflow-hidden bg-surface-2 border border-border"
          >
            <nav className="p-2.5 flex flex-col gap-1">
              {navLinks.map(({ label, to }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.25, ease: STANDARD }}
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-200 cursor-pointer',
                        isActive
                          ? 'bg-surface-3 border border-border text-accent'
                          : 'text-text-dim hover:text-text hover:bg-white/[0.03]'
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + navLinks.length * 0.04, duration: 0.25 }}
                className="mt-1.5 pt-2.5 border-t border-border"
              >
                <Link
                  to="/submit"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-accent text-surface text-sm font-semibold active:scale-[0.98] transition-transform duration-200 cursor-pointer"
                >
                  Share your build
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
