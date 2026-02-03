import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap'
import { X, Plus } from 'react-bootstrap-icons'
import type { Task, TaskStatus, TaskPriority } from './GalaxyTaskBoard'

interface TaskModalProps {
  show: boolean
  task: Task | null
  onHide: () => void
  onSave: (taskData: Partial<Task>) => Promise<void>
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; emoji: string }[] = [
  { value: 'baixa', label: 'Baixa', emoji: '🟢' },
  { value: 'media', label: 'Média', emoji: '🔵' },
  { value: 'alta', label: 'Alta', emoji: '🟠' },
  { value: 'urgente', label: 'Urgente', emoji: '🔴' }
]

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: '📋 A Fazer' },
  { value: 'doing', label: '🚀 Fazendo' },
  { value: 'done', label: '✅ Concluído' }
]

export default function TaskModal({ show, task, onHide, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    status: 'todo' as TaskStatus,
    prioridade: 'media' as TaskPriority,
    categoria: '',
    responsavel: '',
    dataVencimento: '',
    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        prioridade: task.prioridade,
        categoria: task.categoria,
        responsavel: task.responsavel,
        dataVencimento: task.dataVencimento,
        tags: task.tags || []
      })
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        status: 'todo',
        prioridade: 'media',
        categoria: '',
        responsavel: '',
        dataVencimento: '',
        tags: []
      })
    }
    setError(null)
  }, [task, show])

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim()) {
      setError('Título é obrigatório')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave(formData)
      onHide()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="galaxy-modal-header">
        <Modal.Title>
          {task ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <Row className="g-3">
            {/* Título */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Título *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o título da tarefa..."
                  value={formData.titulo}
                  onChange={e => handleChange('titulo', e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>
            </Col>

            {/* Descrição */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Descreva a tarefa..."
                  value={formData.descricao}
                  onChange={e => handleChange('descricao', e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Status e Prioridade */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Prioridade</Form.Label>
                <Form.Select
                  value={formData.prioridade}
                  onChange={e => handleChange('prioridade', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Categoria e Responsável */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Categoria</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Curso, Financeiro, Tech..."
                  value={formData.categoria}
                  onChange={e => handleChange('categoria', e.target.value)}
                  list="categorias-datalist"
                />
                <datalist id="categorias-datalist">
                  <option value="Curso" />
                  <option value="Financeiro" />
                  <option value="Tech" />
                  <option value="Operacional" />
                  <option value="Marketing" />
                  <option value="Suporte" />
                </datalist>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Responsável</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome do responsável"
                  value={formData.responsavel}
                  onChange={e => handleChange('responsavel', e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Data de Vencimento */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Data de Vencimento</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dataVencimento}
                  onChange={e => handleChange('dataVencimento', e.target.value)}
                />
                <Form.Text className="text-muted">
                  📧 Você receberá lembretes por email: 3 dias antes, no dia, e diariamente após o vencimento
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Tags */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-bold">Tags</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Adicionar tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge
                        key={tag}
                        bg="primary"
                        className="d-flex align-items-center gap-1 px-2 py-1"
                        style={{ cursor: 'pointer' }}
                      >
                        #{tag}
                        <X
                          size={14}
                          onClick={() => handleRemoveTag(tag)}
                          style={{ cursor: 'pointer' }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : (task ? 'Atualizar' : 'Criar Tarefa')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
