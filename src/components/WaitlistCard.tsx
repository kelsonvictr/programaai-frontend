import React from 'react'

type WaitlistEntry = {
  id: string
  nome: string
  email: string
  telefone?: string
  curso: string
  criadoEm: string
  comoConheceu?: string
}

interface WaitlistCardProps {
  item: WaitlistEntry
  curso: string
}

const WaitlistCard: React.FC<WaitlistCardProps> = ({ item, curso }) => {
  return (
    <div className="galaxy-waitlist-card">
      {/* Header */}
      <div className="galaxy-card-header">
        <div className="galaxy-card-user-info">
          <div className="galaxy-card-user-name">{item.nome || '-'}</div>
          <div className="galaxy-card-user-date">
            🗓️ {item.criadoEm ? new Date(item.criadoEm).toLocaleString('pt-BR') : '-'}
          </div>
        </div>
        <div className="galaxy-card-badges">
          <span className="galaxy-card-badge" style={{
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#a78bfa',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            ⏳ Lista de Espera
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="galaxy-card-body">
        {/* Email */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">📧 Email</div>
          <div className="galaxy-card-field-value email">{item.email || '-'}</div>
        </div>

        {/* Telefone */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">📱 Telefone</div>
          <div className="galaxy-card-field-value">{item.telefone || '-'}</div>
        </div>

        {/* Como Conheceu */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">💡 Como conheceu</div>
          <div className="galaxy-card-field-value">{item.comoConheceu || '-'}</div>
        </div>

        {/* Curso */}
        <div className="galaxy-card-field">
          <div className="galaxy-card-field-label">📚 Curso de interesse</div>
          <div className="galaxy-card-field-value" style={{ 
            color: 'var(--galaxy-accent-purple)',
            fontWeight: 600 
          }}>
            {curso}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitlistCard
