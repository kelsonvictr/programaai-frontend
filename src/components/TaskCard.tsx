import { Badge, Dropdown } from 'react-bootstrap'
import { ThreeDotsVertical, Calendar3, PersonCircle, Tag, ArrowRight } from 'react-bootstrap-icons'
import type { Task, TaskStatus } from './GalaxyTaskBoard'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
}

const PRIORITY_COLORS = {
  baixa: { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50', emoji: '🟢' },
  media: { bg: '#e3f2fd', text: '#1565c0', border: '#2196f3', emoji: '🔵' },
  alta: { bg: '#fff3e0', text: '#e65100', border: '#ff9800', emoji: '🟠' },
  urgente: { bg: '#ffebee', text: '#c62828', border: '#f44336', emoji: '🔴' }
}

export default function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const priorityStyle = PRIORITY_COLORS[task.prioridade]
  
  // Calcular status do vencimento
  const getVencimentoStatus = () => {
    if (!task.dataVencimento) return null
    
    try {
      const vencimento = new Date(task.dataVencimento)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      vencimento.setHours(0, 0, 0, 0)
      
      const diffTime = vencimento.getTime() - hoje.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return { type: 'atrasado', days: Math.abs(diffDays), color: '#ef4444' }
      } else if (diffDays === 0) {
        return { type: 'hoje', days: 0, color: '#f59e0b' }
      } else if (diffDays <= 3) {
        return { type: 'proximo', days: diffDays, color: '#f59e0b' }
      }
      return { type: 'normal', days: diffDays, color: '#64748b' }
    } catch {
      return null
    }
  }

  const vencimentoStatus = getVencimentoStatus()

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    } catch {
      return dateStr
    }
  }

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    if (currentStatus === 'todo') return 'doing'
    if (currentStatus === 'doing') return 'done'
    return null
  }

  const nextStatus = getNextStatus(task.status)

  return (
    <div 
      className="galaxy-task-card"
      style={{ 
        borderLeft: `4px solid ${priorityStyle.border}`,
        background: task.status === 'done' ? '#f8fafc' : 'white'
      }}
    >
      {/* Header */}
      <div className="galaxy-task-card-header">
        <Badge 
          className="galaxy-task-priority-badge"
          style={{ 
            background: priorityStyle.bg, 
            color: priorityStyle.text,
            border: `1px solid ${priorityStyle.border}`
          }}
        >
          {priorityStyle.emoji} {task.prioridade.toUpperCase()}
        </Badge>
        
        <Dropdown align="end">
          <Dropdown.Toggle 
            variant="link" 
            size="sm"
            className="galaxy-task-menu-btn"
          >
            <ThreeDotsVertical size={16} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={onEdit}>
              ✏️ Editar
            </Dropdown.Item>
            {nextStatus && (
              <Dropdown.Item onClick={() => onMove(task.id, nextStatus)}>
                <ArrowRight size={16} className="me-1" />
                Mover para {nextStatus === 'doing' ? 'Fazendo' : 'Concluído'}
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={onDelete} className="text-danger">
              🗑️ Excluir
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Título */}
      <h6 
        className="galaxy-task-card-title"
        onClick={onEdit}
        style={{ 
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          opacity: task.status === 'done' ? 0.6 : 1
        }}
      >
        {task.titulo}
      </h6>

      {/* Descrição */}
      {task.descricao && (
        <p className="galaxy-task-card-description">
          {task.descricao.length > 100 
            ? task.descricao.substring(0, 100) + '...' 
            : task.descricao
          }
        </p>
      )}

      {/* Metadata */}
      <div className="galaxy-task-card-meta">
        {task.categoria && (
          <span className="galaxy-task-meta-item">
            <Tag size={12} /> {task.categoria}
          </span>
        )}
        
        {task.responsavel && (
          <span className="galaxy-task-meta-item">
            <PersonCircle size={12} /> {task.responsavel}
          </span>
        )}
        
        {task.dataVencimento && vencimentoStatus && (
          <span 
            className="galaxy-task-meta-item galaxy-task-vencimento"
            style={{ 
              color: vencimentoStatus.color,
              fontWeight: vencimentoStatus.type !== 'normal' ? 600 : 400
            }}
          >
            <Calendar3 size={12} />
            {vencimentoStatus.type === 'atrasado' && (
              <span className="galaxy-task-alert-icon">⚠️</span>
            )}
            {vencimentoStatus.type === 'hoje' && (
              <span className="galaxy-task-alert-icon">🔥</span>
            )}
            {formatDate(task.dataVencimento)}
            {vencimentoStatus.type === 'atrasado' && ` (${vencimentoStatus.days}d atrasado)`}
            {vencimentoStatus.type === 'hoje' && ' (HOJE)'}
            {vencimentoStatus.type === 'proximo' && ` (${vencimentoStatus.days}d)`}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="galaxy-task-card-tags">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="galaxy-task-tag">
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="galaxy-task-tag-more">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
