import { readdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')
const BASE = join(PUBLIC, 'galerias')

// formatos suportados (evitamos .heic e .mov no site)
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
const VIDEO_EXTS = ['.mp4', '.webm']

const listFiles = async (dir, exts) => {
  let items = []
  try {
    const all = await readdir(dir, { withFileTypes: true })
    for (const d of all) {
      if (!d.isFile()) continue
      const lower = d.name.toLowerCase()
      if (!exts.some(ext => lower.endsWith(ext))) continue
      const abs = join(dir, d.name)
      const s = await stat(abs)
      items.push({
        file: abs.replace(PUBLIC, '').replaceAll('\\', '/'),
        size: s.size,
        mtime: s.mtimeMs
      })
    }
  } catch {
    // pasta pode não existir
  }
  items.sort((a, b) => b.mtime - a.mtime)
  return items
}

const buildGallery = async slug => {
  const dirFotos = join(BASE, slug, 'fotos')
  const dirVideos = join(BASE, slug, 'videos')
  const fotos = await listFiles(dirFotos, IMAGE_EXTS)
  const videos = await listFiles(dirVideos, VIDEO_EXTS)

  return {
    fotos: fotos.map(f => ({ src: f.file, mtime: f.mtime, size: f.size })),
    videos: videos.map(v => ({ src: v.file, mtime: v.mtime, size: v.size }))
  }
}

const run = async () => {
  let slugs = []
  try {
    const entries = await readdir(BASE, { withFileTypes: true })
    slugs = entries.filter(e => e.isDirectory()).map(e => e.name)
  } catch {
    slugs = []
  }

  const galleries = {}
  for (const slug of slugs) {
    galleries[slug] = await buildGallery(slug)
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    galleries
  }

  const out = join(PUBLIC, 'galleries-index.json')
  await writeFile(out, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`galleries-index.json gerado com ${slugs.length} galerias`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
