import { useState, useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type User } from 'firebase/auth'
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  Row,
  Col,
  Card,
  Dropdown,
  ButtonGroup
} from 'react-bootstrap'
import { Check2, Clipboard, ClipboardCheck, Whatsapp, FileEarmarkPdf } from 'react-bootstrap-icons'
import GalaxyCalendar from '../components/GalaxyCalendar'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const ENDPOINT = `${API_BASE}/galaxy/inscricoes-por-curso`
const TOGGLE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/toggle`
const UPDATE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/update`
const CONTRATO_ENDPOINT = (id: string) => `${API_BASE}/galaxy/inscricoes/${id}/contrato`
const MONTHLY_SLOTS = 6
const FULLSTACK_KEYWORD = 'fullstack'

type PaymentMode = 'one-time' | 'monthly'
type MonthlyPaymentStatus = 'ok' | 'late'

type MonthlyPaymentSlot = {
  index: number
  amount?: number | null
  status?: MonthlyPaymentStatus | null
}

type Inscricao = {
  id: string
  nomeCompleto: string
  email: string
  curso: string
  dataInscricao: string
  whatsapp?: string
  ondeEstuda?: string
  asaasPaymentLinkUrl?: string
  valorOriginal?: number
  valorCurso?: number
  cupom?: string | null

  pago?: boolean | null
  grupoWhatsapp?: boolean | null
  remoto?: boolean | null

  valorLiquidoFinal?: number | null
  observacoes?: string | null
  paymentMode?: PaymentMode | null
  monthlyPayments?: MonthlyPaymentSlot[] | null
  valorPrevisto?: number | null
}

type CursoGroup = {
  inscricoes: Inscricao[]
  totalInscritos: number
  totalValorLiquido: number
  qtdeRemoto: number
  qtdePresencial: number
}

type ApiResp = {
  total: number
  cursos: Record<string, CursoGroup>
}

