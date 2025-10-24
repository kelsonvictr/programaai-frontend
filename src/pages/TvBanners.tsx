import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

type PlaylistItem = {
  src: string
  alt?: string
  durationSeconds?: number
}

type PlaylistConfig = {
  defaultDurationSeconds?: number
  items?: PlaylistItem[]
  refreshIntervalSeconds?: number
}

const PLAYLIST_URL = '/tv-banners/playlist.json'
const FALLBACK_DURATION_SECONDS = 20
const FALLBACK_REFRESH_INTERVAL_SECONDS = 300

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  backgroundColor: '#000',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative'
}

const imageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain'
}

const infoStyle: CSSProperties = {
  position: 'absolute',
  bottom: '1rem',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0, 0, 0, 0.6)',
  padding: '0.5rem 1rem',
  borderRadius: '999px',
  fontSize: '0.875rem',
  letterSpacing: '0.05em'
}

const TvBanners = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [defaultDuration, setDefaultDuration] = useState(FALLBACK_DURATION_SECONDS)
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(
    FALLBACK_REFRESH_INTERVAL_SECONDS
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPlaylist = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${PLAYLIST_URL}?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`Playlist não encontrada (${res.status})`)
      }
      const data: PlaylistConfig = await res.json()
      const items = Array.isArray(data.items) ? data.items.filter(Boolean) : []
      if (!items.length) {
        throw new Error('Nenhum banner configurado em playlist.json')
      }

      setPlaylist(items)
      setDefaultDuration(
        typeof data.defaultDurationSeconds === 'number' && data.defaultDurationSeconds > 0
          ? data.defaultDurationSeconds
          : FALLBACK_DURATION_SECONDS
      )
      setRefreshIntervalSeconds(
        typeof data.refreshIntervalSeconds === 'number' && data.refreshIntervalSeconds > 0
          ? data.refreshIntervalSeconds
          : FALLBACK_REFRESH_INTERVAL_SECONDS
      )
      setActiveIndex(prev => (prev >= items.length ? 0 : prev))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Falha ao carregar playlist')
      setPlaylist([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const previousRobots = document
      .querySelector<HTMLMetaElement>('meta[name="robots"]')
    let created = false
    let element = previousRobots
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('name', 'robots')
      document.head.appendChild(element)
      created = true
    }
    const prevContent = element.getAttribute('content')
    element.setAttribute('content', 'noindex, nofollow')
    return () => {
      if (!element) return
      if (created) {
        document.head.removeChild(element)
      } else if (prevContent !== null) {
        element.setAttribute('content', prevContent)
      } else {
        element.removeAttribute('content')
      }
    }
  }, [])

  useEffect(() => {
    void loadPlaylist()
  }, [])

  useEffect(() => {
    if (!playlist.length) return
    const current = playlist[activeIndex]
    const durationMs = Math.max(
      1000,
      (current?.durationSeconds ?? defaultDuration) * 1000
    )
    const timer = setTimeout(
      () => setActiveIndex(prev => (prev + 1) % playlist.length),
      durationMs
    )
    return () => clearTimeout(timer)
  }, [playlist, activeIndex, defaultDuration])

  useEffect(() => {
    if (!playlist.length) return
    const interval = Math.max(30, refreshIntervalSeconds) * 1000
    const timer = setInterval(() => {
      void loadPlaylist()
    }, interval)
    return () => clearInterval(timer)
  }, [playlist.length, refreshIntervalSeconds])

  const currentItem = useMemo(
    () => (playlist.length ? playlist[activeIndex % playlist.length] : null),
    [playlist, activeIndex]
  )

  if (loading && !playlist.length) {
    return (
      <div style={pageStyle}>
        <div style={infoStyle}>Carregando banners…</div>
      </div>
    )
  }

  if (!currentItem) {
    return (
      <div style={pageStyle}>
        <div style={infoStyle}>
          {error ?? 'Adicione imagens e configure public/tv-banners/playlist.json'}
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <img src={currentItem.src} alt={currentItem.alt ?? ''} style={imageStyle} />
      <div style={infoStyle}>
        Próxima em{' '}
        {`${currentItem.durationSeconds ?? defaultDuration}`}s • Banners: {playlist.length}
      </div>
    </div>
  )
}

export default TvBanners
