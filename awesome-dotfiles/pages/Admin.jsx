import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faArrowRightFromBracket, faSpinner } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'


export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rices, setRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  useEffect(() => {
    if (user === null) navigate('/admin/login')
  }, [user])
  useEffect(() => {
    if (!user) return
    fetchPending()
  }, [user])
  async function fetchPending() {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'rices'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setRices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
      toast.error('Failed to load pending submissions.')
    } finally {
      setLoading(false)
    }
  }
  async function approve(id) {
    setActing(id)
    try {
      await updateDoc(doc(db, 'rices', id), { status: 'approved' })
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Approved!')
    } catch {
      toast.error('Failed to approve.')
    } finally {
      setActing(null)
    }
  }
  async function reject(id) {
    setActing(id)
    try {
      await deleteDoc(doc(db, 'rices', id))
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Rejected and deleted.')
    } catch {
      toast.error('Failed to reject.')
    } finally {
      setActing(null)
    }
  }
  async function logout() {
    await signOut(auth)
    navigate('/admin/login')
  }
  if (user === undefined) return null
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight">Pending submissions</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {loading ? 'Loading...' : `${rices.length} waiting for review`}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 text-[var(--color-muted)] animate-spin" />
        </div>
      ) : rices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
          <p className="text-sm font-medium text-[var(--color-text)]">All clear</p>
          <p className="text-xs text-[var(--color-muted)]">No pending submissions right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {rices.map((rice) => {
            const createdDate = rice.createdAt?.toDate?.() ?? null
            const isActing = acting === rice.id
            return (
              <div
                key={rice.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
                  {/* Image */}
                  <div className="aspect-video md:aspect-auto bg-[var(--color-surface-3)] overflow-hidden">
                    {rice.imageUrl ? (
                      <img src={rice.imageUrl} alt={rice.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--color-muted)]">no image</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base font-semibold text-[var(--color-text)] leading-snug">{rice.title}</h2>
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[11px] text-yellow-400">pending</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                        <span>by <strong className="text-[var(--color-text-dim)]">{rice.author || 'anonymous'}</strong></span>
                        {rice.wm && <span className="px-2 py-0.5 rounded bg-[var(--color-surface-3)] border border-[var(--color-border)]">{rice.wm}</span>}
                        {rice.distro && <span className="px-2 py-0.5 rounded bg-[var(--color-surface-3)] border border-[var(--color-border)]">{rice.distro}</span>}
                        {createdDate && <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>}
                      </div>
                      {rice.description && (
                        <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-2">{rice.description}</p>
                      )}
                      {rice.palette?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {rice.palette.slice(0, 8).map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      )}
                      {rice.githubUrl && (
                        <a href={rice.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-accent)] hover:underline w-fit truncate max-w-xs">
                          {rice.githubUrl}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                      <button
                        onClick={() => approve(rice.id)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={isActing ? faSpinner : faCheck} className={clsx('w-3.5 h-3.5', isActing && 'animate-spin')} />
                        Approve
                      </button>
                      <button
                        onClick={() => reject(rice.id)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={isActing ? faSpinner : faXmark} className={clsx('w-3.5 h-3.5', isActing && 'animate-spin')} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