type EditableField =
  | 'valorLiquidoFinal'
  | 'observacoes'
  | 'paymentMode'
  | 'monthlyPayments'
  | 'valorPrevisto'

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cursos, setCursos] = useState<Record<string, CursoGroup>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // loading por toggle/atualização (chaves: "id:field")
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null)
  const copyFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ALL_CURSO_KEY = '__all__'
  const [activeCurso, setActiveCurso] = useState<string>(ALL_CURSO_KEY)
  const [activeView, setActiveView] = useState<'inscricoes' | 'calendario'>('inscricoes')

  const cursoEntries = useMemo(
    () => Object.entries(cursos).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')),
    [cursos]
  )

  const globalResumo = useMemo(
    () =>
      cursoEntries.reduce(
        (acc, [, group]) => ({
          totalInscritos: acc.totalInscritos + group.totalInscritos,
          qtdeRemoto: acc.qtdeRemoto + group.qtdeRemoto,
          qtdePresencial: acc.qtdePresencial + group.qtdePresencial,
          totalValorLiquido: acc.totalValorLiquido + group.totalValorLiquido
        }),
        { totalInscritos: 0, qtdeRemoto: 0, qtdePresencial: 0, totalValorLiquido: 0 }
      ),
    [cursoEntries]
  )

  useEffect(() => {
    if (!cursoEntries.length) {
      setActiveCurso(ALL_CURSO_KEY)
      return
    }

    if (activeCurso !== ALL_CURSO_KEY && !cursos[activeCurso]) {
      setActiveCurso(cursoEntries[0][0])
    }
  }, [cursoEntries, cursos, activeCurso])

  useEffect(
    () => () => {
      if (copyFeedbackTimeout.current) {
        clearTimeout(copyFeedbackTimeout.current)
      }
    },
    []
  )

  useEffect(() => {
    onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        const t = await u.getIdToken()
        setToken(t)
        fetchInscricoes(t)
      }
    })
  }, [])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha)
      const t = await cred.user.getIdToken()
      setToken(t)
      setUser(cred.user)
      fetchInscricoes(t)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Erro ao efetuar login')
    }
  }

  const logout = async () => {
    await signOut(auth)
    setCursos({})
    setToken('')
    setLastUpdated(null)
    setActiveCurso(ALL_CURSO_KEY)
  }

  const fetchInscricoes = async (jwt: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<ApiResp>(ENDPOINT, {
        headers: { Authorization: `Bearer ${jwt}` }
      })

      // garantir ordenação desc por data dentro de cada curso
      const normalized: Record<string, CursoGroup> = {}
      Object.entries(data.cursos || {}).forEach(([curso, group]) => {
        const listaOrdenada = [...(group.inscricoes || [])].sort(
          (a, b) => new Date(b.dataInscricao).getTime() - new Date(a.dataInscricao).getTime()
        )
        const totalInscritos = listaOrdenada.length
        const qtdeRemoto = listaOrdenada.filter(i => i.remoto === true).length
        const qtdePresencial = totalInscritos - qtdeRemoto
        const totalValorLiquido = listaOrdenada.reduce(
          (acc, inscricao) => acc + getEffectiveValorLiquido(curso, inscricao),
          0
        )
        normalized[curso] = {
          ...group,
          inscricoes: listaOrdenada,
          totalInscritos,
          qtdeRemoto,
          qtdePresencial,
          totalValorLiquido
        }
      })

      setCursos(normalized)
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const deletar = async (id: string) => {
    void id
    alert('Excluir ainda não disponível nesta API')
  }

  const gerarContrato = async (id: string) => {
    if (!token) return
    const bkey = keyBusy(id, 'contrato')

    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      const { data } = await axios.get(CONTRATO_ENDPOINT(id), {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data?.ok && typeof data.url === 'string') {
        const opened = window.open(data.url, '_blank', 'noopener,noreferrer')
        if (!opened) {
          window.location.assign(data.url)
        }
      } else {
        alert('Não foi possível gerar o contrato.')
      }
    } catch (err) {
      console.error(err)
      alert('Falha ao gerar contrato.')
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  // helpers
  const money = (v?: number | null) =>
    typeof v === 'number' && !Number.isNaN(v) ? `R$ ${v.toFixed(2)}` : '-'
  const isFullstackCourse = (nome?: string | null) =>
    typeof nome === 'string' && nome.toLowerCase().includes(FULLSTACK_KEYWORD)
  const getPaymentMode = (inscricao: Inscricao): PaymentMode =>
    inscricao.paymentMode === 'monthly' ? 'monthly' : 'one-time'
  const usesMonthlyPayments = (cursoNome: string, inscricao: Inscricao) =>
    isFullstackCourse(cursoNome) && getPaymentMode(inscricao) === 'monthly'
  const ensureMonthlyPayments = (list?: MonthlyPaymentSlot[] | null): MonthlyPaymentSlot[] => {
    const base = Array.from({ length: MONTHLY_SLOTS }, (_, index) => ({
      index,
      amount: null,
      status: null
    }))
    if (!Array.isArray(list)) return base
    return base.map(slot => {
      const existing = list.find(item => item && typeof item.index === 'number' && item.index === slot.index)
      if (!existing) return slot
      const rawAmount =
        typeof existing.amount === 'number'
          ? existing.amount
          : typeof existing.amount === 'string'
            ? Number(existing.amount)
            : null
      const amountValue =
        typeof rawAmount === 'number' && Number.isFinite(rawAmount) ? rawAmount : null
      return {
        index: slot.index,
        amount: amountValue,
        status: existing.status ?? null
      }
    })
  }
  const sumMonthlyPayments = (list?: MonthlyPaymentSlot[] | null) =>
    ensureMonthlyPayments(list).reduce((acc, slot) => {
      const amount = typeof slot.amount === 'number' && !Number.isNaN(slot.amount) ? slot.amount : 0
      return acc + amount
    }, 0)
  const getEffectiveValorLiquido = (cursoNome: string, inscricao: Inscricao) => {
    if (usesMonthlyPayments(cursoNome, inscricao)) {
      return sumMonthlyPayments(inscricao.monthlyPayments)
    }
    const valor = inscricao.valorLiquidoFinal
    return typeof valor === 'number' && !Number.isNaN(valor) ? valor : 0
  }
  const keyBusy = (id: string, field: string) => `${id}:${field}`
  const chipStyle = (isActive: boolean): CSSProperties => ({
    borderRadius: 999,
    border: `1px solid ${isActive ? '#0d6efd' : '#dee2e6'}`,
    backgroundColor: isActive ? '#0d6efd' : '#f8f9fa',
    color: isActive ? '#fff' : '#212529',
    boxShadow: isActive ? '0 6px 18px rgba(13, 110, 253, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.08)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 600
  })
  const pagamentoLink = (id: string) => `https://www.programaai.dev/pagamento/${id}`
  const buildWhatsappUrl = (value?: string | null) => {
    if (!value) return null
    const digits = value.replace(/\D/g, '')
    if (!digits) return null
    const normalized = digits.startsWith('55') ? digits : `55${digits}`
    return `https://wa.me/${normalized}`
  }
  const copyPaymentLink = async (id: string) => {
    const link = pagamentoLink(id)
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = link
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedPaymentId(id)
      if (copyFeedbackTimeout.current) clearTimeout(copyFeedbackTimeout.current)
      copyFeedbackTimeout.current = setTimeout(() => {
        setCopiedPaymentId(current => (current === id ? null : current))
      }, 2000)
    } catch (err) {
      console.error(err)
      alert(`Não foi possível copiar automaticamente. Link: ${link}`)
    }
  }

  const updateInscricao = (id: string, updater: (inscricao: Inscricao) => Inscricao) => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        novo[curso] = {
          ...group,
          inscricoes: group.inscricoes.map(i => (i.id === id ? updater(i) : i))
        }
      }
      return novo
    })
  }

  // atualização otimista local de qualquer campo (dentro de um curso)
  const setLocalField = <K extends keyof Inscricao>(id: string, field: K, value: Inscricao[K]) => {
    updateInscricao(id, inscricao => ({ ...inscricao, [field]: value }))
  }

  // recalc totais (quando mexer em valorLiquidoFinal ou remoto, por exemplo)
  const recomputeAggregates = () => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        const totalInscritos = group.inscricoes.length
        const qtdeRemoto = group.inscricoes.filter(i => i.remoto === true).length
        const qtdePresencial = totalInscritos - qtdeRemoto
        const totalValorLiquido = group.inscricoes.reduce(
          (acc, i) => acc + getEffectiveValorLiquido(curso, i),
          0
        )
        novo[curso] = { ...group, totalInscritos, qtdeRemoto, qtdePresencial, totalValorLiquido }
      }
      return novo
    })
  }

  const handlePaymentModeChange = (inscricao: Inscricao, mode: PaymentMode) => {
    updateInscricao(inscricao.id, current => {
      if (mode === 'monthly') {
        const normalized = ensureMonthlyPayments(current.monthlyPayments)
        return {
          ...current,
          paymentMode: mode,
          monthlyPayments: normalized,
          valorLiquidoFinal: sumMonthlyPayments(normalized)
        }
      }
      return { ...current, paymentMode: mode }
    })
    recomputeAggregates()
  }

  const handleMonthlyAmountChange = (inscricao: Inscricao, slotIndex: number, value: string) => {
    const parsed = value === '' ? null : Number(value)
    const amount = parsed === null || Number.isNaN(parsed) ? null : parsed
    updateInscricao(inscricao.id, current => {
      const normalized = ensureMonthlyPayments(current.monthlyPayments)
      const updated = normalized.map(slot =>
        slot.index === slotIndex ? { ...slot, amount } : slot
      )
      return {
        ...current,
        monthlyPayments: updated,
        valorLiquidoFinal: sumMonthlyPayments(updated)
      }
    })
    recomputeAggregates()
  }

  const handleMonthlyStatusChange = (
    inscricao: Inscricao,
    slotIndex: number,
    status: MonthlyPaymentStatus
  ) => {
    updateInscricao(inscricao.id, current => {
      const normalized = ensureMonthlyPayments(current.monthlyPayments)
      const updated = normalized.map(slot =>
        slot.index === slotIndex ? { ...slot, status } : slot
      )
      return {
        ...current,
        monthlyPayments: updated
      }
    })
  }

  const handleValorPrevistoChange = (inscricao: Inscricao, value: string) => {
    const parsed = value === '' ? null : Number(value)
    const safeValue = parsed === null || Number.isNaN(parsed) ? null : parsed
    setLocalField(inscricao.id, 'valorPrevisto', safeValue)
  }

  const handleMonthlySave = async (inscricao: Inscricao) => {
    if (!token) return
    const mode = getPaymentMode(inscricao)
    const normalized = ensureMonthlyPayments(inscricao.monthlyPayments)
    const totalMensalidades = sumMonthlyPayments(normalized)
    await updateField(inscricao.id, 'paymentMode', mode)
    await updateField(inscricao.id, 'monthlyPayments', normalized)
    if (mode === 'monthly') {
      await updateField(inscricao.id, 'valorPrevisto', inscricao.valorPrevisto ?? null)
      await updateField(inscricao.id, 'valorLiquidoFinal', totalMensalidades)
    } else {
      await updateField(inscricao.id, 'valorPrevisto', null)
    }
  }

  // TOGGLE (pago/grupoWhatsapp/remoto)
  const toggleField = async (
    id: string,
    current: boolean | null | undefined,
    field: 'pago' | 'grupoWhatsapp' | 'remoto'
  ) => {
    if (!token) return
    const nextValue = !(current === true)
    const bkey = keyBusy(id, field)

    setLocalField(id, field, nextValue)      // otimista
    if (field === 'remoto') recomputeAggregates()
    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      await axios.post(
        TOGGLE_ENDPOINT,
        { id, field },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    } catch (err) {
      console.error(err)
      setError(`Falha ao alternar ${field}`)
      setLocalField(id, field, !nextValue)   // rollback
      if (field === 'remoto') recomputeAggregates()
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  // UPDATE (valorLiquidoFinal/observacoes)
  const updateField = async <K extends EditableField>(
    id: string,
    field: K,
    value: Inscricao[K]
  ) => {
    if (!token) return
    const bkey = keyBusy(id, field)
    const prev = getLocalFieldValue(id, field)

    setLocalField(id, field, value) // otimista
    if (field === 'valorLiquidoFinal') recomputeAggregates()
    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      await axios.post(
        UPDATE_ENDPOINT,
        { id, field, value },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    } catch (err: unknown) {
      console.error(err)
      setError(`Falha ao atualizar ${field}`)
      setLocalField(id, field, prev) // rollback
      if (field === 'valorLiquidoFinal') recomputeAggregates()
    } finally {
      setBusy(s => {
        const { [bkey]: removed, ...rest } = s
        void removed
        return rest
      })
    }
  }

  const getLocalFieldValue = <K extends EditableField>(id: string, field: K): Inscricao[K] | null => {
    for (const group of Object.values(cursos)) {
      const found = group.inscricoes.find(i => i.id === id)
      if (found) {
        const value = found[field]
        return (value ?? null) as Inscricao[K] | null
      }
    }
    return null
  }

  const cursosParaRender =
    activeCurso === ALL_CURSO_KEY
      ? cursoEntries
      : cursoEntries.filter(([curso]) => curso === activeCurso)
  const ultimaAtualizacaoLabel = lastUpdated ? lastUpdated.toLocaleString('pt-BR') : '—'
  const hasCursos = cursoEntries.length > 0

  if (!user) {
    return (
      <Container fluid className="py-5" style={{ maxWidth: 520 }}>
        <h2 className="mb-4">Galaxy</h2>
        <Form onSubmit={login}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Senha</Form.Label>
            <Form.Control type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </Form.Group>
          <Button type="submit">Entrar</Button>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="mb-1">Painel Galaxy</h2>
          <div className="text-muted small">Última atualização: {ultimaAtualizacaoLabel}</div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => fetchInscricoes(token)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : 'Atualizar'}
          </Button>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
      <div className="mb-3">
        <ButtonGroup size="sm">
          <Button
            variant={activeView === 'inscricoes' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveView('inscricoes')}
          >
            Inscrições
          </Button>
          <Button
            variant={activeView === 'calendario' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveView('calendario')}
          >
            Calendário
          </Button>
        </ButtonGroup>
      </div>

      {activeView === 'inscricoes' && (
        <>
          <Row className="g-3 mb-4">
            <Col xs={12} md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="text-uppercase text-muted fs-6 mb-1">
                    Inscrições
                  </Card.Title>
                  <h3 className="fw-semibold mb-0">{globalResumo.totalInscritos}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="text-uppercase text-muted fs-6 mb-1">Remoto</Card.Title>
                  <h3 className="fw-semibold mb-0">{globalResumo.qtdeRemoto}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="text-uppercase text-muted fs-6 mb-1">
                    Presencial
                  </Card.Title>
                  <h3 className="fw-semibold mb-0">{globalResumo.qtdePresencial}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="text-uppercase text-muted fs-6 mb-1">
                    Valor Líquido
                  </Card.Title>
                  <h3 className="fw-semibold mb-0">{money(globalResumo.totalValorLiquido)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {hasCursos && (
            <div
              className="d-flex flex-wrap align-items-center gap-3 mb-4"
              role="tablist"
              aria-label="Cursos disponíveis"
            >
              <button
                type="button"
                onClick={() => setActiveCurso(ALL_CURSO_KEY)}
                style={chipStyle(activeCurso === ALL_CURSO_KEY)}
                role="tab"
                aria-selected={activeCurso === ALL_CURSO_KEY}
              >
                <span
                  className="text-start"
                  style={{ flex: '1 1 auto', minWidth: 0, whiteSpace: 'normal' }}
                >
                  Todos
                </span>
                <Badge
                  bg={activeCurso === ALL_CURSO_KEY ? 'light' : 'secondary'}
                  text={activeCurso === ALL_CURSO_KEY ? 'dark' : undefined}
                >
                  {globalResumo.totalInscritos}
                </Badge>
              </button>
              {cursoEntries.map(([curso, group]) => {
                const isActive = activeCurso === curso
                return (
                  <button
                    key={curso}
                    type="button"
                    onClick={() => setActiveCurso(curso)}
                    style={chipStyle(isActive)}
                    title={curso}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span
                      className="text-start"
                      style={{ flex: '1 1 auto', minWidth: 0, whiteSpace: 'normal' }}
                    >
                      {curso}
                    </span>
                    <Badge
                      bg={isActive ? 'light' : 'secondary'}
                      text={isActive ? 'dark' : undefined}
                    >
                      {group.totalInscritos}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {cursosParaRender.map(([curso, group]) => (
            <Card key={curso} className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white py-3">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <h4 className="mb-0">{curso}</h4>
                  <Badge bg="dark" pill>
                    Total: {group.totalInscritos}
                  </Badge>
                  <Badge bg="primary" pill>
                    Remoto: {group.qtdeRemoto}
                  </Badge>
                  <Badge bg="secondary" pill>
                    Presencial: {group.qtdePresencial}
                  </Badge>
                  <Badge bg="success" pill>
                    Líquido: {money(group.totalValorLiquido)}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table
                    striped
                    hover
                    size="sm"
                    className="mb-0 align-middle"
                    style={{ minWidth: 1100 }}
                  >
                    <thead
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                      className="bg-light text-muted"
                    >
                      <tr style={{ whiteSpace: 'nowrap' }}>
                        <th>Data/Hora</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>WhatsApp</th>
                        <th className="text-end">Valor</th>
                        <th style={{ minWidth: 260 }}>Pagamento</th>
                        <th className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span>Pago</span>
                            <Badge bg="success">✓</Badge>
                          </div>
                        </th>
                        <th className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span>Grupo</span>
                            <Badge bg="info">WA</Badge>
                          </div>
                        </th>
                        <th className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <span>Remoto</span>
                            <Badge bg="warning" text="dark">
                              R
                            </Badge>
                          </div>
                        </th>
                        <th className="text-end">Valor Líquido Final</th>
                        <th>Observações</th>
                        <th className="text-center">Atalhos</th>
                        <th className="text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.inscricoes.map(i => {
                        const pagoKey = keyBusy(i.id, 'pago')
                        const grupoKey = keyBusy(i.id, 'grupoWhatsapp')
                        const remotoKey = keyBusy(i.id, 'remoto')
                        const vlKey = keyBusy(i.id, 'valorLiquidoFinal')
                    const obsKey = keyBusy(i.id, 'observacoes')
                    const contratoKey = keyBusy(i.id, 'contrato')
                    const paymentModeBusyKey = keyBusy(i.id, 'paymentMode')
                    const monthlyBusy = [
                      keyBusy(i.id, 'monthlyPayments'),
                      keyBusy(i.id, 'valorPrevisto'),
                      paymentModeBusyKey,
                      vlKey
                    ].some(key => busy[key])

                    const pagoChecked = !!i.pago
                    const grupoChecked = !!i.grupoWhatsapp
                    const remotoChecked = !!i.remoto

                    const vl = typeof i.valorLiquidoFinal === 'number' ? i.valorLiquidoFinal : null
                    const valorPrevisto = typeof i.valorPrevisto === 'number' ? i.valorPrevisto : null
                    const obs = i.observacoes ?? ''
                    const whatsappUrl = buildWhatsappUrl(i.whatsapp)
                    const isFullstack = isFullstackCourse(i.curso || curso)
                    const paymentMode = getPaymentMode(i)
                    const normalizedMonthlyPayments = ensureMonthlyPayments(i.monthlyPayments)
                    const showMonthlyDetails = isFullstack && paymentMode === 'monthly'
                    const monthlyTotal = sumMonthlyPayments(normalizedMonthlyPayments)

                    return (
                      <tr key={i.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(i.dataInscricao).toLocaleString()}
                        </td>
                        <td>{i.nomeCompleto}</td>
                        <td>{i.email}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span>{i.whatsapp || '-'}</span>
                            {whatsappUrl && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir conversa no WhatsApp"
                              >
                                <Whatsapp />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="text-end">{money(i.valorCurso)}</td>
                        <td className="align-top" style={{ minWidth: 260 }}>
                          {isFullstack ? (
                            <div className="d-flex flex-column gap-2">
                              <div>
                                <div className="fw-semibold small mb-1">Forma de pagamento</div>
                                <div className="d-flex flex-column gap-1">
                                  <Form.Check
                                    type="radio"
                                    id={`pagamento-unico-${i.id}`}
                                    label="Pagamento único"
                                    name={`payment-mode-${i.id}`}
                                    checked={paymentMode === 'one-time'}
                                    onChange={() => handlePaymentModeChange(i, 'one-time')}
                                    inline={false}
                                  />
                                  <Form.Check
                                    type="radio"
                                    id={`pagamento-mensal-${i.id}`}
                                    label="Mensalidades (6x)"
                                    name={`payment-mode-${i.id}`}
                                    checked={paymentMode === 'monthly'}
                                    onChange={() => handlePaymentModeChange(i, 'monthly')}
                                    inline={false}
                                  />
                                </div>
                              </div>

                              {showMonthlyDetails && (
                                <>
                                  <div className="d-flex flex-wrap gap-2">
                                    {normalizedMonthlyPayments.map(slot => (
                                      <div
                                        key={slot.index}
                                        className="border rounded p-2 flex-grow-1"
                                        style={{ minWidth: 150, maxWidth: '48%' }}
                                      >
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <strong className="small mb-0">
                                            Mensalidade {slot.index + 1}
                                          </strong>
                                          <div className="d-flex gap-1">
                                            <Button
                                              type="button"
                                              variant={
                                                slot.status === 'ok' ? 'success' : 'outline-success'
                                              }
                                              size="sm"
                                              onClick={() => handleMonthlyStatusChange(i, slot.index, 'ok')}
                                              title="Em dia"
                                            >
                                              ✓
                                            </Button>
                                            <Button
                                              type="button"
                                              variant={
                                                slot.status === 'late' ? 'danger' : 'outline-danger'
                                              }
                                              size="sm"
                                              onClick={() => handleMonthlyStatusChange(i, slot.index, 'late')}
                                              title="Em atraso"
                                            >
                                              !
                                            </Button>
                                          </div>
                                        </div>
                                        <Form.Control
                                          size="sm"
                                          type="number"
                                          min={0}
                                          step="0.01"
                                          value={slot.amount ?? ''}
                                          placeholder="R$ 0,00"
                                          onChange={e =>
                                            handleMonthlyAmountChange(i, slot.index, e.target.value)
                                          }
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div>
                                    <Form.Label className="small mb-1">Valor previsto</Form.Label>
                                    <InputGroup size="sm">
                                      <InputGroup.Text>R$</InputGroup.Text>
                                      <Form.Control
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={valorPrevisto ?? ''}
                                        onChange={e => handleValorPrevistoChange(i, e.target.value)}
                                      />
                                    </InputGroup>
                                  </div>
                                </>
                              )}

                              <div className="d-flex flex-column gap-1">
                                <small className="text-muted">
                                  {showMonthlyDetails
                                    ? `Recebido até agora: ${money(monthlyTotal)}`
                                    : 'Controle padrão de pagamento único'}
                                </small>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => void handleMonthlySave(i)}
                                  disabled={monthlyBusy}
                                >
                                  {monthlyBusy ? <Spinner size="sm" animation="border" /> : 'Salvar pagamentos'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Badge bg="secondary" pill>
                              Pagamento único
                            </Badge>
                          )}
                        </td>

                        <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-2">
                            <Form.Check
                              type="switch"
                              id={`pago-${i.id}`}
                              checked={pagoChecked}
                              disabled={!!busy[pagoKey]}
                              onChange={() => toggleField(i.id, i.pago, 'pago')}
                              title="Marcar pagamento"
                            />
                            {busy[pagoKey] && <Spinner size="sm" animation="border" />}
                          </div>
                        </td>

                        <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-2">
                            <Form.Check
                              type="switch"
                              id={`grupo-${i.id}`}
                              checked={grupoChecked}
                              disabled={!!busy[grupoKey]}
                              onChange={() => toggleField(i.id, i.grupoWhatsapp, 'grupoWhatsapp')}
                              title="Marcar entrada no grupo"
                            />
                            {busy[grupoKey] && <Spinner size="sm" animation="border" />}
                          </div>
                        </td>

                        <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-2">
                            <Form.Check
                              type="switch"
                              id={`remoto-${i.id}`}
                              checked={remotoChecked}
                              disabled={!!busy[remotoKey]}
                              onChange={() => toggleField(i.id, i.remoto, 'remoto')}
                              title="Marcar remoto"
                            />
                            {busy[remotoKey] && <Spinner size="sm" animation="border" />}
                          </div>
                        </td>

                        <td className="text-end" style={{ minWidth: 220 }}>
                          {showMonthlyDetails ? (
                            <div className="text-start">
                              <div className="small text-muted mb-1">Valor líquido (mensalidades)</div>
                              <div className="d-flex align-items-center gap-2">
                                <strong>{money(monthlyTotal)}</strong>
                                {busy[vlKey] && <Spinner size="sm" animation="border" />}
                              </div>
                            </div>
                          ) : (
                            <InputGroup size="sm">
                              <InputGroup.Text>R$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={vl ?? ''}
                                placeholder="0,00"
                                disabled={!!busy[vlKey]}
                                onChange={e => {
                                  const raw = e.target.value
                                  const numericValue = raw === '' ? null : Number(raw)
                                  const safeValue =
                                    typeof numericValue === 'number' && Number.isNaN(numericValue)
                                      ? null
                                      : numericValue
                                  setLocalField(i.id, 'valorLiquidoFinal', safeValue)
                                  recomputeAggregates()
                                }}
                                onBlur={e => {
                                  const raw = e.target.value
                                  const numericValue = raw === '' ? null : Number(raw)
                                  const safeValue =
                                    typeof numericValue === 'number' && Number.isNaN(numericValue)
                                      ? null
                                      : numericValue
                                  updateField(i.id, 'valorLiquidoFinal', safeValue)
                                }}
                              />
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled={!!busy[vlKey]}
                                onClick={() =>
                                  updateField(
                                    i.id,
                                    'valorLiquidoFinal',
                                    getLocalFieldValue(i.id, 'valorLiquidoFinal')
                                  )
                                }
                                title="Salvar valor"
                              >
                                <Check2 />
                              </Button>
                              {busy[vlKey] && (
                                <InputGroup.Text>
                                  <Spinner size="sm" animation="border" />
                                </InputGroup.Text>
                              )}
                            </InputGroup>
                          )}
                        </td>

                        <td style={{ minWidth: 260 }}>
                          <InputGroup size="sm">
                            <Form.Control
                              type="text"
                              value={obs}
                              placeholder="Anotações internas…"
                              disabled={!!busy[obsKey]}
                              onChange={e => setLocalField(i.id, 'observacoes', e.target.value)}
                              onBlur={e => updateField(i.id, 'observacoes', e.target.value || null)}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              disabled={!!busy[obsKey]}
                              onClick={() =>
                                updateField(
                                  i.id,
                                  'observacoes',
                                  getLocalFieldValue(i.id, 'observacoes')
                                )
                              }
                              title="Salvar observações"
                            >
                              <Check2 />
                            </Button>
                            {busy[obsKey] && (
                              <InputGroup.Text>
                                <Spinner size="sm" animation="border" />
                              </InputGroup.Text>
                            )}
                          </InputGroup>
                        </td>

                        <td className="text-center" style={{ minWidth: 190 }}>
                          <Dropdown as={ButtonGroup} size="sm" align="end">
                            <Button
                              type="button"
                              variant="outline-secondary"
                              title="Gerar contrato em PDF"
                              aria-label="Gerar contrato em PDF"
                              disabled={!!busy[contratoKey]}
                              onClick={() => gerarContrato(i.id)}
                            >
                              {busy[contratoKey] ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <FileEarmarkPdf />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant={copiedPaymentId === i.id ? 'success' : 'outline-secondary'}
                              title={
                                copiedPaymentId === i.id
                                  ? 'Link copiado!'
                                  : 'Copiar link de pagamento'
                              }
                              onClick={() => copyPaymentLink(i.id)}
                            >
                              {copiedPaymentId === i.id ? <ClipboardCheck /> : <Clipboard />}
                            </Button>
                            <Dropdown.Toggle
                              split
                              variant="outline-secondary"
                              id={`detalhes-${i.id}`}
                              title="Ver mais detalhes"
                            />
                            <Dropdown.Menu>
                              <Dropdown.Header>Atalhos</Dropdown.Header>
                              <Dropdown.Item
                                as="button"
                                type="button"
                                onClick={() => copyPaymentLink(i.id)}
                              >
                                Copiar link de pagamento
                              </Dropdown.Item>
                              <Dropdown.ItemText>
                                <small className="text-muted">
                                  {pagamentoLink(i.id).replace('https://', '')}
                                </small>
                              </Dropdown.ItemText>
                              <Dropdown.Divider />
                              <Dropdown.Header>Informações adicionais</Dropdown.Header>
                              <Dropdown.ItemText>
                                <strong>Onde estuda:</strong> {i.ondeEstuda || '—'}
                              </Dropdown.ItemText>
                              <Dropdown.ItemText>
                                <strong>Cupom:</strong> {i.cupom || '—'}
                              </Dropdown.ItemText>
                              {i.asaasPaymentLinkUrl && (
                                <>
                                  <Dropdown.Divider />
                                  <Dropdown.ItemText>
                                    <strong>Link Asaas:</strong>
                                    <div className="text-break">{i.asaasPaymentLinkUrl}</div>
                                  </Dropdown.ItemText>
                                </>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>

                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deletar(i.id)}
                            disabled
                            title="Excluir inscrição"
                          >
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
          ))}

          {!hasCursos && !loading && (
            <Alert variant="info">Nenhuma inscrição encontrada.</Alert>
          )}

          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          )}
        </>
      )}

      {activeView === 'calendario' && (
        <GalaxyCalendar apiBase={API_BASE} token={token} />
      )}
    </Container>
  )
}
