import { useState } from 'react'
import { CATEGORIES } from '../../data/farmerProducts.js'
import AppImage from '../image/AppImage.jsx'
import { uploadImage } from '../../services/uploadService.js'

const inputClass =
  'bg-white border border-forest/15 px-4 py-2.5 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors'

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-forest-deep/70">{label}</span>
      {children}
      {error && <span className="text-xs text-red-700/80">{error}</span>}
    </label>
  )
}

/**
 * Shared form for both Add Product (/farmer/products/new) and Edit
 * Product (/farmer/products/:id/edit) — pass an existing product to
 * pre-fill for editing, or omit it to start blank.
 */
export default function ProductForm({ initialProduct, onSubmit, onCancel, submitLabel = 'Add Product' }) {
  const [form, setForm] = useState({
    name: initialProduct?.name ?? '',
    category: initialProduct?.category ?? CATEGORIES[0],
    description: initialProduct?.description ?? '',
    price: initialProduct?.price ?? '',
    unit: initialProduct?.unit ?? 'kg',
    stock: initialProduct?.stock ?? '',
    available: initialProduct?.available ?? true,
    image: initialProduct?.images?.[0] ?? '',
    tags: initialProduct?.tags?.join(', ') ?? ''
  })
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setUploadError('Choose a JPEG, PNG or WebP image.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be 5 MB or smaller.'); return }
    setUploading(true)
    try {
      const path = await uploadImage('products', file)
      setForm((f) => ({ ...f, image: path }))
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Are you signed in as an approved farmer?')
    } finally { setUploading(false) }
  }

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Product name is required.'
    if (form.price === '' || Number(form.price) <= 0) next.price = 'Enter a valid price.'
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'Enter a valid stock quantity.'
    if (!form.unit.trim()) next.unit = 'Unit is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit.trim(),
      stock: Number(form.stock),
      available: form.stock === '' ? form.available : Number(form.stock) > 0 && form.available,
      images: form.image ? [form.image] : [],
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <Field label="Product Name" error={errors.name}>
        <input type="text" value={form.name} onChange={update('name')} className={inputClass} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Category">
          <select value={form.category} onChange={update('category')} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Unit" error={errors.unit}>
          <input type="text" value={form.unit} onChange={update('unit')} placeholder="kg, bunch, liter…" className={inputClass} />
        </Field>
      </div>

      <Field label="Description">
        <textarea rows={3} value={form.description} onChange={update('description')} className={`${inputClass} resize-none`} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Price (Rs.)" error={errors.price}>
          <input type="number" min="0" step="1" value={form.price} onChange={update('price')} className={inputClass} />
        </Field>

        <Field label="Stock Quantity" error={errors.stock}>
          <input type="number" min="0" step="1" value={form.stock} onChange={update('stock')} className={inputClass} />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-forest-deep/70">Product Image</span>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 border border-forest/10 bg-cream-soft"><AppImage src={form.image} alt="Product preview" kind="product" /></div>
          <div className="flex flex-col gap-2 min-w-0">
            <label className="inline-flex w-fit cursor-pointer items-center border border-forest/25 px-4 py-2 text-sm text-forest-deep hover:border-olive focus-within:ring-2 focus-within:ring-olive">
              {uploading ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} className="sr-only" />
            </label>
            <span className="text-xs text-forest-deep/50">JPEG, PNG or WebP, up to 5 MB.</span>
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-forest-deep/55">…or paste an image path</span>
          <input type="text" value={form.image} onChange={update('image')} placeholder="/uploads/images/products/example.jpg" className={inputClass} />
        </label>
        {uploadError && <span role="alert" className="text-xs text-red-700/80">{uploadError}</span>}
      </div>

      <Field label="Tags (comma separated)">
        <input type="text" value={form.tags} onChange={update('tags')} placeholder="Fresh, Local, Organic" className={inputClass} />
      </Field>

      <label className="flex items-center gap-2.5 text-sm text-forest-deep/75">
        <input type="checkbox" checked={form.available} onChange={update('available')} className="h-4 w-4 accent-olive" />
        Available for sale
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="px-6 py-3 bg-forest-deep text-cream text-sm hover:bg-forest-light transition-colors">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-forest/20 text-forest-deep text-sm hover:border-olive/60 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
