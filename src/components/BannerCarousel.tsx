// src/components/BannerCarousel.tsx
import React, { useEffect, useMemo, useState } from "react"
import { Carousel, Spinner } from "react-bootstrap"
import { Link } from "react-router-dom"
import styles from "./BannerCarousel.module.css"
import axios from "axios"

interface Course {
  id: string
  title: string
  bannerSite: string
  bannerMobile: string
  ativo?: boolean
}

const BannerCarousel: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    axios
      .get<Course[]>(`${import.meta.env.VITE_API_URL}/cursos`)
      .then(resp => {
        if (!mounted) return
        setCourses(resp.data || [])
      })
      .catch(err => {
        console.error("Erro ao carregar banners/cursos:", err)
        if (!mounted) return
        setError("Falha ao carregar destaques.")
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const ativos = useMemo(
    () => courses.filter(c => c.ativo !== false),
    [courses]
  )

  if (loading) {
    return (
      <div className={styles.carousel} style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
        <Spinner animation="border" role="status" />
      </div>
    )
  }

  if (error || ativos.length === 0) {
    // Sem banners para mostrar
    return null
  }

  return (
    <Carousel controls indicators interval={5000} className={styles.carousel}>
      {ativos.map(c => (
        <Carousel.Item key={c.id} className={styles.item}>
          <Link to={`/cursos/${c.id}`}>
            <picture>
              {/* Mobile até 576px */}
              <source media="(max-width: 576px)" srcSet={c.bannerMobile} />
              {/* Fallback (desktop) */}
              <img className={styles.image} src={c.bannerSite} alt={c.title} />
            </picture>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default BannerCarousel
