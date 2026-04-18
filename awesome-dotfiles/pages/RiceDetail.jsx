import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faEye, faCopy, faCheck, faArrowUpRightFromSquare, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white transition-colors"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={clsx('w-3 h-3', copied && 'text-green-400')} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function RiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rice, setRice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vote, setVote] = useState(null) // 'up' | 'down' | null
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    async function fetchRice() {
      setLoading(true)
      try {
        const ref = doc(db, 'rices', id)
        const snap = await getDoc(ref)
        if (!snap.exists()) { setNotFound(true); return }
        setRice({ id: snap.id, ...snap.data() })
        const viewed = localStorage.getItem(`viewed_${id}`)
        if (!viewed) {
          updateDoc(ref, { views: increment(1) }).catch(() => { })
          localStorage.setItem(`viewed_${id}`, '1')
        }
        const savedVote = localStorage.getItem(`vote_${id}`)
        if (savedVote) setVote(savedVote)
      } catch (err) {
        console.error(err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchRice()
  }, [id])

  async function handleVote(type) {
    if (voting) return
    const ref = doc(db, 'rices', id)
    setVoting(true)
    try {
      if (vote === type) {
        // undo vote
        await updateDoc(ref, { [type === 'up' ? 'likes' : 'dislikes']: increment(-1) })
        setRice((r) => ({ ...r, [type === 'up' ? 'likes' : 'dislikes']: (r[type === 'up' ? 'likes' : 'dislikes'] ?? 1) - 1 }))
        localStorage.removeItem(`vote_${id}`)
        setVote(null)
      } else {
        // switch or new vote
        const updates = { [type === 'up' ? 'likes' : 'dislikes']: increment(1) }
        if (vote) updates[vote === 'up' ? 'likes' : 'dislikes'] = increment(-1)
        await updateDoc(ref, updates)
        setRice((r) => ({
          ...r,
          likes: (r.likes ?? 0) + (type === 'up' ? 1 : 0) - (vote === 'up' ? 1 : 0),
          dislikes: (r.dislikes ?? 0) + (type === 'down' ? 1 : 0) - (vote === 'down' ? 1 : 0),
        }))
        localStorage.setItem(`vote_${id}`, type)
        setVote(type)
        toast.success(type === 'up' ? 'Liked!' : 'Noted.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to vote.')
    } finally {
      setVoting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#e8ff47] animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-6xl font-bold text-white/5">404</p>
      <p className="text-sm text-white/30">This setup doesn't exist or was removed.</p>
      <button onClick={() => navigate('/')} className="text-xs text-[#e8ff47] hover:underline">← Back to gallery</button>
    </div>
  )

  const createdDate = rice.createdAt?.toDate?.() ?? (rice.createdAt ? new Date(rice.createdAt) : null)
  const likes = rice.likes ?? 0
  const dislikes = rice.dislikes ?? 0
  const total = likes + dislikes
  const likePercent = total > 0 ? Math.round((likes / total) * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-28"
    >

      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
          Back
        </button>
      </div>

      {rice.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl overflow-hidden border border-white/8 mb-10 bg-black"
        >
          <img src={rice.imageUrl} alt={rice.title} className="w-full object-cover max-h-[560px]" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
            {rice.title}
          </h1>
          <div className="flex items-center gap-3 mt-2.5">
            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#e8ff47] uppercase">
              {rice.author?.[0] ?? '?'}
            </div>
            <span className="text-sm text-white/40">{rice.author ?? 'anonymous'}</span>
            {createdDate && (
              <span className="text-xs text-white/20">{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
            {rice.views ?? 0}
          </div>

          {rice.githubUrl && (
            <a
              href={rice.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
              Dotfiles
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5 opacity-40" />
            </a>
          )}
        </div>
      </motion.div>

      {/* Vote bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
      >
        <button
          onClick={() => handleVote('up')}
          disabled={voting}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
            vote === 'up'
              ? 'bg-[#e8ff47] text-black'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20'
          )}
        >
          <FontAwesomeIcon icon={faThumbsUp} className="w-4 h-4" />
          {likes}
        </button>

        <button
          onClick={() => handleVote('down')}
          disabled={voting}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
            vote === 'down'
              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
              : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20'
          )}
        >
          <FontAwesomeIcon icon={faThumbsDown} className="w-4 h-4" />
          {dislikes}
        </button>

        {likePercent !== null && (
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${likePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-[#e8ff47] rounded-full"
              />
            </div>
            <span className="text-[10px] text-white/20">{likePercent}% positive · {total} votes</span>
          </div>
        )}

        {vote && (
          <span className="text-[10px] text-white/20 ml-auto">
            {vote === 'up' ? 'You liked this' : 'You disliked this'}
          </span>
        )}
      </motion.div>

      <div className="border-t border-white/5 mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
        <div className="flex flex-col gap-8">
          {rice.description && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20 mb-3">About</p>
              <p className="text-sm text-white/50 leading-relaxed">{rice.description}</p>
            </motion.div>
          )}

          {rice.palette?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20 mb-3">Palette</p>
              <div className="flex flex-wrap gap-2">
                {rice.palette.map((color, i) => (
                  <div key={i} className="group flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-lg border border-white/10 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[9px] font-mono text-white/20 group-hover:text-white/50 transition-colors">{color}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {rice.notes && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Notes</p>
                <CopyButton text={rice.notes} />
              </div>
              <div className="rounded-xl bg-black border border-white/8 p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-white/40 leading-relaxed whitespace-pre-wrap break-words">
                  {rice.notes}
                </pre>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Specs</p>
          <div className="rounded-xl border border-white/8 overflow-hidden">
            {[
              { label: 'WM / DE', value: rice.wm },
              { label: 'Distro', value: rice.distro },
              { label: 'Date', value: createdDate ? format(createdDate, 'MMM d, yyyy') : null },
            ].filter(r => r.value).map(({ label, value }, i, arr) => (
              <div key={label} className={clsx('px-4 py-3 flex flex-col gap-0.5', i < arr.length - 1 && 'border-b border-white/5')}>
                <span className="text-[9px] text-white/20 uppercase tracking-wider">{label}</span>
                <span className="text-xs text-white/70 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {rice.githubUrl && (
            <a
              href={rice.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-xs font-semibold transition-colors"
            >
              <FontAwesomeIcon icon={faGithub} className="w-3.5 h-3.5" />
              View dotfiles
            </a>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
