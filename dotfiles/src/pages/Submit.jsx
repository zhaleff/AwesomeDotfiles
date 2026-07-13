import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Turnstile } from '@marsidev/react-turnstile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowRight, faArrowLeft, faCircleNotch, faCloudArrowUp, faCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/imgbb'
import clsx from 'clsx'




const WM_OPTIONS = ['Hyprland', 'Niri', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Omarchy', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other']
const DISTRO_OPTIONS = ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'CachyOS', 'Pop!_OS', 'openSUSE', 'Other']
const LICENSE_OPTIONS = ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None']

const STEPS = ['Screenshot', 'Details', 'Config', 'Review']
const STEP_HINTS = [
  'Start with the visuals — upload a screenshot of your desktop.',
  "Tell us what this is. It's the first thing people will see.",
  'Almost there. These fields are optional but they get more likes.',
  'Last step — this is exactly how your card will look.',
]
const RATE_LIMIT_MINUTES = 5

function generateSlug(author, title) {
  const base = `${author || 'anonymous'}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base}-${suffix}`
}



function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function getClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    return data.ip
  } catch {
    return null
  }
}

function FieldHint({ children }) {
  return <p className="text-xs text-muted mb-2">{children}</p>
}

function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none transition-colors duration-200',
        error ? 'ring-1 ring-red-400/40' : 'focus:bg-surface-3',
        className
      )}
      {...props}
    />
  )
}

function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full px-4 py-3.5 rounded-2xl bg-surface-2 text-sm text-text placeholder:text-muted outline-none resize-none transition-colors duration-200 focus:bg-surface-3"
      {...props}
    />
  )
}

function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          className={clsx(
            'px-3.5 py-1.5 rounded-full text-xs cursor-pointer transition-colors duration-200',
            value === opt
              ? 'bg-accent text-surface'
              : 'bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ProgressBar({ step }) {
  const pct = (step / (STEPS.length - 1)) * 100
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors duration-200',
              i === step ? 'bg-accent text-surface' : i < step ? 'bg-surface-3 text-text-dim' : 'bg-surface-2 text-muted'
            )}
          >
            {i < step ? (
              <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
            ) : (
              <span className="text-[10px] font-medium">{i + 1}</span>
            )}
            <span className="text-[11px] hidden sm:block">{label}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

function RicePreviewCard({ title, author, wm, palette, imagePreview }) {
  return (
    <div className="w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-2">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted">No preview</span>
          </div>
        )}
        {wm && (
          <span className="absolute top-3 left-3 px-3 py-2 rounded-full bg-surface/80 text-[11px] font-medium text-text-dim">
            {wm}
          </span>
        )}
        {palette?.length > 0 && (
          <div className="absolute bottom-3 right-3 flex -space-x-1">
            {palette.slice(0, 5).map((color, i) => (
              <div key={i} className="w-4 h-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: color }} />
            ))}
          </div>
        )}
      </div>
      <div className="pt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-medium text-text leading-snug truncate">
            {title || 'Your untitled rice'}
          </h3>
          <p className="mt-1 text-[13px] text-muted truncate">
            {author || 'anonymous'} · just now
          </p>
        </div>
        <div className="flex items-center gap-1 text-[12.5px] text-muted flex-shrink-0 pt-0.5">
          <span>0</span>
        </div>
      </div>
    </div>
  )
}

