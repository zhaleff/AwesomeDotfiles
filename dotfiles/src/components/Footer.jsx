import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faRedditAlien } from '@fortawesome/free-brands-svg-icons'

const LINKS = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Submit your rice', to: '/submit' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">

          <nav className="flex items-center gap-5">
            {LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="text-[13px] text-text-dim hover:text-text transition-colors duration-200">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/zhaleff/Awesome-Dotfiles"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-text-dim hover:text-text transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faGithub} className="w-4 h-4" />
          </a>
          <a
            href="https://reddit.com/r/unixporn"
            target="_blank"
            rel="noreferrer"
            aria-label="r/unixporn"
            className="text-text-dim hover:text-text transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faRedditAlien} className="w-4 h-4" />
          </a>
          <span className="text-[12px] text-muted ml-2">© {year} Zhaleff</span>
        </div>
      </div>
    </footer>
  )
}
