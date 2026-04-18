import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus, faArrowRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { uploadImage } from '../lib/cloudinary'
import clsx from 'clsx'

const WM_OPTIONS = ['Hyprland', 'i3', 'Sway', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other']
const DISTRO_OPTIONS = ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'openSUSE', 'Other']

function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2">
      {children}{required && <span className="text-[#e8ff47] ml-1">*</span>}
    </label>
  )
}

function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-3.5 py-2.5 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/20 outline-none transition-all',
        error ? 'border-red-500/50' : 'border-white/10 focus:border-[#e8ff47]/40 focus:bg-white/[0.03]',
        className
      )}
      {...props}
    />
  )
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full px-3.5 py-2.5 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none',
        error ? 'border-red-500/50' : 'border-white/10 focus:border-[#e8ff47]/40 focus:bg-white/[0.03]'
      )}
      {...props}
    />
  )
}

function SelectGrid({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={clsx(
            'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
            value === opt
              ? 'bg-[#e8ff47] border-[#e8ff47] text-black'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [wm, setWm] = useState('')
  const [distro, setDistro] = useState('')
  const [palette, setPalette] = useState([])
  const [colorInput, setColorInput] = useState('#')
  const { register, handleSubmit, formState: { errors } } = useForm()
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
  const removeColor = (c) => setPalette((p) => p.filter((x) => x !== c))
  const onSubmit = async (data) => {
    if (!imageFile) { toast.error('Please upload a screenshot.'); return }
    if (!wm || !distro) { toast.error('Please select WM and distro.'); return }
    setSubmitting(true)
    const toastId = toast.loading('Uploading...')
    try {
      const imageUrl = await uploadImage(imageFile)
      toast.loading('Saving...', { id: toastId })
      const docRef = await addDoc(collection(db, 'rices'), {
        ...data,
        wm, distro, palette, imageUrl,
        status: 'pending',
        author: data.author || 'anonymous',
        views: 0, stars: 0,
        createdAt: serverTimestamp(),
      })
      toast.success('Submitted!', { id: toastId })
      navigate(`/rice/${docRef.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e8ff47] mb-3">New submission</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Share your setup
        </h1>
        <p className="mt-2 text-sm text-white/40 leading-relaxed">
          Screenshot, config details, color palette — all in one place.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
        <div>
          <Label required>Screenshot</Label>
          <div
            {...getRootProps()}
            className={clsx(
              'relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
              isDragActive ? 'border-[#e8ff47]/60 bg-[#e8ff47]/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            )}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-black transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 gap-2">
                  <p className="text-sm text-white/30">Drop screenshot here</p>
                  <p className="text-xs text-white/20">PNG, JPG, WEBP — max 8MB</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <Label required>Title</Label>
          <Field placeholder="e.g. Minimal Hyprland with Catppuccin" error={errors.title} {...register('title', { required: true })} />
          {errors.title && <p className="text-xs text-red-400 mt-1.5">Title is required.</p>}
        </div>
        <div>
          <Label>Author</Label>
          <Field placeholder="anonymous" {...register('author')} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={3} placeholder="What makes your setup special..." {...register('description')} />
        </div>
        <div>
          <Label required>Window manager / DE</Label>
          <SelectGrid options={WM_OPTIONS} value={wm} onChange={setWm} />
        </div>
        <div>
          <Label required>Distro</Label>
          <SelectGrid options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
        </div>
        <div>
          <Label>Dotfiles URL</Label>
          <div className="relative">
            <FontAwesomeIcon icon={faGithub} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <Field className="pl-9" placeholder="https://github.com/you/dotfiles" {...register('githubUrl')} />
          </div>
        </div>
        <div>
          <Label>Color palette</Label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <div
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-sm border border-white/20"
                style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInput) ? colorInput : 'transparent' }}
              />
              <Field className="pl-9 font-mono" placeholder="#1e1e2e" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} />
            </div>
            <button type="button" onClick={addColor} className="px-3.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white text-xs transition-colors">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          {palette.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {palette.map((color) => (
                <div key={color} className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <div className="w-3.5 h-3.5 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-mono text-white/40">{color}</span>
                  <button type="button" onClick={() => removeColor(color)} className="text-white/20 hover:text-white ml-0.5 transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Notes / config snippets</Label>
          <Textarea rows={4} placeholder="Shell, font, terminal, compositor settings..." className="font-mono text-xs" {...register('notes')} />
        </div>
        <div className="pt-2 border-t border-white/5">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-40 text-black font-semibold text-sm transition-colors"
          >
            {submitting
              ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
              : <><span>Submit rice</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