function RateLimitScreen({ retryAfter }) {
  const [seconds, setSeconds] = useState(retryAfter)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [seconds])

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="flex flex-col items-center text-center gap-4 py-16">
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-text-dim" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text mb-2">One submission per hour</h1>
          <p className="text-sm text-text-dim max-w-sm">
            You've already submitted a rice recently. You can submit again in
          </p>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-accent tabular-nums">
          {seconds > 0 ? formatCountdown(seconds) : 'now'}
        </p>
        {seconds === 0 && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-3 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [wm, setWm] = useState('')
  const [distro, setDistro] = useState('')
  const [license, setLicense] = useState('')
  const [palette, setPalette] = useState([])
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [colorInput, setColorInput] = useState('#')
  const { register, handleSubmit, getValues, watch, trigger, formState: { errors } } = useForm()

  const ipRef = useRef(null)
  const [rateLimit, setRateLimit] = useState({ loading: true, allowed: true, retryAfter: 0 })

  const title = watch('title')
  const author = watch('author')
  const githubUrl = watch('githubUrl')
  useEffect(() => {
    (async () => {
      const ip = await getClientIp()
      ipRef.current = ip

      if (!ip) {
        setRateLimit({ loading: false, allowed: true, retryAfter: 0 })
        return
      }

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_ip: ip,
        p_cooldown_minutes: RATE_LIMIT_MINUTES,
      })

      if (error) {
        console.error(error)
        setRateLimit({ loading: false, allowed: true, retryAfter: 0 })
        return
      }

      setRateLimit({ loading: false, allowed: data.allowed, retryAfter: data.retry_after_seconds })
    })()

  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([file]) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)) },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const addColor = () => {
    const hex = colorInput.trim()
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) { toast.error('Enter a valid hex, e.g. #1e1e2e'); return }
    if (palette.includes(hex) || palette.length >= 10) return
    setPalette((p) => [...p, hex])
    setColorInput('#')
  }

  const next = async () => {
    if (step === 0 && !imageFile) { toast.error('Please upload a screenshot first.'); return }
    if (step === 1) {
      const valid = await trigger('title')
      if (!valid) return
      if (!wm) { toast.error('Please select a WM / DE.'); return }
      if (!distro) { toast.error('Please select a distro.'); return }
    }
    if (step === 2) {
      const githubUrl = getValues('githubUrl')
      if (githubUrl) {
        const valid = await trigger('githubUrl')
        if (!valid) return
      }
    }
    setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    if (!rateLimit.allowed) return
    if (!wm || !distro) { toast.error('Missing required fields.'); setSubmitting(false); return }

    setSubmitting(true)
    const toastId = toast.loading('Uploading...')
    try {
      const image_url = await uploadImage(imageFile)
      toast.loading('Saving...', { id: toastId })

      const slug = generateSlug(data.author, data.title)

      const { error } = await supabase.functions.invoke(
        "submit-rice",
        {
          body: {
            turnstileToken,
            riceData: {
              title: data.title,
              author: data.author || "anonymous",
              description: data.description || "",
              github_url: data.githubUrl || "",
              notes: data.notes || "",
              wm,
              distro,
              palette,
              license,
              image_url,
              slug,
              status: "pending",
              views: 0,
              likes: 0,
              dislikes: 0,
            },
          },
        }
      )

      if (error) throw error
      if (ipRef.current) {
        await supabase.rpc('record_submission_attempt', { p_ip: ipRef.current })
      }

      toast.success('Submitted!', { id: toastId })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  const showPreview = step > 0

  if (rateLimit.loading) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <div className="flex items-center justify-center py-24">
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-5 h-5 text-text-dim" />
        </div>
      </div>
    )
  }

  if (!rateLimit.allowed) {
    return <RateLimitScreen retryAfter={rateLimit.retryAfter} />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text mb-2">Share your setup</h1>
        <p className="text-sm text-text-dim">{STEP_HINTS[step]}</p>
      </div>

      <ProgressBar step={step} />

      <div className={clsx('mt-10 grid gap-10 items-start', showPreview && 'lg:grid-cols-[1fr_320px]')}>
        <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
          <AnimatePresence mode="wait">

            {step === 0 && (
              <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                <div
                  {...getRootProps()}
                  className={clsx(
                    'relative rounded-3xl cursor-pointer overflow-hidden transition-colors duration-200',
                    isDragActive ? 'bg-accent/10' : 'bg-surface-2 hover:bg-surface-3'
                  )}
                >
                  <input {...getInputProps()} />
                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-72 rounded-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 to-transparent rounded-3xl pointer-events-none" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 flex items-center justify-center text-text hover:bg-surface cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-3 left-3 text-[11px] text-text-dim">Click to replace</span>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-11 h-11 rounded-full bg-surface-3 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCloudArrowUp} className="w-4 h-4 text-text-dim" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-text-dim">Drop your screenshot here</p>
                          <p className="text-xs text-muted mt-0.5">PNG, JPG, WEBP — max 8MB</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button type="button" onClick={next} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200">
                  Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Field placeholder="Title — e.g. Minimal Hyprland + Catppuccin" error={errors.title} {...register('title', { required: { value: true, message: 'Title is required' }, minLength: { value: 3, message: 'Title must be at least 3 characters' } })} />
                    {errors.title && <p className="text-xs text-red-300 mt-1.5">{errors.title.message}</p>}
                  </div>
                  <Field placeholder="Author (optional)" {...register('author')} />
                </div>
                <Textarea rows={3} placeholder="Description — what makes your setup special..." {...register('description')} />
                <div>
                  <FieldHint>Window manager / DE</FieldHint>
                  <Chips options={WM_OPTIONS} value={wm} onChange={setWm} />
                </div>
                <div>
                  <FieldHint>Distro</FieldHint>
                  <Chips options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                  </button>
                  <button type="button" onClick={next} className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200">
                    Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                <div className="relative">
                  <FontAwesomeIcon icon={faGithub} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                  <Field className="pl-11" placeholder="https://github.com/you/dotfiles" error={errors.githubUrl} {...register('githubUrl', { pattern: { value: /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?:\/)?$/, message: 'Must be a GitHub repo URL (e.g. https://github.com/user/repo)' } })} />
                  {errors.githubUrl && <p className="text-xs text-red-300 mt-1.5">{errors.githubUrl.message}</p>}
                </div>
                <div>
                  <FieldHint>License</FieldHint>
                  <Chips options={LICENSE_OPTIONS} value={license} onChange={setLicense} />
                </div>
                <div>
                  <FieldHint>Color palette</FieldHint>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface-3"
                        style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInput) ? colorInput : undefined }}
                      />
                      <Field className="pl-11 font-mono text-xs" placeholder="#1e1e2e" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                    </div>
                    <button type="button" onClick={addColor} className="px-5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-xs cursor-pointer transition-colors duration-200">+</button>
                  </div>
                  {palette.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {palette.map((color) => (
                        <div key={color} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-surface-2">
                          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[11px] font-mono text-text-dim">{color}</span>
                          <button type="button" onClick={() => setPalette(p => p.filter(x => x !== color))} className="text-muted hover:text-text-dim ml-0.5 cursor-pointer">
                            <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea rows={4} placeholder="Notes / config snippets — shell, font, terminal, compositor..." className="font-mono text-xs" {...register('notes')} />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-dim text-surface text-sm cursor-pointer transition-colors duration-200">
                    Review <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
                <div className="lg:hidden">
                  <RicePreviewCard title={title} author={author} wm={wm} palette={palette} imagePreview={imagePreview} />
                </div>
                {(license || githubUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {license && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim">{license}</span>}
                    {githubUrl && <span className="px-3 py-1.5 rounded-full text-[11px] bg-surface-2 text-text-dim truncate max-w-[220px]">{githubUrl}</span>}
                  </div>
                )}
                <p className="text-[11px] text-center text-muted">Your submission will be reviewed before appearing publicly.</p>

                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'dark' }}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-2 text-text-dim hover:bg-surface-3 hover:text-text text-sm cursor-pointer transition-colors duration-200">
                    <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                  </button>

                  <button type="submit" disabled={submitting || !turnstileToken} className="flex items-center justify-center gap-2 flex-1 py-3.5 rounded-full bg-accent hover:bg-accent-dim disabled:opacity-40 text-surface text-sm cursor-pointer transition-colors duration-200">
                    {submitting ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-4 h-4" /> : <><span>Submit rice</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>

        {showPreview && (
          <div className="hidden lg:block sticky top-28">
            <p className="text-xs text-muted mb-3">This is how your card will look</p>
            <RicePreviewCard title={title} author={author} wm={wm} palette={palette} imagePreview={imagePreview} />
          </div>
        )}
      </div>
    </div>
  )
}
