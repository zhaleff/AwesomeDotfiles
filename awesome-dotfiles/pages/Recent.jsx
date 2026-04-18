import { Link } from 'react-router-dom'
import RiceGrid from '../components/RiceGrid'

export default function Recent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">

      <section className="pt-40 pb-12">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e8ff47] mb-3">Community</p>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.04em] leading-[0.92] text-white">
          All{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8ff47] to-white/30 font-serif italic font-normal">
            rices
          </span>
        </h1>

        <p className="mt-4 text-sm text-white/40 max-w-sm leading-relaxed">
          Browse the full community collection — filter by WM, distro, or sort by popularity.
        </p>
      </section>

      <section className="pb-32">
        <RiceGrid defaultSort="recent" />
      </section>

    </div>
  )
}
