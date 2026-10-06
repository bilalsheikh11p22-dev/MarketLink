import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { ApiError } from '../utils/ApiError.js'
import { success } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_ROOT = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(__dirname, '../../uploads')
export const IMAGE_FOLDERS = ['products', 'farmers', 'farms', 'markets', 'avatars']
const MAX_BYTES = 5 * 1024 * 1024

// Permissions per folder
export const FOLDER_ROLES = { products: ['farmer', 'admin'], farms: ['farmer', 'admin'], farmers: ['farmer', 'admin'], markets: ['admin'], avatars: ['customer', 'farmer', 'admin'] }

function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp'
  return null
}

export const uploader = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: 1 } }).single('image')

export const saveImage = asyncHandler(async (req, res) => {
  const folder = req.params.folder
  if (!IMAGE_FOLDERS.includes(folder)) throw new ApiError(404, `Unknown folder. Use one of: ${IMAGE_FOLDERS.join(', ')}`)
  if (!FOLDER_ROLES[folder].includes(req.user.role)) throw new ApiError(403, 'You cannot upload to this folder')
  if (!req.file) throw new ApiError(422, 'Attach an image in the "image" field')
  // Validate by content (magic bytes), never trusting the client-sent mimetype or filename.
  const ext = sniff(req.file.buffer)
  if (!ext) throw new ApiError(422, 'Only JPEG, PNG or WebP images are allowed')
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const dir = path.join(UPLOAD_ROOT, 'images', folder)
  await fs.promises.mkdir(dir, { recursive: true })
  await fs.promises.writeFile(path.join(dir, name), req.file.buffer)
  success(res, { path: `/uploads/images/${folder}/${name}`, size: req.file.size }, 'Image uploaded', 201)
})

/** Lists what is actually on disk, so the admin can see which files exist (never invents entries). */
export const listImages = asyncHandler(async (req, res) => {
  const out = {}
  for (const f of IMAGE_FOLDERS) {
    const dir = path.join(UPLOAD_ROOT, 'images', f)
    out[f] = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /\.(jpe?g|png|webp|avif)$/i.test(n)).map((n) => `/uploads/images/${f}/${n}`) : []
  }
  success(res, { images: out })
})
