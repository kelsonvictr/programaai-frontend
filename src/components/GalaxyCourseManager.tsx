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
import { PlusCircle, Pencil, Eye, EyeSlash, Save, X, Trash, CalendarPlus } from 'react-bootstrap-icons'
import DynamicCourseCard from './DynamicCourseCard'
import { TECH_ICONS, BG_GRADIENTS } from '../config/courseVisuals'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const CURSOS_ENDPOINT = `${API_BASE}/galaxy/cursos`

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
}

const GalaxyCourseManager: React.FC<GalaxyCourseManagerProps> = ({ token }) => {
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
    id: '',
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
  
  // Preview do card
  const [showPreview, setShowPreview] = useState(false)
  
  // Campos temporários para adicionar itens em arrays
  const [tempData, setTempData] = useState('')
  const [tempModulo, setTempModulo] = useState('')
  const [tempPreRequisito, setTempPreRequisito] = useState('')
  const [tempPublicoAlvo, setTempPublicoAlvo] = useState('')
  const [tempAprendizado, setTempAprendizado] = useState('')
  const [tempFaqPergunta, setTempFaqPergunta] = useState('')
  const [tempFaqResposta, setTempFaqResposta] = useState('')

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

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    setShowModal(false)

    try {
      await axios.post(
        CURSOS_ENDPOINT,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('✅ Curso criado com sucesso!')
      await loadCursos()
      resetForm()
    } catch (err: any) {
      console.error('Erro ao criar curso:', err)
      setError(err.response?.data?.error || 'Erro ao criar curso')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = (curso: Curso) => {
    setSelectedCurso(curso)
    setFormData(curso)
    setEditMode(true)
    setShowModal(true)
  }

  const submitUpdate = async () => {
    if (!selectedCurso) return

    setLoading(true)
    setError(null)
    setShowModal(false)

    try {
      await axios.put(
        `${CURSOS_ENDPOINT}/${selectedCurso.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('✅ Curso atualizado com sucesso!')
      await loadCursos()
      resetForm()
    } catch (err: any) {
      console.error('Erro ao atualizar curso:', err)
      setError(err.response?.data?.error || 'Erro ao atualizar curso')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (curso: Curso) => {
    if (!confirm(`Tem certeza que deseja desativar o curso "${curso.title}"?`)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await axios.delete(
        `${CURSOS_ENDPOINT}/${curso.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('✅ Curso desativado com sucesso!')
      await loadCursos()
    } catch (err: any) {
      console.error('Erro ao desativar curso:', err)
      setError(err.response?.data?.error || 'Erro ao desativar curso')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
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
    // Limpar campos temporários
    setTempData('')
    setTempModulo('')
    setTempPreRequisito('')
    setTempPublicoAlvo('')
    setTempAprendizado('')
    setTempFaqPergunta('')
    setTempFaqResposta('')
  }

  // Funções para gerenciar arrays
  const addData = () => {
    if (!tempData.trim()) return
    setFormData({ ...formData, datas: [...(formData.datas || []), tempData.trim()] })
    setTempData('')
  }

  const removeData = (index: number) => {
    setFormData({ ...formData, datas: formData.datas?.filter((_, i) => i !== index) })
  }

  const addModulo = () => {
    if (!tempModulo.trim()) return
    setFormData({ ...formData, modulos: [...(formData.modulos || []), tempModulo.trim()] })
    setTempModulo('')
  }

  const removeModulo = (index: number) => {
    setFormData({ ...formData, modulos: formData.modulos?.filter((_, i) => i !== index) })
  }

  const addPreRequisito = () => {
    if (!tempPreRequisito.trim()) return
    setFormData({ ...formData, prerequisitos: [...(formData.prerequisitos || []), tempPreRequisito.trim()] })
    setTempPreRequisito('')
  }

  const removePreRequisito = (index: number) => {
    setFormData({ ...formData, prerequisitos: formData.prerequisitos?.filter((_, i) => i !== index) })
  }

  const addPublicoAlvo = () => {
    if (!tempPublicoAlvo.trim()) return
    setFormData({ ...formData, publicoAlvo: [...(formData.publicoAlvo || []), tempPublicoAlvo.trim()] })
    setTempPublicoAlvo('')
  }

  const removePublicoAlvo = (index: number) => {
    setFormData({ ...formData, publicoAlvo: formData.publicoAlvo?.filter((_, i) => i !== index) })
  }

  const addAprendizado = () => {
    if (!tempAprendizado.trim()) return
    setFormData({ ...formData, oQueVaiAprender: [...(formData.oQueVaiAprender || []), tempAprendizado.trim()] })
    setTempAprendizado('')
  }

  const removeAprendizado = (index: number) => {
    setFormData({ ...formData, oQueVaiAprender: formData.oQueVaiAprender?.filter((_, i) => i !== index) })
  }

  const addFaq = () => {
    if (!tempFaqPergunta.trim() || !tempFaqResposta.trim()) return
    setFormData({
      ...formData,
      faq: [...(formData.faq || []), { pergunta: tempFaqPergunta.trim(), resposta: tempFaqResposta.trim() }]
    })
    setTempFaqPergunta('')
    setTempFaqResposta('')
  }

  const removeFaq = (index: number) => {
    setFormData({ ...formData, faq: formData.faq?.filter((_, i) => i !== index) })
  }

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
                  {/* Campo ID - só editável em criação */}
                  {!editMode && (
                    <Alert variant="warning" className="mb-3">
                      <small>
                        <strong>⚠️ ID do Curso:</strong> Defina um ID único para a URL (ex: "prog-do-zero-turma-02").
                        Use apenas letras minúsculas, números e hífens. <strong>Não poderá ser alterado depois!</strong>
                      </small>
                    </Alert>
                  )}
                  
                  <Row>
                    <Col md={editMode ? 12 : 4}>
                      {!editMode && (
                        <Form.Group className="mb-3">
                          <Form.Label>ID do Curso (para URL) *</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.id || ''}
                            onChange={(e) => {
                              // Sanitizar: apenas letras minúsculas, números e hífens
                              const sanitized = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, '')
                              setFormData({ ...formData, id: sanitized })
                            }}
                            placeholder="prog-do-zero-turma-02"
                            required
                            pattern="[a-z0-9-]+"
                          />
                          <Form.Text className="text-muted">
                            URL: /curso/{formData.id || 'id-do-curso'}
                          </Form.Text>
                        </Form.Group>
                      )}
                      {editMode && (
                        <Alert variant="info" className="mb-3">
                          <small><strong>ID:</strong> {formData.id} (não pode ser alterado)</small>
                        </Alert>
                      )}
                    </Col>
                    <Col md={editMode ? 8 : 5}>
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
                    <Col md={editMode ? 4 : 3}>
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

              {/* Datas do Curso */}
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  📅 Datas do Curso {formData.datas && formData.datas.length > 0 && <Badge bg="success" className="ms-2">{formData.datas.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Data</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={tempData}
                        onChange={(e) => setTempData(e.target.value)}
                        placeholder="28/01/2026 (quarta-feira)"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addData())}
                      />
                      <Button variant="primary" onClick={addData}>
                        <CalendarPlus />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.datas && formData.datas.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">Datas Cadastradas:</h6>
                      {formData.datas.map((data, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-secondary rounded">
                          <span className="text-white">{data}</span>
                          <Button variant="danger" size="sm" onClick={() => removeData(index)}>
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* Módulos do Curso */}
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  📚 Módulos do Curso {formData.modulos && formData.modulos.length > 0 && <Badge bg="success" className="ms-2">{formData.modulos.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Módulo</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={tempModulo}
                        onChange={(e) => setTempModulo(e.target.value)}
                        placeholder="Introdução à Programação e Estrutura Sequencial"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModulo())}
                      />
                      <Button variant="primary" onClick={addModulo}>
                        <PlusCircle />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.modulos && formData.modulos.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">Módulos Cadastrados:</h6>
                      {formData.modulos.map((modulo, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-secondary rounded">
                          <span className="text-white">{index + 1}. {modulo}</span>
                          <Button variant="danger" size="sm" onClick={() => removeModulo(index)}>
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* Pré-requisitos */}
              <Accordion.Item eventKey="4">
                <Accordion.Header>
                  ✅ Pré-requisitos {formData.prerequisitos && formData.prerequisitos.length > 0 && <Badge bg="success" className="ms-2">{formData.prerequisitos.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Pré-requisito</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={tempPreRequisito}
                        onChange={(e) => setTempPreRequisito(e.target.value)}
                        placeholder="Não é necessário conhecimento prévio em programação"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreRequisito())}
                      />
                      <Button variant="primary" onClick={addPreRequisito}>
                        <PlusCircle />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.prerequisitos && formData.prerequisitos.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">Pré-requisitos Cadastrados:</h6>
                      {formData.prerequisitos.map((pre, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-secondary rounded">
                          <span className="text-white">• {pre}</span>
                          <Button variant="danger" size="sm" onClick={() => removePreRequisito(index)}>
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* Público-alvo */}
              <Accordion.Item eventKey="5">
                <Accordion.Header>
                  👥 Público-alvo {formData.publicoAlvo && formData.publicoAlvo.length > 0 && <Badge bg="success" className="ms-2">{formData.publicoAlvo.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Público-alvo</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={tempPublicoAlvo}
                        onChange={(e) => setTempPublicoAlvo(e.target.value)}
                        placeholder="Iniciantes absolutos em programação"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPublicoAlvo())}
                      />
                      <Button variant="primary" onClick={addPublicoAlvo}>
                        <PlusCircle />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.publicoAlvo && formData.publicoAlvo.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">Público-alvo Cadastrado:</h6>
                      {formData.publicoAlvo.map((pub, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-secondary rounded">
                          <span className="text-white">• {pub}</span>
                          <Button variant="danger" size="sm" onClick={() => removePublicoAlvo(index)}>
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* O que vai aprender */}
              <Accordion.Item eventKey="6">
                <Accordion.Header>
                  🎯 O que vai aprender {formData.oQueVaiAprender && formData.oQueVaiAprender.length > 0 && <Badge bg="success" className="ms-2">{formData.oQueVaiAprender.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Aprendizado</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="text"
                        value={tempAprendizado}
                        onChange={(e) => setTempAprendizado(e.target.value)}
                        placeholder="Entender os fundamentos de programação e lógica"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAprendizado())}
                      />
                      <Button variant="primary" onClick={addAprendizado}>
                        <PlusCircle />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.oQueVaiAprender && formData.oQueVaiAprender.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">Aprendizados Cadastrados:</h6>
                      {formData.oQueVaiAprender.map((apr, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-secondary rounded">
                          <span className="text-white">✓ {apr}</span>
                          <Button variant="danger" size="sm" onClick={() => removeAprendizado(index)}>
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* FAQ */}
              <Accordion.Item eventKey="7">
                <Accordion.Header>
                  ❓ FAQ - Perguntas Frequentes {formData.faq && formData.faq.length > 0 && <Badge bg="success" className="ms-2">{formData.faq.length}</Badge>}
                </Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-2">
                    <Form.Label>Pergunta</Form.Label>
                    <Form.Control
                      type="text"
                      value={tempFaqPergunta}
                      onChange={(e) => setTempFaqPergunta(e.target.value)}
                      placeholder="Preciso levar notebook?"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Resposta</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={tempFaqResposta}
                        onChange={(e) => setTempFaqResposta(e.target.value)}
                        placeholder="Sim, é necessário levar notebook com PyCharm instalado."
                      />
                      <Button variant="primary" onClick={addFaq} style={{height: '70px'}}>
                        <PlusCircle />
                      </Button>
                    </div>
                  </Form.Group>

                  {formData.faq && formData.faq.length > 0 && (
                    <div className="border rounded p-3 bg-dark">
                      <h6 className="text-white mb-3">FAQs Cadastrados:</h6>
                      {formData.faq.map((item, index) => (
                        <div key={index} className="mb-3 p-3 bg-secondary rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong className="text-warning">P: {item.pergunta}</strong>
                            <Button variant="danger" size="sm" onClick={() => removeFaq(index)}>
                              <Trash />
                            </Button>
                          </div>
                          <p className="text-white mb-0">R: {item.resposta}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
            disabled={!formData.id || !formData.title || !formData.description || !formData.professor}
          >
            <Save className="me-2" />
            {editMode ? 'Salvar Alterações' : 'Criar Curso'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GalaxyCourseManager
