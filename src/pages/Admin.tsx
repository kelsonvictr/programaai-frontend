import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { Container, Table, Button, Form, Spinner, Alert, Badge, InputGroup } from 'react-bootstrap'
import { Check2 } from 'react-bootstrap-icons'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const ENDPOINT = `${API_BASE}/galaxy/inscricoes-por-curso`
const TOGGLE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/toggle`
const UPDATE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/update`

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

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cursos, setCursos] = useState<Record<string, CursoGroup>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  // loading por toggle/atualização (chaves: "id:field")
  const [busy, setBusy] = useState<Record<string, boolean>>({})

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
    } catch (err: any) {
      setError(err.message)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setCursos({})
    setToken('')
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
        normalized[curso] = {
          ...group,
          inscricoes: listaOrdenada
        }
      })

      setCursos(normalized)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const deletar = async (_id: string) => {
    alert('Excluir ainda não disponível nesta API')
  }

  // helpers
  const money = (v?: number | null) =>
    typeof v === 'number' && !Number.isNaN(v) ? `R$ ${v.toFixed(2)}` : '-'
  const keyBusy = (id: string, field: string) => `${id}:${field}`

  // atualização otimista local de qualquer campo (dentro de um curso)
  const setLocalField = (id: string, field: keyof Inscricao, value: any) => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        novo[curso] = {
          ...group,
          inscricoes: group.inscricoes.map(i => (i.id === id ? { ...i, [field]: value } : i))
        }
      }
      return novo
    })
  }

  // recalc totais (quando mexer em valorLiquidoFinal ou remoto, por exemplo)
  const recomputeAggregates = () => {
    setCursos(prev => {
      const novo: typeof prev = {}
      for (const [curso, group] of Object.entries(prev)) {
        const totalInscritos = group.inscricoes.length
        const qtdeRemoto = group.inscricoes.filter(i => i.remoto === true).length
        const qtdePresencial = totalInscritos - qtdeRemoto
        const totalValorLiquido = group.inscricoes.reduce((acc, i) => {
          const v = i.valorLiquidoFinal
          if (typeof v === 'number' && !Number.isNaN(v)) return acc + v
          return acc
        }, 0)
        novo[curso] = { ...group, totalInscritos, qtdeRemoto, qtdePresencial, totalValorLiquido }
      }
      return novo
    })
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
        const { [bkey]: _, ...rest } = s
        return rest
      })
    }
  }

  // UPDATE (valorLiquidoFinal/observacoes)
  const updateField = async (
    id: string,
    field: 'valorLiquidoFinal' | 'observacoes',
    value: number | string | null
  ) => {
    if (!token) return
    const bkey = keyBusy(id, field)
    const prev = getLocalFieldValue(id, field)

    setLocalField(id, field, value as any) // otimista
    if (field === 'valorLiquidoFinal') recomputeAggregates()
    setBusy(s => ({ ...s, [bkey]: true }))
    setError(null)

    try {
      await axios.post(
        UPDATE_ENDPOINT,
        { id, field, value },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    } catch (err) {
      console.error(err)
      setError(`Falha ao atualizar ${field}`)
      setLocalField(id, field, prev) // rollback
      if (field === 'valorLiquidoFinal') recomputeAggregates()
    } finally {
      setBusy(s => {
        const { [bkey]: _, ...rest } = s
        return rest
      })
    }
  }

  const getLocalFieldValue = (id: string, field: 'valorLiquidoFinal' | 'observacoes') => {
    for (const group of Object.values(cursos)) {
      const found = group.inscricoes.find(i => i.id === id)
      if (found) return (found as any)[field]
    }
    return null
  }

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
      <div className="d-flex align-items-center gap-3 mb-3">
        <h2 className="mb-0">Inscrições por Curso</h2>
        <Button variant="outline-secondary" size="sm" onClick={() => fetchInscricoes(token)}>
          Atualizar
        </Button>
        <Button variant="secondary" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {Object.entries(cursos).map(([curso, group]) => (
        <div key={curso} className="mb-5">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h4 className="mb-0">{curso}</h4>
            <Badge bg="dark">Total: {group.totalInscritos}</Badge>
            <Badge bg="primary">Remoto: {group.qtdeRemoto}</Badge>
            <Badge bg="secondary">Presencial: {group.qtdePresencial}</Badge>
            <Badge bg="success">Líquido: {money(group.totalValorLiquido)}</Badge>
          </div>

          {/* Wrapper com scroll horizontal sempre */}
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <Table striped bordered hover
              style={{ minWidth: 1300 /* força largura para mostrar scroll se precisar */ }}>
              <thead>
                <tr style={{ whiteSpace: 'nowrap' }}>
                  <th>Data/Hora</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Onde Estuda</th>
                  <th>Valor</th>
                  <th>Cupom</th>
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
                      <Badge bg="warning" text="dark">R</Badge>
                    </div>
                  </th>
                  <th>Valor Líquido Final</th>
                  <th>Observações</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {group.inscricoes.map(i => {
                  const pagoKey = keyBusy(i.id, 'pago')
                  const grupoKey = keyBusy(i.id, 'grupoWhatsapp')
                  const remotoKey = keyBusy(i.id, 'remoto')
                  const vlKey = keyBusy(i.id, 'valorLiquidoFinal')
                  const obsKey = keyBusy(i.id, 'observacoes')

                  const pagoChecked = !!i.pago
                  const grupoChecked = !!i.grupoWhatsapp
                  const remotoChecked = !!i.remoto

                  const vl = typeof i.valorLiquidoFinal === 'number' ? i.valorLiquidoFinal : null
                  const obs = i.observacoes ?? ''

                  return (
                    <tr key={i.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(i.dataInscricao).toLocaleString()}</td>
                      <td>{i.nomeCompleto}</td>
                      <td>{i.email}</td>
                      <td>{i.whatsapp || '-'}</td>
                      <td>{i.ondeEstuda || '-'}</td>
                      <td>{money(i.valorCurso)}</td>
                      <td>{i.cupom || '-'}</td>

                      {/* Toggle Pago */}
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

                      {/* Toggle Grupo WhatsApp */}
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

                      {/* Toggle Remoto */}
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

                      {/* Valor Líquido Final (R$) */}
                      <td style={{ minWidth: 200 }}>
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
                              const val = e.target.value === '' ? null : Number(e.target.value)
                              setLocalField(i.id, 'valorLiquidoFinal', isNaN(Number(val)) ? null : (val as number | null))
                              recomputeAggregates()
                            }}
                            onBlur={e => {
                              const val = e.target.value === '' ? null : Number(e.target.value)
                              updateField(i.id, 'valorLiquidoFinal', isNaN(Number(val)) ? null : val)
                            }}
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={!!busy[vlKey]}
                            onClick={() => updateField(i.id, 'valorLiquidoFinal', getLocalFieldValue(i.id, 'valorLiquidoFinal'))}
                            title="Salvar valor"
                          >
                            <Check2 />
                          </Button>
                          {busy[vlKey] && <InputGroup.Text><Spinner size="sm" animation="border" /></InputGroup.Text>}
                        </InputGroup>
                      </td>

                      {/* Observações */}
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
                            onClick={() => updateField(i.id, 'observacoes', getLocalFieldValue(i.id, 'observacoes'))}
                            title="Salvar observações"
                          >
                            <Check2 />
                          </Button>
                          {busy[obsKey] && <InputGroup.Text><Spinner size="sm" animation="border" /></InputGroup.Text>}
                        </InputGroup>
                      </td>

                      <td>
                        <Button variant="danger" size="sm" onClick={() => deletar(i.id)} disabled>
                          🗑️ Deletar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </div>
      ))}

      {!Object.keys(cursos).length && !loading && (
        <Alert variant="info">Nenhuma inscrição encontrada.</Alert>
      )}
    </Container>
  )
}
