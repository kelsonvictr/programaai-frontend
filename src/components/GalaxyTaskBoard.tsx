import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal, Badge } from 'react-bootstrap'
import { Plus, Search, Funnel, Calendar3, Tag, PersonCircle, XCircle } from 'react-bootstrap-icons'
import axios from 'axios'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import '../styles/galaxy-task-board.css'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const TASKS_ENDPOINT = `${API_BASE}/galaxy/tasks`

export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente'

export interface Task {
  id: string
  titulo: string
  descricao: string
  status: TaskStatus
  prioridade: TaskPriority
  categoria: string
  responsavel: string
  dataVencimento: string
  tags: string[]
  criadoEm: number
  atualizadoEm: number
  criadoPor: string
  ordem: number
  notificacao3Dias?: boolean
  notificacaoVencimento?: boolean
  notificacaoAtrasada?: boolean
}

interface GalaxyTaskBoardProps {
  token: string
}

const STATUS_CONFIG = {
  todo: { label: '📋 A Fazer', color: '#6366f1', bgColor: '#eef2ff' },
  doing: { label: '🚀 Fazendo', color: '#10b981', bgColor: '#d1fae5' },
  done: { label: '✅ Concluído', color: '#64748b', bgColor: '#f1f5f9' }
}

const PRIORITY_CONFIG = {
  baixa: { label: 'Baixa', color: '#94a3b8', emoji: '🟢' },
  media: { label: 'Média', color: '#3b82f6', emoji: '🔵' },
  alta: { label: 'Alta', color: '#f59e0b', emoji: '🟠' },
  urgente: { label: 'Urgente', color: '#ef4444', emoji: '🔴' }
}

