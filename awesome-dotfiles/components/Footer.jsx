import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faRedditAlien } from '@fortawesome/free-brands-svg-icons'
import logo from '../assets/blacknode.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0a0a0c] py-12">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">

          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="BlackNode"
                className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-all"
              />
              <div className="absolute -inset-1 bg-[#e8ff47]/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white uppercase leading-none">
                Awesome<span className="text-[#e8ff47]">Dotfiles</span>
              </span>
              <span className="text-[10px] font-mono text-white/20 tracking-[0.2em] uppercase mt-1">the.index.v2</span>
            </div>
          </Link>

          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-white/30">
            <li><Link to="/" className="hover:text-[#e8ff47] transition-colors">Gallery</Link></li>
            <li><Link to="/recent" className="hover:text-[#e8ff47] transition-colors">Recent</Link></li>
            <li><a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="hover:text-[#e8ff47] transition-colors">r/unixporn</a></li>
            <li><Link to="/submit" className="text-[#e8ff47]/60 hover:text-[#e8ff47]">Submit rice</Link></li>
          </ul>

        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-all text-xl">
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-all text-xl">
              <FontAwesomeIcon icon={faRedditAlien} />
            </a>
            <span className="text-[10px] font-mono text-white/10 ml-2 tracking-tighter">
              © {year} ARCHIVE_ZHALEFF. ALL_RIGHTS_RESERVED.
            </span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] font-black uppercase text-white/20 tracking-tighter">Made with</span>
            <FontAwesomeIcon icon={faHeart} className="text-[#e8ff47] text-[10px] animate-pulse" />
            <span className="text-[9px] font-black uppercase text-white/20 tracking-tighter">for the unix community</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
