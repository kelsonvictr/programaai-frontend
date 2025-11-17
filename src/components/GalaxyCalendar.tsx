import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'

type CalendarioCurso = {
  id: string
  nome: string
  cor: string
}

type CalendarioEvento = {
  id: string
  cursoId: string
  data: string // YYYY-MM-DD
}

type CalendarioApiResp = {
  cursos: CalendarioCurso[]
  eventos: CalendarioEvento[]
}

type GalaxyCalendarProps = {
  apiBase: string
  token: string
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric'
})

const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const buildDateKey = (year: number, month: number, day: number) => {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export default function GalaxyCalendar(props: GalaxyCalendarProps) {
  const { apiBase, token } = props

  const [cursos, setCursos] = useState<CalendarioCurso[]>([])
  const [eventos, setEventos] = useState<CalendarioEvento[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null)
  const [cursoNome, setCursoNome] = useState('')
  const [cursoCor, setCursoCor] = useState('#0d6efd')

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const CALENDARIO_ENDPOINT = `${apiBase}/galaxy/calendario`
  const CALENDARIO_CURSO_ENDPOINT = `${apiBase}/galaxy/calendario/curso`
  const CALENDARIO_EVENTO_TOGGLE_ENDPOINT = `${apiBase}/galaxy/calendario/evento/toggle`

  const cursosById = useMemo(() => {
    const map: Record<string, CalendarioCurso> = {}
    for (const c of cursos) {
      map[c.id] = c
    }
    return map
  }, [cursos])

  const eventosPorData = useMemo(() => {
    const map: Record<string, CalendarioEvento[]> = {}
    for (const ev of eventos) {
      if (!ev.data) continue
      if (!map[ev.data]) map[ev.data] = []
      map[ev.data].push(ev)
    }
    return map
  }, [eventos])

  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay() // 0 = domingo ... 6 = sábado
    const offset = (firstWeekday + 6) % 7 // 0 = segunda
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<number | null> = []
    for (let i = 0; i < offset; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(day)

    const weeks: Array<Array<number | null>> = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    return weeks
  }, [currentMonth])

  const fetchCalendario = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<CalendarioApiResp>(CALENDARIO_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCursos(data.cursos || [])
      setEventos(data.eventos || [])
      if (!selectedCursoId && data.cursos?.length) {
        setSelectedCursoId(data.cursos[0].id)
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar calendário')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    void fetchCalendario()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleAddCurso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const nome = cursoNome.trim()
    if (!nome) return

    setSaving(true)
    setError(null)
    try {
      const { data } = await axios.post(
        CALENDARIO_CURSO_ENDPOINT,
        { nome, cor: cursoCor },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const novoCurso: CalendarioCurso | undefined = data?.curso
      if (novoCurso) {
        setCursos(prev => [...prev, novoCurso])
        setSelectedCursoId(novoCurso.id)
        setCursoNome('')
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar curso')
    } finally {
      setSaving(false)
    }
  }

  const handleDiaClick = (day: number | null) => {
    if (!day) return
    if (!token) return
    if (!selectedCursoId) {
      setError('Selecione um curso para marcar as datas')
      return
    }
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateKey = buildDateKey(year, month, day)

    void toggleEvento(selectedCursoId, dateKey)
  }

  const toggleEvento = async (cursoId: string, dateKey: string) => {
    setSaving(true)
    setError(null)
    try {
      const { data } = await axios.post(
        CALENDARIO_EVENTO_TOGGLE_ENDPOINT,
        { cursoId, data: dateKey },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const mode = data?.mode
      if (mode === 'removed') {
        setEventos(prev =>
          prev.filter(ev => !(ev.cursoId === cursoId && ev.data === dateKey))
        )
      } else if (mode === 'added' && data?.evento) {
        const novo: CalendarioEvento = data.evento
        setEventos(prev => [...prev, novo])
      } else {
        // fallback otimista
        setEventos(prev => {
          const exists = prev.some(ev => ev.cursoId === cursoId && ev.data === dateKey)
          if (exists) {
            return prev.filter(ev => !(ev.cursoId === cursoId && ev.data === dateKey))
          }
          const novo: CalendarioEvento = {
            id: `${cursoId}#${dateKey}`,
            cursoId,
            data: dateKey
          }
          return [...prev, novo]
        })
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao atualizar datas do curso')
    } finally {
      setSaving(false)
    }
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const headerLabel = monthFormatter.format(currentMonth)

  return (
    <Row className="g-3">
      <Col xs={12} md={8}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span role="img" aria-label="Calendário">
                📅
              </span>
              <strong className="text-capitalize">{headerLabel}</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
              >
                ‹
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
              >
                ›
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="mb-2 text-muted small">
              Clique em um dia para marcar ou remover aulas do curso selecionado ao lado.
            </div>
            <div className="border rounded overflow-hidden">
              <div className="d-none d-md-flex bg-light border-bottom">
                {weekdayLabels.map(label => (
                  <div
                    key={label}
                    className="flex-grow-1 text-center py-2 fw-semibold small text-uppercase"
                    style={{ width: `${100 / 7}%` }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="d-md-none bg-light border-bottom d-flex">
                {weekdayLabels.map(label => (
                  <div
                    key={label}
                    className="flex-grow-1 text-center py-1 fw-semibold small text-uppercase"
                    style={{ width: `${100 / 7}%` }}
                  >
                    {label[0]}
                  </div>
                ))}
              </div>

              <div>
                {calendarMatrix.map((week, wIndex) => (
                  <div key={wIndex} className="d-flex border-bottom last:border-bottom-0">
                    {week.map((day, dIndex) => {
                      const key = `${wIndex}-${dIndex}-${day ?? 'empty'}`
                      if (!day) {
                        return (
                          <div
                            key={key}
                            className="flex-grow-1 border-end last:border-end-0 bg-white"
                            style={{ minHeight: 96, width: `${100 / 7}%` }}
                          />
                        )
                      }

                      const dateKey = buildDateKey(year, month, day)
                      const listaEventos = eventosPorData[dateKey] || []
                      const hasEventos = listaEventos.length > 0
                      const hasSelectedCurso =
                        selectedCursoId &&
                        listaEventos.some(ev => ev.cursoId === selectedCursoId)

                      const cellBg = hasSelectedCurso
                        ? 'rgba(13, 110, 253, 0.06)'
                        : hasEventos
                          ? 'rgba(13, 110, 253, 0.03)'
                          : '#ffffff'

                      return (
                        <button
                          key={key}
                          type="button"
                          className="flex-grow-1 border-end last:border-end-0 text-start p-2 position-relative"
                          style={{
                            minHeight: 96,
                            width: `${100 / 7}%`,
                            backgroundColor: cellBg,
                            cursor: selectedCursoId ? 'pointer' : 'default'
                          }}
                          onClick={() => handleDiaClick(day)}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="fw-semibold small">{day}</span>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            {listaEventos.slice(0, 3).map(ev => {
                              const curso = cursosById[ev.cursoId]
                              const cor = curso?.cor || '#0d6efd'
                              return (
                                <Badge
                                  key={ev.id}
                                  pill
                                  bg="light"
                                  text="dark"
                                  style={{
                                    backgroundColor: cor,
                                    borderColor: 'transparent',
                                    color: '#fff',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {curso?.nome || 'Curso'}
                                </Badge>
                              )
                            })}
                            {listaEventos.length > 3 && (
                              <span className="small text-muted">
                                +{listaEventos.length - 3}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <Card.Title className="mb-3">Cursos e Legendas</Card.Title>
            <div className="mb-3">
              <Form onSubmit={handleAddCurso}>
                <Form.Group className="mb-2">
                  <Form.Label>Nome do curso</Form.Label>
                  <Form.Control
                    type="text"
                    value={cursoNome}
                    onChange={e => setCursoNome(e.target.value)}
                    placeholder="Ex.: Programa.ai Turma 1"
                  />
                </Form.Group>
                <Form.Group className="mb-3 d-flex align-items-center gap-2">
                  <Form.Label className="mb-0">Cor</Form.Label>
                  <Form.Control
                    type="color"
                    value={cursoCor}
                    onChange={e => setCursoCor(e.target.value)}
                    style={{ width: 56, padding: 2 }}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" size="sm" disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" /> : 'Adicionar curso'}
                  </Button>
                </div>
              </Form>
            </div>

            <hr />

            {error && (
              <div className="mb-3">
                <span className="text-danger small">{error}</span>
              </div>
            )}

            <div className="mb-2 text-muted small">
              Clique em um curso para deixá-lo ativo e marque as datas no calendário.
            </div>

            <div className="d-flex flex-column gap-2">
              {cursos.map(curso => {
                const isActive = selectedCursoId === curso.id
                const countEventos = eventos.filter(ev => ev.cursoId === curso.id).length
                return (
                  <button
                    key={curso.id}
                    type="button"
                    className="d-flex align-items-center justify-content-between border rounded py-2 px-3 text-start bg-white"
                    style={{
                      boxShadow: isActive
                        ? '0 6px 18px rgba(13, 110, 253, 0.2)'
                        : '0 2px 8px rgba(15, 23, 42, 0.08)',
                      borderColor: isActive ? '#0d6efd' : '#e5e7eb'
                    }}
                    onClick={() => setSelectedCursoId(curso.id)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '999px',
                          backgroundColor: curso.cor,
                          border: '1px solid rgba(15, 23, 42, 0.12)'
                        }}
                      />
                      <div>
                        <div className="fw-semibold small">{curso.nome}</div>
                        <div className="text-muted small">
                          {countEventos === 0
                            ? 'Nenhuma data marcada'
                            : `${countEventos} dia${countEventos > 1 ? 's' : ''} marcado${
                                countEventos > 1 ? 's' : ''
                              }`}
                        </div>
                      </div>
                    </div>
                    {isActive && <Badge bg="primary">Ativo</Badge>}
                  </button>
                )
              })}

              {!cursos.length && !loading && (
                <div className="text-muted small">
                  Nenhum curso cadastrado ainda. Crie um curso acima e comece a planejar o calendário
                  de aulas.
                </div>
              )}

              {loading && (
                <div className="d-flex justify-content-center py-3">
                  <Spinner animation="border" />
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

