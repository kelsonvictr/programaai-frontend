import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Button,
  Collapse,
  Form,
  OverlayTrigger,
  Popover,
  Spinner
} from 'react-bootstrap'
import { ChevronLeft, ChevronRight, Calendar2Check, Clock, Plus, Trash, Search } from 'react-bootstrap-icons'

type CalendarioCurso = {
  id: string
  nome: string
  cor: string
}

type CalendarioEvento = {
  id: string
  cursoId: string
  data: string
}

type CalendarioApiResp = {
  cursos: CalendarioCurso[]
  eventos: CalendarioEvento[]
}

type GalaxyCalendarProps = {
  apiBase: string
  token: string
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
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

type Holiday = { date: string; name: string }

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
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
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
  { date: buildDateKey(year, 7, 5), name: 'Aniv. João Pessoa' },
  { date: buildDateKey(year, 5, 24), name: 'São João' }
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
  const [cursoCor, setCursoCor] = useState('#3b82f6')
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
    for (const c of cursos) map[c.id] = c
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
      return { ...curso, totalEventos: list.length, nextDate, isFinalizado: !nextDate }
    })
  }, [cursos, eventosByCursoId, todayKey])

  const finalizadoByCursoId = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of cursoStats) map[c.id] = c.isFinalizado
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
      { date: buildDateKey(carnivalMonday.getFullYear(), carnivalMonday.getMonth(), carnivalMonday.getDate()), name: 'Carnaval' },
      { date: buildDateKey(carnivalTuesday.getFullYear(), carnivalTuesday.getMonth(), carnivalTuesday.getDate()), name: 'Carnaval' },
      ...getJoaoPessoaHolidays(year)
    ]
    const map: Record<string, string> = {}
    for (const h of list) map[h.date] = h.name
    return map
  }, [currentMonth])

  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const first = new Date(year, month, 1)
    const firstWeekday = first.getDay()
    const offset = (firstWeekday + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<number | null> = []
    for (let i = 0; i < offset; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(day)
    while (cells.length % 7 !== 0) cells.push(null)

    const weeks: Array<Array<number | null>> = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
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
      if (!selectedCursoId && data.cursos?.length) setSelectedCursoId(data.cursos[0].id)
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

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  const handleAddCurso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const nome = cursoNome.trim()
    if (!nome) return

    setSaving(true)
    setError(null)
    try {
      const { data } = await axios.post(CALENDARIO_CURSO_ENDPOINT, { nome, cor: cursoCor }, { headers: { Authorization: `Bearer ${token}` } })
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
    const confirmado = window.confirm(`Remover o curso "${curso.nome}" e todas as datas associadas?`)
    if (!confirmado) return

    setSaving(true)
    setError(null)
    try {
      await axios.post(CALENDARIO_CURSO_DELETE_ENDPOINT, { id: curso.id }, { headers: { Authorization: `Bearer ${token}` } })
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
    if (!day || !token) return
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateKey = buildDateKey(year, month, day)
    // Apenas seleciona o dia, não adiciona evento automaticamente
    setSelectedDateKey(prev => prev === dateKey ? null : dateKey)
  }

  const toggleEvento = async (cursoId: string, dateKey: string) => {
    setSaving(true)
    setError(null)
    try {
      const { data } = await axios.post(CALENDARIO_EVENTO_TOGGLE_ENDPOINT, { cursoId, data: dateKey }, { headers: { Authorization: `Bearer ${token}` } })
      const mode = data?.mode
      if (mode === 'removed') {
        setEventos(prev => prev.filter(ev => !(ev.cursoId === cursoId && ev.data === dateKey)))
      } else if (mode === 'added' && data?.evento) {
        setEventos(prev => [...prev, data.evento])
      } else {
        setEventos(prev => {
          const exists = prev.some(ev => ev.cursoId === cursoId && ev.data === dateKey)
          if (exists) return prev.filter(ev => !(ev.cursoId === cursoId && ev.data === dateKey))
          return [...prev, { id: `${cursoId}#${dateKey}`, cursoId, data: dateKey }]
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
    return future.slice(0, 10)
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

  const renderCursoChip = (curso: CalendarioCurso, compact = false) => (
    <span
      className="galaxy-calendar-event-chip"
      title={curso.nome}
      style={{
        backgroundColor: curso.cor || '#3b82f6',
        padding: compact ? '2px 6px' : '4px 10px',
        fontSize: compact ? '0.68rem' : '0.78rem'
      }}
    >
      {curso.nome}
    </span>
  )

  return (
    <div className="galaxy-calendar">
      {/* Main Calendar */}
      <div className="galaxy-calendar-card">
        <div className="galaxy-calendar-header">
          <div className="galaxy-calendar-title">
            <Calendar2Check className="galaxy-calendar-title-icon" />
            <span>{headerLabel}</span>
          </div>
          <div className="galaxy-calendar-nav">
            <button type="button" className="galaxy-calendar-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft />
            </button>
            <button type="button" className="galaxy-calendar-nav-btn" onClick={handleNextMonth}>
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="galaxy-calendar-toolbar">
          <span className="galaxy-calendar-toolbar-hint">
            Clique em um dia para marcar ou remover aulas do curso selecionado.
          </span>
          <div className="galaxy-calendar-toolbar-actions">
            <button
              type="button"
              className="galaxy-calendar-btn"
              disabled={!upcomingAulas.length}
              onClick={() => {
                const next = upcomingAulas[0]
                if (next) goToDate(next.data, next.cursoId)
              }}
            >
              <Clock style={{ marginRight: 4 }} /> Próxima aula
            </button>
            <Form.Check
              type="switch"
              id="calendar-show-selected"
              label={showOnlySelected ? 'Somente selecionado' : 'Mostrar todos'}
              checked={showOnlySelected}
              onChange={e => setShowOnlySelected(e.target.checked)}
            />
            <Form.Check
              type="switch"
              id="calendar-show-finalizados"
              label="Finalizados"
              checked={showFinalizados}
              onChange={e => setShowFinalizados(e.target.checked)}
            />
          </div>
        </div>

        <div className="galaxy-calendar-grid">
          <div className="galaxy-calendar-weekdays">
            {weekdayLabels.map(label => (
              <div key={label} className="galaxy-calendar-weekday">{label}</div>
            ))}
          </div>

          <div className="galaxy-calendar-weeks">
            {calendarMatrix.map((week, wIndex) => (
              <div key={wIndex} className="galaxy-calendar-week">
                {week.map((day, dIndex) => {
                  const key = `${wIndex}-${dIndex}-${day ?? 'empty'}`
                  if (!day) {
                    return <div key={key} className="galaxy-calendar-day empty" />
                  }

                  const dateKey = buildDateKey(year, month, day)
                  const listaEventos = eventosPorData[dateKey] || []
                  const holidayName = holidaysByDate[dateKey]
                  const hasSelectedCurso = selectedCursoId && listaEventos.some(ev => ev.cursoId === selectedCursoId)
                  const isToday = dateKey === todayKey
                  const isSelected = selectedDateKey === dateKey
                  const cursosDia = listaEventos.map(ev => cursosById[ev.cursoId]).filter(Boolean) as CalendarioCurso[]
                  const chips = cursosDia.slice(0, 2)
                  const remaining = cursosDia.length - chips.length

                  let cellClass = 'galaxy-calendar-day'
                  if (isToday) cellClass += ' today'
                  if (isSelected) cellClass += ' selected'
                  if (hasSelectedCurso) cellClass += ' has-selected-curso'
                  if (holidayName) cellClass += ' holiday'

                  return (
                    <button
                      key={key}
                      type="button"
                      className={cellClass}
                      onClick={() => handleDiaClick(day)}
                    >
                      <div className="galaxy-calendar-day-header">
                        <span className="galaxy-calendar-day-number">{day}</span>
                        {isToday && <span className="galaxy-calendar-day-today-badge">Hoje</span>}
                      </div>
                      {holidayName && (
                        <div className="galaxy-calendar-holiday">{holidayName}</div>
                      )}
                      <div className="galaxy-calendar-day-events">
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
                                      <div key={`${dateKey}-${curso.id}`}>{renderCursoChip(curso, true)}</div>
                                    ))}
                                  </div>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span className="galaxy-calendar-more-events" onClick={e => e.stopPropagation()}>
                              +{remaining} mais
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

        {selectedDateKey && (
          <div className="galaxy-calendar-selected-day">
            <h5 className="galaxy-calendar-selected-day-title">
              📆 Aulas de {formatDateLabel(selectedDateKey)}
            </h5>
            {selectedDayEventos.length === 0 ? (
              <p className="galaxy-calendar-selected-day-empty">Nenhuma aula marcada neste dia.</p>
            ) : (
              <div className="galaxy-calendar-selected-day-list">
                {selectedDayEventos.map(ev => {
                  const curso = cursosById[ev.cursoId]
                  if (!curso) return null
                  return (
                    <div key={ev.id} className="galaxy-calendar-selected-day-item">
                      {renderCursoChip(curso)}
                      <Button variant="outline-danger" size="sm" onClick={() => toggleEvento(ev.cursoId, ev.data)}>
                        Remover
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedCurso && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Alternar aula de <strong style={{ color: selectedCurso.cor }}>{selectedCurso.nome}</strong>
                  </span>
                  <Button
                    variant={selectedDayHasSelectedCurso ? 'outline-danger' : 'outline-primary'}
                    size="sm"
                    onClick={() => toggleEvento(selectedCurso.id, selectedDateKey)}
                  >
                    {selectedDayHasSelectedCurso ? 'Desmarcar' : 'Marcar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="galaxy-calendar-sidebar">
        {/* Upcoming Classes */}
        <div className="galaxy-calendar-upcoming">
          <h4 className="galaxy-calendar-section-title">
            <Clock /> Próximas aulas
          </h4>
          {upcomingAulas.length === 0 ? (
            <p className="galaxy-calendar-empty">Nenhuma aula futura cadastrada.</p>
          ) : (
            <div className="galaxy-calendar-upcoming-list">
              {upcomingAulas.map(ev => {
                const curso = cursosById[ev.cursoId]
                if (!curso) return null
                return (
                  <div key={`${ev.id}-upcoming`} className="galaxy-calendar-upcoming-item">
                    <div className="galaxy-calendar-upcoming-info">
                      <span className="galaxy-calendar-upcoming-date">{formatDateShort(ev.data)}</span>
                      {renderCursoChip(curso, true)}
                    </div>
                    <button
                      type="button"
                      className="galaxy-calendar-upcoming-btn"
                      onClick={() => goToDate(ev.data, ev.cursoId)}
                    >
                      Ir para data
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Courses Management */}
        <div className="galaxy-calendar-courses">
          <h4 className="galaxy-calendar-section-title">
            <Search /> Cursos
          </h4>

          <div className="galaxy-calendar-search">
            <input
              type="search"
              placeholder="Buscar curso..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="galaxy-calendar-add-form">
            <div className="galaxy-calendar-add-form-title">
              <Plus /> Novo Curso
            </div>
            <form onSubmit={handleAddCurso}>
              <div className="galaxy-calendar-add-form-row">
                <input
                  className="galaxy-calendar-add-form-input"
                  type="text"
                  placeholder="Nome do curso"
                  value={cursoNome}
                  onChange={e => setCursoNome(e.target.value)}
                />
                <input
                  className="galaxy-calendar-color-picker"
                  type="color"
                  value={cursoCor}
                  onChange={e => setCursoCor(e.target.value)}
                />
              </div>
              <button type="submit" className="galaxy-calendar-add-btn" disabled={saving || !cursoNome.trim()}>
                {saving ? <Spinner size="sm" animation="border" /> : 'Adicionar'}
              </button>
            </form>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

          {selectedCurso && (
            <div className="galaxy-calendar-manual-date">
              <div className="galaxy-calendar-manual-date-label">
                Adicionar data para <strong>{selectedCurso.nome}</strong>
              </div>
              <form
                className="galaxy-calendar-manual-date-row"
                onSubmit={e => {
                  e.preventDefault()
                  if (!manualDate || !selectedCurso.id) return
                  void toggleEvento(selectedCurso.id, manualDate)
                }}
              >
                <input
                  className="galaxy-calendar-manual-date-input"
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                />
                <button type="submit" className="galaxy-calendar-btn" disabled={saving || !manualDate}>
                  {saving ? <Spinner size="sm" animation="border" /> : 'Adicionar'}
                </button>
              </form>
            </div>
          )}

          {/* Active Courses */}
          <div className="galaxy-calendar-course-section">
            <button
              type="button"
              className="galaxy-calendar-course-section-header"
              onClick={() => setActiveExpanded(prev => !prev)}
            >
              <span className="galaxy-calendar-course-section-title">Ativos ({filteredActiveCursos.length})</span>
              <span className="galaxy-calendar-course-section-toggle">{activeExpanded ? '−' : '+'}</span>
            </button>
            <Collapse in={activeExpanded}>
              <div className="galaxy-calendar-course-list">
                {filteredActiveCursos.map(curso => {
                  const isActive = selectedCursoId === curso.id
                  return (
                    <button
                      key={curso.id}
                      type="button"
                      className={`galaxy-calendar-course-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedCursoId(curso.id)}
                    >
                      <div className="galaxy-calendar-course-item-header">
                        <div className="galaxy-calendar-course-item-info">
                          <span className="galaxy-calendar-course-color" style={{ backgroundColor: curso.cor }} />
                          <div className="galaxy-calendar-course-details">
                            <div className="galaxy-calendar-course-name">{curso.nome}</div>
                            <div className="galaxy-calendar-course-meta">
                              {curso.totalEventos === 0 ? 'Sem datas' : `${curso.totalEventos} data${curso.totalEventos > 1 ? 's' : ''}`}
                              {curso.nextDate && ` • próx: ${formatDateLabel(curso.nextDate)}`}
                            </div>
                          </div>
                        </div>
                        <div className="galaxy-calendar-course-actions">
                          {isActive && <span className="galaxy-calendar-course-active-badge">Ativo</span>}
                          <button
                            type="button"
                            className="galaxy-calendar-course-delete"
                            onClick={e => { e.stopPropagation(); void handleRemoverCurso(curso) }}
                            title="Remover curso"
                          >
                            <Trash />
                          </button>
                        </div>
                      </div>
                    </button>
                  )
                })}
                {!filteredActiveCursos.length && !loading && (
                  <p className="galaxy-calendar-empty">Nenhum curso ativo encontrado.</p>
                )}
              </div>
            </Collapse>
          </div>

          {/* Finalized Courses */}
          {showFinalizados && (
            <div className="galaxy-calendar-course-section">
              <button
                type="button"
                className="galaxy-calendar-course-section-header"
                onClick={() => setFinalizedExpanded(prev => !prev)}
              >
                <span className="galaxy-calendar-course-section-title">Finalizados ({filteredFinalCursos.length})</span>
                <span className="galaxy-calendar-course-section-toggle">{finalizedExpanded ? '−' : '+'}</span>
              </button>
              <Collapse in={finalizedExpanded}>
                <div className="galaxy-calendar-course-list">
                  {filteredFinalCursos.map(curso => {
                    const isActive = selectedCursoId === curso.id
                    return (
                      <button
                        key={curso.id}
                        type="button"
                        className={`galaxy-calendar-course-item ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedCursoId(curso.id)}
                      >
                        <div className="galaxy-calendar-course-item-header">
                          <div className="galaxy-calendar-course-item-info">
                            <span className="galaxy-calendar-course-color" style={{ backgroundColor: curso.cor }} />
                            <div className="galaxy-calendar-course-details">
                              <div className="galaxy-calendar-course-name">{curso.nome}</div>
                              <div className="galaxy-calendar-course-meta">
                                {curso.totalEventos === 0 ? 'Sem datas' : `${curso.totalEventos} data${curso.totalEventos > 1 ? 's' : ''}`}
                              </div>
                            </div>
                          </div>
                          <div className="galaxy-calendar-course-actions">
                            {isActive && <span className="galaxy-calendar-course-active-badge">Ativo</span>}
                            <button
                              type="button"
                              className="galaxy-calendar-course-delete"
                              onClick={e => { e.stopPropagation(); void handleRemoverCurso(curso) }}
                              title="Remover curso"
                            >
                              <Trash />
                            </button>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {!filteredFinalCursos.length && !loading && (
                    <p className="galaxy-calendar-empty">Nenhum curso finalizado.</p>
                  )}
                </div>
              </Collapse>
            </div>
          )}

          {/* Selected Course Dates */}
          {selectedCurso && eventosCursoSelecionado.length > 0 && (
            <div className="galaxy-calendar-course-dates">
              <h5 className="galaxy-calendar-section-title" style={{ fontSize: '0.95rem' }}>
                Datas de {selectedCurso.nome}
              </h5>
              <div className="galaxy-calendar-course-dates-list">
                {eventosCursoSelecionado.map(ev => (
                  <div key={ev.id} className="galaxy-calendar-course-date-item">
                    <div className="galaxy-calendar-course-date-info">
                      <span className="galaxy-calendar-course-date-dot" style={{ backgroundColor: selectedCurso.cor }} />
                      <span className="galaxy-calendar-course-date-text">{formatDateLabel(ev.data)}</span>
                    </div>
                    <button
                      type="button"
                      className="galaxy-calendar-course-date-remove"
                      onClick={() => toggleEvento(selectedCurso.id, ev.data)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!cursos.length && !loading && (
            <p className="galaxy-calendar-empty">
              Nenhum curso cadastrado. Crie um curso acima para começar.
            </p>
          )}

          {loading && (
            <div className="d-flex justify-content-center py-3">
              <Spinner animation="border" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
