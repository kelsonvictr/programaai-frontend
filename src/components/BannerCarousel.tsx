// src/components/BannerCarousel.tsx
import React from "react"
import { Carousel } from "react-bootstrap"
import styles from "./BannerCarousel.module.css"
import { courses } from "../mocks/courses"

const BannerCarousel: React.FC = () => (
  <Carousel controls indicators interval={5000} className={styles.carousel}>
    {courses.map(c => (
      <Carousel.Item key={c.id} className={styles.item}>
        <img
          className={styles.image}
          src={`${c.bannerSite}`}
          alt={c.title}
        />
      </Carousel.Item>
    ))}
  </Carousel>
)

export default BannerCarousel
