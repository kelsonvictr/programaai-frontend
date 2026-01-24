// src/components/GalaxyCourseManager.tsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Card,
  Modal,
  Accordion
} from 'react-bootstrap'
import { PlusCircle, Pencil, Eye, EyeSlash, Save, X } from 'react-bootstrap-icons'
import DynamicCourseCard from './DynamicCourseCard'
import { TECH_ICONS, BG_GRADIENTS } from '../config/courseVisuals'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const CURSOS_ENDPOINT = `${API_BASE}/galaxy/cursos`
const SEND_2FA_ENDPOINT = `${API_BASE}/galaxy/cursos/2fa/send`

interface Curso {
  id: string
  ativo: boolean
  title: string
  description: string
  professor: string
  profFoto: string
  modalidade: string
  horario: string
  price: string
  duration?: string
  linkedin?: string
  bio?: string
  imageUrl?: string
  bannerSite?: string
  bannerMobile?: string
  datas: string[]
  modulos?: string[]
  prerequisitos?: string[]
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  faq?: Array<{ pergunta: string; resposta: string }>
  video?: string
  obsPrice?: string
  technologiaIcone?: string
  bgGradient?: string
  descricaoCurta?: string
  criadoEm?: string
  atualizadoEm?: string
}

interface GalaxyCourseManagerProps {
  token: string
  adminEmail: string
}

