import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back.')
      navigate('/admin')
    } catch {
      toast.error('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-text)] tracking-tight">Admin access</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Sign in to moderate submissions.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-2">Email</label>
            <input
              type="email"
              autoComplete="email"
              className={clsx(
                'w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-3)] border text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition-all',
                errors.email ? 'border-red-500/60' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]/60 focus:ring-1 focus:ring-[var(--color-accent)]/20'
              )}
              {...register('email', { required: true })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-2">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className={clsx(
                'w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-3)] border text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition-all',
                errors.password ? 'border-red-500/60' : 'border-[var(--color-border)] focus:border-[var(--color-accent)]/60 focus:ring-1 focus:ring-[var(--color-accent)]/20'
              )}
              {...register('password', { required: true })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
