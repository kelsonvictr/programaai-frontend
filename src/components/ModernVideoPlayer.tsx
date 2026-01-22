import { useState, useRef, useEffect } from "react"
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from "react-icons/fa"
import "../styles/modern-video-player.css"

interface ModernVideoPlayerProps {
  videoSrc: string
  posterSrc: string
  title: string
}

const ModernVideoPlayer = ({ videoSrc, posterSrc, title }: ModernVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Autoplay muted após montar
    const video = videoRef.current
    if (video) {
      video.muted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch(() => {
            // Autoplay pode falhar em alguns browsers
            setIsPlaying(false)
          })
      }
    }
  }, [])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    const progress = (video.currentTime / video.duration) * 100
    setProgress(progress || 0)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * video.duration
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="modern-video-player"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="modern-video-player-video"
        poster={posterSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Seu navegador não suporta vídeo HTML5.
      </video>

      <div className={`video-player-overlay ${showControls ? 'visible' : ''}`}>
        <div className="video-player-header">
          <div className="video-badge">
            <span className="video-badge-icon">🎬</span>
            <span className="video-badge-text">{title}</span>
          </div>
        </div>

        <div className="video-player-center">
          {!isPlaying && (
            <button
              className="video-play-big"
              onClick={handlePlayPause}
              aria-label="Reproduzir vídeo"
            >
              <FaPlay size={40} />
            </button>
          )}
        </div>

        <div className="video-player-controls">
          <div 
            className="video-progress-bar"
            onClick={handleProgressClick}
          >
            <div 
              className="video-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="video-controls-buttons">
            <button
              className="video-control-btn"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
            </button>

            <button
              className="video-control-btn"
              onClick={handleMuteToggle}
              aria-label={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            </button>

            <div className="video-controls-spacer" />

            <button
              className="video-control-btn"
              onClick={handleFullscreen}
              aria-label="Tela cheia"
            >
              <FaExpand size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModernVideoPlayer
