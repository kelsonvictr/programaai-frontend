import { useEffect, useMemo, useState } from 'react'

export type GalleryMedia = { src: string, mtime: number, size: number }
export type GalleriesIndex = {
  generatedAt: string
  galleries: Record<string, { fotos: GalleryMedia[], videos: GalleryMedia[] }>
}

export const useGalleriesIndex = () => {
  const [data, setData] = useState<GalleriesIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/galleries-index.json', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar galleries-index.json')
        return r.json()
      })
      .then((json: GalleriesIndex) => {
        if (!alive) return
        // reforço de ordenação (o arquivo já vem ordenado)
        Object.values(json.galleries).forEach(g => {
          g.fotos.sort((a, b) => b.mtime - a.mtime)
          g.videos.sort((a, b) => b.mtime - a.mtime)
        })
        setData(json)
      })
      .catch(() => alive && setError('Não foi possível carregar as galerias'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  return { data, loading, error }
}

export const useGallery = (slug: string) => {
  const { data, loading, error } = useGalleriesIndex()
  const gallery = useMemo(() => data?.galleries?.[slug] ?? { fotos: [], videos: [] }, [data, slug])
  return { gallery, loading, error }
}
