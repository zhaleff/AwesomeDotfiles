import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

const STACK = [
  { layer: 'Frontend', tech: 'React + Vite', detail: 'Fast builds, lazy loaded routes' },
  { layer: 'Database', tech: 'SupaBase', detail: 'Real-time NoSQL, composite indexes' },
  { layer: 'Images', tech: 'UploadCare', detail: 'CDN delivery, unsigned uploads' },
  { layer: 'Styling', tech: 'Tailwind CSS v4', detail: 'CSS variables, @theme directive' },
  { layer: 'Animations', tech: 'Framer Motion', detail: 'Entrance animations, transitions' },
  { layer: 'Hosting', tech: 'Vercel Hosting', detail: 'Global CDN, SSL included' },
]

const TAGS = ['Community driven', 'Manually reviewed', 'No accounts needed', 'Always free']

function Section({ number, title, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-24"
      >
        <div>
          <p className="text-xs font-semibold text-muted mb-2">{number}</p>
          <h2 className="text-3xl font-semibold text-text tracking-tight">{title}</h2>
        </div>
        <div className="flex flex-col gap-6">{children}</div>
      </motion.div>
      <div className="border-t border-border mb-24" />
    </>
  )
}

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-24"
      >
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.04em] leading-[0.95] text-text">
          About <br /> <span className="text-accent">AwesomeDotfiles</span>
        </h1>
      </motion.div>

      <div className="border-t border-border mb-24" />

      <Section number="01" title="What is this">
        <p className="text-lg text-text leading-relaxed">
          Awesome Dotfiles is a community-maintained gallery for Linux desktop configurations — what the ricing community calls "rices." Every setup here has been submitted by a real person and manually reviewed before going live.
        </p>
        <p className="text-[15px] text-text-dim leading-relaxed">
          Each entry comes with a screenshot, the window manager and distro it runs on, a color palette, and usually a direct link to the dotfiles on GitHub. You can browse, filter, vote, and get inspired — or submit your own setup and share it with thousands of people who actually care about this stuff.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {TAGS.map((tag) => (
            <span key={tag} className="px-3.5 py-1.5 rounded-full bg-surface-2 text-[12.5px] font-medium text-text-dim">
              {tag}
            </span>
          ))}
        </div>
      </Section>

      <Section number="02" title="How it's built">
        <p className="text-[15px] text-text-dim leading-relaxed">
          The entire stack is serverless. No backend to maintain, no servers to scale. Submissions go straight to SupaBase, images land on UploadCare CDN, and the whole thing is hosted on Vercel. Fast, cheap, and reliable enough for what this needs to be.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STACK.map(({ layer, tech, detail }) => (
            <div
              key={layer}
              className="flex flex-col gap-1 p-4 rounded-2xl bg-surface-2 hover:bg-surface-3 transition-colors duration-200"
            >
              <span className="text-[10.5px] font-medium text-muted uppercase tracking-wide">{layer}</span>
              <p className="text-[15px] font-semibold text-text">{tech}</p>
              <p className="text-[12px] text-text-dim">{detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="03" title="How does it help">
        <p className="text-lg text-text leading-relaxed">
          Here you can find various dotfiles created by the community. Everyone has their own ricing style — find inspiration, or go further and modify a setup to your liking. No more asking someone else for their configuration; upload your own right here and share it with the world. Easy to upload, easy to view, no cookies, no registration, nothing.
        </p>
      </Section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <p className="text-xl font-semibold text-text mb-1">More sections coming soon</p>
        <p className="text-[13.5px] text-muted">The project is currently under active development.</p>
      </motion.div>
    </div>
  )
}
