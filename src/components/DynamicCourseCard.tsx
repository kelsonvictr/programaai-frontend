// src/components/DynamicCourseCard.tsx
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "react-bootstrap"
import { FaArrowRight, FaClock, FaCalendarAlt } from "react-icons/fa"
import { getTechConfig, getGradient } from "../config/courseVisuals"
import "./DynamicCourseCard.css"

interface DynamicCourseCardProps {
  id: string
  title: string
  description?: string
  descricaoCurta?: string
  professor: string
  profFoto: string
  datas: string[]
  horario: string
  modalidade: string
  technologiaIcone?: string
  bgGradient?: string
}

const DynamicCourseCard: React.FC<DynamicCourseCardProps> = ({
  id,
  title,
  description,
  descricaoCurta,
  professor,
  profFoto,
  datas,
  horario,
  modalidade,
  technologiaIcone,
  bgGradient,
}) => {
  const [profPhotoError, setProfPhotoError] = useState(false)

  const techConfig = getTechConfig(technologiaIcone)
  const gradient = getGradient(bgGradient)
  
  // Usa descricaoCurta se disponível, senão pega os primeiros 80 chars da description
  const shortDescription = descricaoCurta || (description ? description.slice(0, 80) + "..." : "")
  
  // Iniciais do professor para fallback
  const professorInitials = professor
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("")

  // Formata as datas para exibição
  const datasFormatadas = datas.length > 0 
    ? `${datas.length} encontros`
    : "Datas a confirmar"

  return (
    <Card className="dynamic-course-card">
      <Link to={`/cursos/${id}`} style={{ textDecoration: 'none' }}>
        <div 
          className="dynamic-card-header"
          style={{ '--card-gradient': gradient } as React.CSSProperties}
        >
          <div className="dynamic-card-pattern" />
          
          <div className="dynamic-card-tech-icon">
            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              {techConfig.icon}
            </span>
          </div>

          <div className="dynamic-card-prof-info">
            {profFoto && !profPhotoError ? (
              <img
                src={profFoto}
                alt={professor}
                className="dynamic-card-prof-photo"
                onError={() => setProfPhotoError(true)}
              />
            ) : (
              <div className="dynamic-card-prof-photo-fallback">
                {professorInitials}
              </div>
            )}
            <p className="dynamic-card-prof-name">
              Prof. {professor.split(" ")[0]}
            </p>
          </div>
        </div>
      </Link>

      <div className="dynamic-card-body">
        <span className="dynamic-card-badge">{modalidade}</span>

        <h3 className="dynamic-card-title">
          <Link 
            to={`/cursos/${id}`} 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {title}
          </Link>
        </h3>

        {shortDescription && (
          <p className="dynamic-card-short-desc">{shortDescription}</p>
        )}

        <div className="dynamic-card-meta">
          <div className="dynamic-meta-row">
            <FaCalendarAlt size={14} style={{ color: techConfig.color }} />
            <span>{datasFormatadas}</span>
          </div>
          <div className="dynamic-meta-row">
            <FaClock size={14} style={{ color: techConfig.color }} />
            <span>{horario}</span>
          </div>
        </div>

        <Link to={`/cursos/${id}`} className="dynamic-card-button">
          Ver Detalhes <FaArrowRight />
        </Link>
      </div>
    </Card>
  )
}

export default DynamicCourseCard