export default function GalaxyTaskBoard({ token }: GalaxyTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal de criação/edição
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'todas'>('todas')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [filterResponsavel, setFilterResponsavel] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Quick add
  const [quickAddStatus, setQuickAddStatus] = useState<TaskStatus | null>(null)
  const [quickAddTitle, setQuickAddTitle] = useState('')

  useEffect(() => {
    void fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<{ tasks: Task[] }>(TASKS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(data.tasks || [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const { data } = await axios.post<{ task: Task }>(
        TASKS_ENDPOINT,
        taskData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTasks(prev => [...prev, data.task])
      return data.task
    } catch (err) {
      console.error(err)
      throw new Error('Erro ao criar tarefa')
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data } = await axios.put<{ task: Task }>(
        `${TASKS_ENDPOINT}/${taskId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
      return data.task
    } catch (err) {
      console.error(err)
      throw new Error('Erro ao atualizar tarefa')
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return
    
    try {
      await axios.delete(`${TASKS_ENDPOINT}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir tarefa')
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Otimistic update
    const oldTasks = [...tasks]
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    try {
      await updateTask(taskId, { status: newStatus })
    } catch (err) {
      // Rollback on error
      setTasks(oldTasks)
      alert('Erro ao mover tarefa')
    }
  }

  const handleQuickAdd = async (status: TaskStatus) => {
    if (!quickAddTitle.trim()) return

    try {
      await createTask({
        titulo: quickAddTitle,
        status,
        prioridade: 'media',
        descricao: '',
        categoria: '',
        responsavel: '',
        dataVencimento: '',
        tags: []
      })
      setQuickAddTitle('')
      setQuickAddStatus(null)
    } catch (err) {
      alert('Erro ao criar tarefa')
    }
  }

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    // Busca por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchTitle = task.titulo.toLowerCase().includes(search)
      const matchDesc = task.descricao.toLowerCase().includes(search)
      const matchTags = task.tags.some(tag => tag.toLowerCase().includes(search))
      if (!matchTitle && !matchDesc && !matchTags) return false
    }

    // Filtro de prioridade
    if (filterPriority !== 'todas' && task.prioridade !== filterPriority) {
      return false
    }

    // Filtro de categoria
    if (filterCategory !== 'todas' && task.categoria !== filterCategory) {
      return false
    }

    // Filtro de responsável
    if (filterResponsavel !== 'todos' && task.responsavel !== filterResponsavel) {
      return false
    }

    return true
  })

  // Agrupar por status
  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo').sort((a, b) => a.ordem - b.ordem),
    doing: filteredTasks.filter(t => t.status === 'doing').sort((a, b) => a.ordem - b.ordem),
    done: filteredTasks.filter(t => t.status === 'done').sort((a, b) => b.atualizadoEm - a.atualizadoEm)
  }

  // Pegar categorias e responsáveis únicos para filtros
  const categorias = Array.from(new Set(tasks.map(t => t.categoria).filter(Boolean)))
  const responsaveis = Array.from(new Set(tasks.map(t => t.responsavel).filter(Boolean)))

  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null)
    setShowModal(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
      } else {
        await createTask(taskData)
      }
      setShowModal(false)
      setEditingTask(null)
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando tarefas...</p>
      </div>
    )
  }

  return (
    <div className="galaxy-task-board">
      {/* Header */}
      <div className="galaxy-task-header">
        <div>
          <h2 className="galaxy-task-title">
            <span className="galaxy-task-icon">📋</span>
            Quadro de Tarefas
          </h2>
          <p className="galaxy-task-subtitle">
            {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} no total
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => handleOpenModal()}
          className="galaxy-btn-new-task"
        >
          <Plus size={20} /> Nova Tarefa
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros e Busca */}
      <div className="galaxy-task-filters-bar">
        <div className="galaxy-task-search">
          <Search className="galaxy-task-search-icon" />
          <Form.Control
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="galaxy-task-search-input"
          />
          {searchTerm && (
            <XCircle 
              className="galaxy-task-search-clear"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>

        <Button
          variant={showFilters ? 'primary' : 'outline-primary'}
          onClick={() => setShowFilters(!showFilters)}
          className="galaxy-btn-toggle-filters"
        >
          <Funnel size={16} /> Filtros
          {(filterPriority !== 'todas' || filterCategory !== 'todas' || filterResponsavel !== 'todos') && (
            <Badge bg="danger" pill className="ms-2">●</Badge>
          )}
        </Button>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <Card className="galaxy-task-filters-panel mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="small fw-bold">
                  <Tag size={14} className="me-1" /> Prioridade
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as TaskPriority | 'todas')}
                >
                  <option value="todas">Todas</option>
                  <option value="urgente">🔴 Urgente</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="media">🔵 Média</option>
                  <option value="baixa">🟢 Baixa</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label className="small fw-bold">
                  <Calendar3 size={14} className="me-1" /> Categoria
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label className="small fw-bold">
                  <PersonCircle size={14} className="me-1" /> Responsável
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={filterResponsavel}
                  onChange={e => setFilterResponsavel(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {responsaveis.map(resp => (
                    <option key={resp} value={resp}>{resp}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {(filterPriority !== 'todas' || filterCategory !== 'todas' || filterResponsavel !== 'todos') && (
              <div className="text-center mt-3">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setFilterPriority('todas')
                    setFilterCategory('todas')
                    setFilterResponsavel('todos')
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Kanban Board */}
      <Row className="g-4">
        {(['todo', 'doing', 'done'] as TaskStatus[]).map(status => {
          const config = STATUS_CONFIG[status]
          const columnTasks = tasksByStatus[status]

          return (
            <Col key={status} lg={4}>
              <div className="galaxy-task-column">
                {/* Column Header */}
                <div 
                  className="galaxy-task-column-header"
                  style={{ 
                    background: config.bgColor,
                    borderBottom: `3px solid ${config.color}`
                  }}
                >
                  <div className="galaxy-task-column-title">
                    {config.label}
                  </div>
                  <Badge 
                    bg="light" 
                    text="dark"
                    className="galaxy-task-column-count"
                  >
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Column Body */}
                <div className="galaxy-task-column-body">
                  {/* Quick Add */}
                  {quickAddStatus === status ? (
                    <div className="galaxy-task-quick-add">
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Título da tarefa..."
                        value={quickAddTitle}
                        onChange={e => setQuickAddTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            void handleQuickAdd(status)
                          } else if (e.key === 'Escape') {
                            setQuickAddStatus(null)
                            setQuickAddTitle('')
                          }
                        }}
                        autoFocus
                      />
                      <div className="d-flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleQuickAdd(status)}
                        >
                          Adicionar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-secondary"
                          onClick={() => {
                            setQuickAddStatus(null)
                            setQuickAddTitle('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="galaxy-task-add-btn"
                      onClick={() => setQuickAddStatus(status)}
                    >
                      <Plus size={16} /> Adicionar tarefa rápida
                    </button>
                  )}

                  {/* Tasks */}
                  {columnTasks.length === 0 && (
                    <div className="galaxy-task-empty">
                      Nenhuma tarefa
                    </div>
                  )}

                  {columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => handleOpenModal(task)}
                      onDelete={() => deleteTask(task.id)}
                      onMove={moveTask}
                    />
                  ))}
                </div>
              </div>
            </Col>
          )
        })}
      </Row>

      {/* Modal de Criação/Edição */}
      <TaskModal
        show={showModal}
        task={editingTask}
        onHide={() => {
          setShowModal(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
      />
    </div>
  )
}