const GalaxyCourseManager: React.FC<GalaxyCourseManagerProps> = ({ token, adminEmail }) => {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Modal de criação/edição
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  
  // Formulário
  const [formData, setFormData] = useState<Partial<Curso>>({
    ativo: true,
    title: '',
    description: '',
    professor: '',
    profFoto: '/professores/kelson.jpeg',
    modalidade: 'PRESENCIAL',
    horario: '19h00 - 21h00',
    price: 'R$',
    datas: [],
    modulos: [],
    prerequisitos: [],
    publicoAlvo: [],
    oQueVaiAprender: [],
    faq: []
  })
  
  // 2FA
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [code2FA, setCode2FA] = useState('')
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'update' | 'delete'
    data?: any
  } | null>(null)
  
  // Preview do card
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadCursos()
  }, [token])

  const loadCursos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(CURSOS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCursos(response.data.cursos || [])
    } catch (err: any) {
      console.error('Erro ao carregar cursos:', err)
      setError(err.response?.data?.error || 'Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }

  const request2FACode = async () => {
    setError(null)
    try {
      await axios.post(
        SEND_2FA_ENDPOINT,
        { adminEmail, operation: 'course_management' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('✉️ Código 2FA enviado para seu email!')
      setShow2FAModal(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar código 2FA')
    }
  }

  const handleCreate = () => {
    setPendingAction({ type: 'create' })
    request2FACode()
  }

  const handleUpdate = (curso: Curso) => {
    setSelectedCurso(curso)
    setFormData(curso)
    setEditMode(true)
    setShowModal(true)
  }

  const submitUpdate = () => {
    setPendingAction({ type: 'update', data: formData })
    setShowModal(false)
    request2FACode()
  }

  const handleDelete = (curso: Curso) => {
    if (confirm(`Tem certeza que deseja desativar o curso "${curso.title}"?`)) {
      setPendingAction({ type: 'delete', data: curso.id })
      request2FACode()
    }
  }

  const execute2FAAction = async () => {
    if (!pendingAction || !code2FA) return

    setLoading(true)
    setError(null)
    setShow2FAModal(false)

    try {
      if (pendingAction.type === 'create') {
        await axios.post(
          CURSOS_ENDPOINT,
          { adminEmail, code2fa: code2FA, curso: formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('✅ Curso criado com sucesso!')
      } else if (pendingAction.type === 'update') {
        await axios.put(
          `${CURSOS_ENDPOINT}/${selectedCurso?.id}`,
          { adminEmail, code2fa: code2FA, curso: pendingAction.data },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('✅ Curso atualizado com sucesso!')
      } else if (pendingAction.type === 'delete') {
        await axios.delete(
          `${CURSOS_ENDPOINT}/${pendingAction.data}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { adminEmail, code2fa: code2FA }
          }
        )
        setSuccess('✅ Curso desativado com sucesso!')
      }

      await loadCursos()
      resetForm()
    } catch (err: any) {
      console.error('Erro na operação:', err)
      setError(err.response?.data?.error || 'Erro ao executar operação')
    } finally {
      setLoading(false)
      setCode2FA('')
      setPendingAction(null)
    }
  }

  const resetForm = () => {
    setFormData({
      ativo: true,
      title: '',
      description: '',
      professor: '',
      profFoto: '/professores/kelson.jpeg',
      modalidade: 'PRESENCIAL',
      horario: '19h00 - 21h00',
      price: 'R$',
      datas: [],
      modulos: [],
      prerequisitos: [],
      publicoAlvo: [],
      oQueVaiAprender: [],
      faq: []
    })
    setSelectedCurso(null)
    setEditMode(false)
    setShowModal(false)
  }

  // Funções preparadas para gerenciar campos de array (datas, módulos, etc) - descomente quando necessário
  /* 
  const handleArrayFieldAdd = (field: keyof Curso, value: string) => {
    if (!value.trim()) return
    const currentArray = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: [...currentArray, value.trim()] })
  }

  const handleArrayFieldRemove = (field: keyof Curso, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData({ ...formData, [field]: currentArray.filter((_, i) => i !== index) })
  }
  */

  const isCardDynamic = () => {
    return !!(formData.technologiaIcone || formData.bgGradient)
  }

  return (
    <div className="galaxy-course-manager">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="galaxy-section-title">🎓 Gerenciamento de Cursos</h2>
          <p className="text-muted">Total: {cursos.length} cursos</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          disabled={loading}
        >
          <PlusCircle className="me-2" />
          Novo Curso
        </Button>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Carregando...</p>
        </div>
      )}

      {/* Lista de Cursos */}
      {!loading && (
        <Row>
          {cursos.map((curso) => (
            <Col key={curso.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className={`course-card-admin ${!curso.ativo ? 'inactive' : ''}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg={curso.ativo ? 'success' : 'secondary'}>
                      {curso.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <div>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleUpdate(curso)}
                        title="Editar"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger"
                        onClick={() => handleDelete(curso)}
                        title="Desativar"
                      >
                        {curso.ativo ? <EyeSlash /> : <Eye />}
                      </Button>
                    </div>
                  </div>

                  <h5 className="card-title">{curso.title}</h5>
                  <p className="text-muted small mb-2">
                    <strong>Professor:</strong> {curso.professor}
                  </p>
                  <p className="text-muted small mb-2">
                    <strong>Preço:</strong> {curso.price}
                  </p>
                  <p className="text-muted small mb-2">
                    <strong>Modalidade:</strong> {curso.modalidade}
                  </p>
                  
                  {(curso.technologiaIcone || curso.bgGradient) && (
                    <Badge bg="info" className="mt-2">
                      Card Dinâmico
                    </Badge>
                  )}
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      ID: {curso.id} | Criado: {curso.criadoEm ? new Date(curso.criadoEm).toLocaleDateString() : 'N/A'}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Criação/Edição - PARTE 1 */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? '✏️ Editar Curso' : '➕ Novo Curso'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
              {/* Informações Básicas */}
              <Accordion.Item eventKey="0">
                <Accordion.Header>📋 Informações Básicas</Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Título *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={formData.ativo ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Descrição *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Professor *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.professor || ''}
                          onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Foto do Professor</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.profFoto || ''}
                          onChange={(e) => setFormData({ ...formData, profFoto: e.target.value })}
                          placeholder="/professores/nome.jpeg"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>LinkedIn</Form.Label>
                        <Form.Control
                          type="url"
                          value={formData.linkedin || ''}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Biografia do Professor</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Modalidade *</Form.Label>
                        <Form.Select
                          value={formData.modalidade || ''}
                          onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                          required
                        >
                          <option value="PRESENCIAL">PRESENCIAL</option>
                          <option value="REMOTO">REMOTO</option>
                          <option value="PRESENCIAL | REMOTO">PRESENCIAL | REMOTO</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Horário *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.horario || ''}
                          onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                          placeholder="19h00 - 21h00"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Duração</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.duration || ''}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="24 horas (12 encontros)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Preço *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="R$399,99"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Observação do Preço</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.obsPrice || ''}
                          onChange={(e) => setFormData({ ...formData, obsPrice: e.target.value })}
                          placeholder="PREÇO PROMOCIONAL!"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* Card Dinâmico */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  🎨 Configuração do Card Dinâmico {isCardDynamic() && <Badge bg="success" className="ms-2">Ativo</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Alert variant="info">
                    <small>
                      <strong>Card Dinâmico:</strong> Se você configurar ícone OU gradiente, o card será gerado dinamicamente (sem precisar de imagem PNG).
                      Caso contrário, usará a imagem estática em "imageUrl".
                    </small>
                  </Alert>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ícone da Tecnologia</Form.Label>
                        <Form.Select
                          value={formData.technologiaIcone || ''}
                          onChange={(e) => setFormData({ ...formData, technologiaIcone: e.target.value })}
                        >
                          <option value="">Nenhum (usar imagem estática)</option>
                          {Object.keys(TECH_ICONS).map((key) => (
                            <option key={key} value={key}>
                              {TECH_ICONS[key].icon} {key}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gradiente de Fundo</Form.Label>
                        <Form.Select
                          value={formData.bgGradient || ''}
                          onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
                        >
                          <option value="">Nenhum (usar imagem estática)</option>
                          {Object.keys(BG_GRADIENTS).map((key) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Preview do Card</Form.Label>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            disabled={!isCardDynamic()}
                          >
                            {showPreview ? 'Ocultar' : 'Visualizar'} Preview
                          </Button>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Descrição Curta (para o card)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.descricaoCurta || ''}
                      onChange={(e) => setFormData({ ...formData, descricaoCurta: e.target.value })}
                      placeholder="Máximo 80 caracteres"
                      maxLength={80}
                    />
                    <Form.Text className="text-muted">
                      {(formData.descricaoCurta?.length || 0)}/80 caracteres
                    </Form.Text>
                  </Form.Group>

                  {/* Preview do Card Dinâmico */}
                  {showPreview && isCardDynamic() && (
                    <div className="mt-4 p-4 border rounded bg-dark">
                      <h6 className="text-white mb-3">Preview do Card:</h6>
                      <div style={{ maxWidth: '400px' }}>
                        <DynamicCourseCard
                          id="preview"
                          title={formData.title || 'Título do Curso'}
                          description={formData.description}
                          descricaoCurta={formData.descricaoCurta}
                          professor={formData.professor || 'Professor'}
                          profFoto={formData.profFoto || '/professores/default.jpeg'}
                          datas={formData.datas || []}
                          horario={formData.horario || '19h00 - 21h00'}
                          modalidade={formData.modalidade || 'PRESENCIAL'}
                          technologiaIcone={formData.technologiaIcone}
                          bgGradient={formData.bgGradient}
                        />
                      </div>
                    </div>
                  )}

                  <hr className="my-4" />
                  
                  <h6>Imagens Estáticas (só se não usar card dinâmico)</h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Image URL (Card)</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.imageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="/coursecard-nome.png"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Banner Site</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.bannerSite || ''}
                          onChange={(e) => setFormData({ ...formData, bannerSite: e.target.value })}
                          placeholder="/banners/banner-site-nome.png"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Banner Mobile</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.bannerMobile || ''}
                          onChange={(e) => setFormData({ ...formData, bannerMobile: e.target.value })}
                          placeholder="/banners/banner-mobile-nome.png"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Vídeo</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.video || ''}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      placeholder="video.mp4"
                    />
                  </Form.Group>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <X className="me-2" />
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={editMode ? submitUpdate : handleCreate}
            disabled={!formData.title || !formData.description || !formData.professor}
          >
            <Save className="me-2" />
            {editMode ? 'Salvar Alterações' : 'Criar Curso'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal 2FA */}
      <Modal show={show2FAModal} onHide={() => setShow2FAModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔐 Verificação 2FA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            Um código de 6 dígitos foi enviado para <strong>{adminEmail}</strong>.
            O código expira em 5 minutos.
          </Alert>
          <Form.Group>
            <Form.Label>Digite o código recebido por email:</Form.Label>
            <Form.Control
              type="text"
              value={code2FA}
              onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center fs-4 tracking-widest"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow2FAModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={execute2FAAction}
            disabled={code2FA.length !== 6 || loading}
          >
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GalaxyCourseManager
