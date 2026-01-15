import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  OverlayTrigger,
  Popover,
  Row,
  Spinner
} from 'react-bootstrap'

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

const parseDateKey = (value: string) => {
  const [yy, mm, dd] = value.split('-').map(Number)
  return new Date(yy, (mm || 1) - 1, dd || 1)
}

const formatDateLabel = (value: string) => {
  const [yy, mm, dd] = value.split('-')
  if (!yy || !mm || !dd) return value
  return `${dd}/${mm}/${yy}`
}

const formatDateShort = (value: string) => {
  const dt = parseDateKey(value)
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(dt)
  return `${weekday} • ${formatDateLabel(value)}`
}

const hexToRgba = (hex: string, alpha: number) => {
  const clean = (hex || '').replace('#', '')
  if (clean.length !== 6) return `rgba(13, 110, 253, ${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type Holiday = {
  date: string
  name: string
}

// cálculo da Páscoa (calendário gregoriano, rito ocidental)
const getEasterDate = (year: number): { monthIndex: number; day: number } => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3=março, 4=abril
  const day = ((h + l - 7 * m + 114) % 31) + 1
  // monthIndex baseado em 0
  return { monthIndex: month - 1, day }
}

const getFixedBrazilHolidays = (year: number): Holiday[] => [
  { date: buildDateKey(year, 0, 1), name: 'Confraternização Universal' },
  { date: buildDateKey(year, 3, 21), name: 'Tiradentes' },
  { date: buildDateKey(year, 4, 1), name: 'Dia do Trabalhador' },
  { date: buildDateKey(year, 8, 7), name: 'Independência do Brasil' },
  { date: buildDateKey(year, 9, 12), name: 'Nossa Senhora Aparecida' },
  { date: buildDateKey(year, 10, 2), name: 'Finados' },
  { date: buildDateKey(year, 10, 15), name: 'Proclamação da República' },
  { date: buildDateKey(year, 10, 20), name: 'Dia da Consciência Negra' },
  { date: buildDateKey(year, 11, 25), name: 'Natal' }
]

const getJoaoPessoaHolidays = (year: number): Holiday[] => [
  {
    date: buildDateKey(year, 7, 5),
    name: 'Aniversário de João Pessoa / Nossa Senhora das Neves'
  },
  {
    date: buildDateKey(year, 5, 24),
    name: 'São João (João Pessoa)'
  }
]

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
  const [manualDate, setManualDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [showFinalizados, setShowFinalizados] = useState(true)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [activeExpanded, setActiveExpanded] = useState(true)
  const [finalizedExpanded, setFinalizedExpanded] = useState(false)

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const CALENDARIO_ENDPOINT = `${apiBase}/galaxy/calendario`
  const CALENDARIO_CURSO_ENDPOINT = `${apiBase}/galaxy/calendario/curso`
  const CALENDARIO_EVENTO_TOGGLE_ENDPOINT = `${apiBase}/galaxy/calendario/evento/toggle`
  const CALENDARIO_CURSO_DELETE_ENDPOINT = `${apiBase}/galaxy/calendario/curso/delete`

  const todayKey = useMemo(() => {
    const now = new Date()
    return buildDateKey(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const cursosById = useMemo(() => {
    const map: Record<string, CalendarioCurso> = {}
    for (const c of cursos) {
      map[c.id] = c
    }
    return map
  }, [cursos])

  const eventosByCursoId = useMemo(() => {
    const map: Record<string, CalendarioEvento[]> = {}
    for (const ev of eventos) {
      if (!map[ev.cursoId]) map[ev.cursoId] = []
      map[ev.cursoId].push(ev)
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0))
    }
    return map
  }, [eventos])

  const cursoStats = useMemo(() => {
    return cursos.map(curso => {
      const list = eventosByCursoId[curso.id] || []
      const future = list.filter(ev => ev.data >= todayKey)
      const nextDate = future.length ? future[0].data : null
      return {
        ...curso,
        totalEventos: list.length,
        nextDate,
        isFinalizado: !nextDate
      }
    })
  }, [cursos, eventosByCursoId, todayKey])

  const finalizadoByCursoId = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of cursoStats) {
      map[c.id] = c.isFinalizado
    }
    return map
  }, [cursoStats])

  const activeCursos = useMemo(
    () => cursoStats.filter(c => !c.isFinalizado).sort((a, b) => {
      if (!a.nextDate) return 1
      if (!b.nextDate) return -1
      return a.nextDate < b.nextDate ? -1 : a.nextDate > b.nextDate ? 1 : 0
    }),
    [cursoStats]
  )

  const finalCursos = useMemo(
    () => cursoStats.filter(c => c.isFinalizado).sort((a, b) => a.nome.localeCompare(b.nome)),
    [cursoStats]
  )

  const filteredActiveCursos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return activeCursos
    return activeCursos.filter(c => c.nome.toLowerCase().includes(term))
  }, [activeCursos, searchTerm])

  const filteredFinalCursos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return finalCursos
    return finalCursos.filter(c => c.nome.toLowerCase().includes(term))
  }, [finalCursos, searchTerm])

  const displayEventos = useMemo(() => {
    let list = [...eventos]
    if (showOnlySelected && selectedCursoId) {
      list = list.filter(ev => ev.cursoId === selectedCursoId)
    }
    if (!showFinalizados) {
      list = list.filter(ev => !finalizadoByCursoId[ev.cursoId])
    }
    return list
  }, [eventos, showOnlySelected, selectedCursoId, showFinalizados, finalizadoByCursoId])

  const eventosPorData = useMemo(() => {
    const map: Record<string, CalendarioEvento[]> = {}
    for (const ev of displayEventos) {
      if (!ev.data) continue
      if (!map[ev.data]) map[ev.data] = []
      map[ev.data].push(ev)
    }
    return map
  }, [displayEventos])

  const holidaysByDate = useMemo(() => {
    const year = currentMonth.getFullYear()
    const easter = getEasterDate(year)
    const easterDate = new Date(year, easter.monthIndex, easter.day)
    const carnivalTuesday = new Date(easterDate)
    carnivalTuesday.setDate(carnivalTuesday.getDate() - 47)
    const carnivalMonday = new Date(easterDate)
    carnivalMonday.setDate(carnivalMonday.getDate() - 48)

    const list: Holiday[] = [
      ...getFixedBrazilHolidays(year),
      { date: buildDateKey(year, easter.monthIndex, easter.day), name: 'Páscoa' },
      {
        date: buildDateKey(
          carnivalMonday.getFullYear(),
          carnivalMonday.getMonth(),
          carnivalMonday.getDate()
        ),
        name: 'Carnaval (segunda-feira)'
      },
      {
        date: buildDateKey(
          carnivalTuesday.getFullYear(),
          carnivalTuesday.getMonth(),
          carnivalTuesday.getDate()
        ),
        name: 'Carnaval'
      },
      ...getJoaoPessoaHolidays(year)
    ]
    const map: Record<string, string> = {}
    for (const h of list) {
      map[h.date] = h.name
    }
    return map
  }, [currentMonth])

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

    // completa a última linha para sempre ter 7 colunas
    while (cells.length % 7 !== 0) cells.push(null)

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

  const handleRemoverCurso = async (curso: CalendarioCurso) => {
    if (!token) return
    const confirmado = window.confirm(
      `Remover o curso "${curso.nome}" e todas as datas associadas?`
    )
    if (!confirmado) return

    setSaving(true)
    setError(null)
    try {
      await axios.post(
        CALENDARIO_CURSO_DELETE_ENDPOINT,
        { id: curso.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setCursos(prev => prev.filter(c => c.id !== curso.id))
      setEventos(prev => prev.filter(ev => ev.cursoId !== curso.id))

      setManualDate('')
      setSelectedCursoId(prev => {
        if (prev === curso.id) {
          const remaining = cursos.filter(c => c.id !== curso.id)
          return remaining.length ? remaining[0].id : null
        }
        return prev
      })
    } catch (err) {
      console.error(err)
      setError('Erro ao remover curso')
    } finally {
      setSaving(false)
    }
  }

  const goToDate = (dateKey: string, cursoId?: string) => {
    const dt = parseDateKey(dateKey)
    setCurrentMonth(new Date(dt.getFullYear(), dt.getMonth(), 1))
    setSelectedDateKey(dateKey)
    if (cursoId) setSelectedCursoId(cursoId)
  }

  const handleDiaClick = (day: number | null) => {
    if (!day) return
    if (!token) return
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateKey = buildDateKey(year, month, day)
    setSelectedDateKey(dateKey)

    if (!selectedCursoId) {
      setError('Selecione um curso para marcar as datas')
      return
    }
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

  const selectedCurso = selectedCursoId ? cursosById[selectedCursoId] : null
  const eventosCursoSelecionado = useMemo(() => {
    if (!selectedCursoId) return []
    const list = eventos.filter(ev => ev.cursoId === selectedCursoId)
    return [...list].sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0))
  }, [eventos, selectedCursoId])

  const upcomingAulas = useMemo(() => {
    const future = eventos.filter(ev => ev.data >= todayKey)
    future.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0))
    return future.slice(0, 12)
  }, [eventos, todayKey])

  const selectedDayEventos = useMemo(() => {
    if (!selectedDateKey) return []
    return (eventosPorData[selectedDateKey] || []).sort((a, b) => {
      const ca = (cursosById[a.cursoId]?.nome || '').toLowerCase()
      const cb = (cursosById[b.cursoId]?.nome || '').toLowerCase()
      return ca < cb ? -1 : ca > cb ? 1 : 0
    })
  }, [eventosPorData, selectedDateKey, cursosById])

  const selectedDayHasSelectedCurso = useMemo(() => {
    if (!selectedDateKey || !selectedCursoId) return false
    return selectedDayEventos.some(ev => ev.cursoId === selectedCursoId)
  }, [selectedDateKey, selectedCursoId, selectedDayEventos])

  const renderCursoChip = (curso: CalendarioCurso, compact = false) => {
    const baseColor = curso.cor || '#0d6efd'
    return (
      <span
        title={curso.nome}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '2px 6px' : '4px 8px',
          borderRadius: 999,
          fontSize: compact ? '0.68rem' : '0.75rem',
          fontWeight: 600,
          color: baseColor,
          backgroundColor: hexToRgba(baseColor, 0.12),
          border: `1px solid ${hexToRgba(baseColor, 0.5)}`,
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {curso.nome}
      </span>
    )
  }

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
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div className="text-muted small">
                Clique em um dia para marcar ou remover aulas do curso selecionado ao lado.
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={!upcomingAulas.length}
                  onClick={() => {
                    const next = upcomingAulas[0]
                    if (next) goToDate(next.data, next.cursoId)
                  }}
                >
                  Próxima aula
                </Button>
                <Form.Check
                  type="switch"
                  id="calendar-show-selected"
                  label={showOnlySelected ? 'Somente curso selecionado' : 'Mostrar todos'}
                  checked={showOnlySelected}
                  onChange={e => setShowOnlySelected(e.target.checked)}
                />
                <Form.Check
                  type="switch"
                  id="calendar-show-finalizados"
                  label="Mostrar finalizados"
                  checked={showFinalizados}
                  onChange={e => setShowFinalizados(e.target.checked)}
                />
              </div>
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
                      const holidayName = holidaysByDate[dateKey]
                      const hasSelectedCurso =
                        selectedCursoId &&
                        listaEventos.some(ev => ev.cursoId === selectedCursoId)

                      const cellBg = holidayName
                        ? 'rgba(220, 53, 69, 0.06)'
                        : hasSelectedCurso
                          ? 'rgba(13, 110, 253, 0.06)'
                          : hasEventos
                            ? 'rgba(13, 110, 253, 0.03)'
                            : '#ffffff'

                      const isToday = dateKey === todayKey
                      const isSelected = selectedDateKey === dateKey
                      const cursosDia = listaEventos
                        .map(ev => cursosById[ev.cursoId])
                        .filter(Boolean) as CalendarioCurso[]
                      const chips = cursosDia.slice(0, 2)
                      const remaining = cursosDia.length - chips.length

                      return (
                        <button
                          key={key}
                          type="button"
                          className="flex-grow-1 border-end last:border-end-0 text-start p-2 position-relative"
                          style={{
                            minHeight: 96,
                            width: `${100 / 7}%`,
                            backgroundColor: cellBg,
                            cursor: selectedCursoId ? 'pointer' : 'default',
                            boxShadow: isSelected
                              ? 'inset 0 0 0 2px rgba(13, 110, 253, 0.6)'
                              : isToday
                                ? 'inset 0 0 0 2px rgba(25, 135, 84, 0.35)'
                                : 'none'
                          }}
                          onClick={() => handleDiaClick(day)}
                          aria-pressed={isSelected}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="fw-semibold small">{day}</span>
                            {isToday && (
                              <span className="small fw-semibold text-success">Hoje</span>
                            )}
                          </div>
                          {holidayName && (
                            <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                              {holidayName}
                            </div>
                          )}
                          <div className="d-flex flex-column gap-1">
                            {chips.map(curso => (
                              <div key={`${dateKey}-${curso.id}`}>{renderCursoChip(curso, true)}</div>
                            ))}
                            {remaining > 0 && (
                              <OverlayTrigger
                                trigger={['hover', 'click', 'focus']}
                                placement="auto"
                                overlay={
                                  <Popover id={`popover-${dateKey}`}>
                                    <Popover.Header as="h3">Aulas do dia</Popover.Header>
                                    <Popover.Body>
                                      <div className="d-flex flex-column gap-1">
                                        {cursosDia.map(curso => (
                                          <div key={`${dateKey}-${curso.id}`}>
                                            {renderCursoChip(curso, true)}
                                          </div>
                                        ))}
                                      </div>
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <span
                                  onClick={e => e.stopPropagation()}
                                  className="small text-primary fw-semibold"
                                  style={{ cursor: 'pointer' }}
                                >
                                  +{remaining} cursos
                                </span>
                              </OverlayTrigger>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 d-flex flex-column gap-3">
              {selectedDateKey && (
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fs-6 mb-2">
                      Aulas do dia {formatDateLabel(selectedDateKey)}
                    </Card.Title>
                    {selectedDayEventos.length === 0 && (
                      <div className="text-muted small">
                        Nenhuma aula marcada neste dia.
                      </div>
                    )}
                    {selectedDayEventos.length > 0 && (
                      <div className="d-flex flex-column gap-2">
                        {selectedDayEventos.map(ev => {
                          const curso = cursosById[ev.cursoId]
                          if (!curso) return null
                          return (
                            <div
                              key={ev.id}
                              className="d-flex align-items-center justify-content-between gap-2"
                            >
                              {renderCursoChip(curso)}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => toggleEvento(ev.cursoId, ev.data)}
                              >
                                Remover
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {selectedCurso && (
                      <div className="mt-3 d-flex align-items-center justify-content-between gap-2">
                        <div className="text-muted small">
                          Alternar aula de <strong>{selectedCurso.nome}</strong>
                        </div>
                        <Button
                          variant={selectedDayHasSelectedCurso ? 'outline-danger' : 'outline-primary'}
                          size="sm"
                          onClick={() => toggleEvento(selectedCurso.id, selectedDateKey)}
                        >
                          {selectedDayHasSelectedCurso ? 'Desmarcar' : 'Marcar'}
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}

              {selectedCurso && (
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fs-6 mb-2">
                      Datas do curso selecionado
                    </Card.Title>
                    {eventosCursoSelecionado.length === 0 && (
                      <div className="text-muted small">
                        Nenhuma data marcada ainda para <strong>{selectedCurso.nome}</strong>.
                      </div>
                    )}
                    {eventosCursoSelecionado.length > 0 && (
                      <ul className="list-unstyled mb-0 small">
                        {eventosCursoSelecionado.map(ev => {
                          const dateLabel = formatDateLabel(ev.data)
                          return (
                            <li
                              key={ev.id}
                              className="d-flex align-items-center justify-content-between py-1 border-bottom"
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '999px',
                                    backgroundColor: selectedCurso.cor,
                                    border: '1px solid rgba(15, 23, 42, 0.3)'
                                  }}
                                />
                                <span>{dateLabel}</span>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => toggleEvento(selectedCurso.id, ev.data)}
                              >
                                ×
                              </Button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </Card.Body>
                </Card>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <Card.Title className="mb-3">Próximas aulas</Card.Title>
            {upcomingAulas.length === 0 && (
              <div className="text-muted small mb-3">
                Nenhuma aula futura cadastrada.
              </div>
            )}
            {upcomingAulas.length > 0 && (
              <div className="d-flex flex-column gap-2 mb-3">
                {upcomingAulas.map(ev => {
                  const curso = cursosById[ev.cursoId]
                  if (!curso) return null
                  return (
                    <div
                      key={`${ev.id}-upcoming`}
                      className="d-flex align-items-center justify-content-between gap-2 border rounded p-2 bg-white"
                    >
                      <div className="d-flex flex-column gap-1">
                        <span className="small text-muted">{formatDateShort(ev.data)}</span>
                        {renderCursoChip(curso, true)}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => goToDate(ev.data, ev.cursoId)}
                      >
                        Ir para data
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <hr />

            <Card.Title className="mb-3">Cursos e Legendas</Card.Title>
            <Form.Group className="mb-3">
              <Form.Label>Buscar curso</Form.Label>
              <Form.Control
                type="search"
                placeholder="Digite para filtrar"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Form.Group>
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
              Clique em um curso para deixá-lo ativo e marque as datas no calendário ou cadastre uma data específica abaixo.
            </div>

            {selectedCurso && (
              <div className="mb-3">
                <Form
                  onSubmit={e => {
                    e.preventDefault()
                    if (!manualDate || !selectedCurso.id) return
                    void toggleEvento(selectedCurso.id, manualDate)
                  }}
                >
                  <Form.Label className="small mb-1">
                    Adicionar data para <strong>{selectedCurso.nome}</strong>
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="date"
                      value={manualDate}
                      onChange={e => setManualDate(e.target.value)}
                      style={{ maxWidth: 180 }}
                    />
                    <Button
                      type="submit"
                      variant="outline-primary"
                      size="sm"
                      disabled={saving || !manualDate}
                    >
                      {saving ? <Spinner size="sm" animation="border" /> : 'Adicionar data'}
                    </Button>
                  </div>
                </Form>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              <div>
                <button
                  type="button"
                  className="w-100 text-start border-0 bg-transparent p-0 d-flex align-items-center justify-content-between"
                  onClick={() => setActiveExpanded(prev => !prev)}
                >
                  <span className="fw-semibold">Ativos ({filteredActiveCursos.length})</span>
                  <span className="text-muted small">{activeExpanded ? '−' : '+'}</span>
                </button>
                <Collapse in={activeExpanded}>
                  <div className="mt-2 d-flex flex-column gap-2">
                    {filteredActiveCursos.map(curso => {
                      const isActive = selectedCursoId === curso.id
                      return (
                        <button
                          key={curso.id}
                          type="button"
                          className="border rounded py-2 px-3 text-start bg-white"
                          style={{
                            boxShadow: isActive
                              ? '0 6px 18px rgba(13, 110, 253, 0.2)'
                              : '0 2px 8px rgba(15, 23, 42, 0.08)',
                            borderColor: isActive ? '#0d6efd' : '#e5e7eb'
                          }}
                          onClick={() => setSelectedCursoId(curso.id)}
                        >
                          <div className="d-flex align-items-start justify-content-between gap-2">
                            <div className="d-flex align-items-start gap-2">
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
                                  {curso.totalEventos === 0
                                    ? 'Nenhuma data marcada'
                                    : `${curso.totalEventos} data${
                                        curso.totalEventos > 1 ? 's' : ''
                                      }`}
                                  {curso.nextDate && ` • próxima: ${formatDateLabel(curso.nextDate)}`}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {isActive && <Badge bg="primary">Ativo</Badge>}
                              <Button
                                type="button"
                                variant="outline-danger"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation()
                                  void handleRemoverCurso(curso)
                                }}
                                title="Remover curso"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                    {!filteredActiveCursos.length && !loading && (
                      <div className="text-muted small">Nenhum curso ativo encontrado.</div>
                    )}
                  </div>
                </Collapse>
              </div>

              {showFinalizados && (
                <div>
                  <button
                    type="button"
                    className="w-100 text-start border-0 bg-transparent p-0 d-flex align-items-center justify-content-between"
                    onClick={() => setFinalizedExpanded(prev => !prev)}
                  >
                    <span className="fw-semibold">Finalizados ({filteredFinalCursos.length})</span>
                    <span className="text-muted small">{finalizedExpanded ? '−' : '+'}</span>
                  </button>
                  <Collapse in={finalizedExpanded}>
                    <div className="mt-2 d-flex flex-column gap-2">
                      {filteredFinalCursos.map(curso => {
                        const isActive = selectedCursoId === curso.id
                        return (
                          <button
                            key={curso.id}
                            type="button"
                            className="border rounded py-2 px-3 text-start bg-white"
                            style={{
                              boxShadow: isActive
                                ? '0 6px 18px rgba(13, 110, 253, 0.2)'
                                : '0 2px 8px rgba(15, 23, 42, 0.08)',
                              borderColor: isActive ? '#0d6efd' : '#e5e7eb'
                            }}
                            onClick={() => setSelectedCursoId(curso.id)}
                          >
                            <div className="d-flex align-items-start justify-content-between gap-2">
                              <div className="d-flex align-items-start gap-2">
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
                                    {curso.totalEventos === 0
                                      ? 'Nenhuma data marcada'
                                      : `${curso.totalEventos} data${
                                          curso.totalEventos > 1 ? 's' : ''
                                        }`}
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {isActive && <Badge bg="primary">Ativo</Badge>}
                                <Button
                                  type="button"
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation()
                                    void handleRemoverCurso(curso)
                                  }}
                                  title="Remover curso"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                      {!filteredFinalCursos.length && !loading && (
                        <div className="text-muted small">Nenhum curso finalizado encontrado.</div>
                      )}
                    </div>
                  </Collapse>
                </div>
              )}

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
