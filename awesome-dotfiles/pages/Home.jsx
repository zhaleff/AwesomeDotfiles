import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Typewriter from 'typewriter-effect'
import RiceGrid from '../components/RiceGrid'
import logo from '../assets/blacknode.png'
export default function Home() {
  const [total, setTotal] = useState(null)
  useEffect(() => {
    getCountFromServer(collection(db, 'rices')).then((s) => setTotal(s.data().count)).catch(() => { })
  }, [])
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <section className="relative pt-40 pb-24 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-2 py-0.5 rounded border border-[#e8ff47]/30 bg-[#e8ff47]/5 text-[10px] font-bold tracking-widest uppercase text-[#e8ff47]">v2.0 Beta</span>
            {total !== null && (<span className="text-[11px] font-mono text-white/30 tracking-tight">// {total.toLocaleString()} CONFIGS_INDEXED</span>)}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white leading-[0.95]">
            Archive your <br />
            <span className="text-[#e8ff47] flex gap-3">
              <Typewriter options={{ strings: ['desktop', 'linux', 'workflow', 'dotfiles'], autoStart: true, loop: true, wrapperClassName: "text-[#e8ff47]", cursorClassName: "text-white/20" }} />
            </span>
          </h1>
          <p className="mt-8 text-base md:text-lg text-white/40 max-w-lg leading-relaxed font-medium">The central hub for meticulously crafted desktop environments. Discover configurations, color palettes, and scripts.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/submit" className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#e8ff47] hover:bg-white text-black text-sm font-bold transition-all">
              Submit rice
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </Link>
            <a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="flex items-center px-7 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all">r/unixporn</a>
          </div>
        </div>
        <div className="flex-1 relative flex justify-center md:justify-end w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#e8ff47]/10 blur-[100px] rounded-full"></div>
          <img src={logo} alt="Blacknode" className="relative w-full max-w-[320px] md:max-w-[400px] aspect-square object-contain animate-float" style={{ filter: 'drop-shadow(0 0 30px rgba(232, 255, 71, 0.05))' }} />
        </div>
      </section>
      <section className="pb-32 border-t border-white/5 pt-12">
        <RiceGrid />
      </section>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes float {0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); }} .animate-float { animation: float 6s ease-in-out infinite; }` }} />
    </div>
  )
}
