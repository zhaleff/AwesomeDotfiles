import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

const EASE = [0.16, 1, 0.3, 1]

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center mb-5">
            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-text mb-1.5">Sign in</h1>
          <p className="text-[13px] text-text-dim">Restricted access. Authorized users only.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className={clsx(
                'w-full h-12 px-4 rounded-full bg-surface-2 text-[14px] text-text placeholder:text-muted outline-none transition-colors duration-200 focus:bg-surface-3',
                errors.email && 'ring-1 ring-red-400/40'
              )}
              {...register('email', { required: true })}
            />
          </div>

          <div>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className={clsx(
                'w-full h-12 px-4 rounded-full bg-surface-2 text-[14px] text-text placeholder:text-muted outline-none transition-colors duration-200 focus:bg-surface-3',
                errors.password && 'ring-1 ring-red-400/40'
              )}
              {...register('password', { required: true })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full h-12 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 text-surface text-[14px] font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
