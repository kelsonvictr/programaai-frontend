// src/components/BannerCarousel.tsx
import React from "react"
import { Carousel } from "react-bootstrap"
import { Link } from "react-router-dom"
import styles from "./BannerCarousel.module.css"
import { courses } from "../mocks/courses"

const BannerCarousel: React.FC = () => (
  <Carousel controls indicators interval={5000} className={styles.carousel}>
    {courses.map(c => (
      <Carousel.Item key={c.id} className={styles.item}>
        <Link to={`/cursos/${c.id}`}>
          <img
            className={styles.image}
            src={`${c.bannerSite}`}
            alt={c.title}
          />
        </Link>
      </Carousel.Item>
    ))}
  </Carousel>
)

export default BannerCarousel
