import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { Container, Table, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const ENDPOINT = `${API_BASE}/galaxy/inscricoes-por-curso`
const TOGGLE_ENDPOINT = `${API_BASE}/galaxy/inscricoes/toggle`

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

  // novos campos (podem vir ausentes → tratamos como null)
  pago?: boolean | null
  grupoWhatsapp?: boolean | null
}

type ApiResp = {
  total: number
  cursos: Record<string, Inscricao[]>
}

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [grupos, setGrupos] = useState<Record<string, Inscricao[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  // loading por toggle (chave: "id:field")
  const [toggling, setToggling] = useState<Record<string, boolean>>({})

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
    setGrupos({})
    setToken('')
  }

  const fetchInscricoes = async (jwt: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<ApiResp>(ENDPOINT, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      // defensivo: garante ordenação desc em cada curso
      const ordenado: Record<string, Inscricao[]> = {}
      Object.entries(data.cursos || {}).forEach(([curso, lista]) => {
        ordenado[curso] = [...lista].sort(
          (a, b) => new Date(b.dataInscricao).getTime() - new Date(a.dataInscricao).getTime()
        )
      })
      setGrupos(ordenado)
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

  // --- helpers ---
  const fmtMoney = (v?: number) => (typeof v === 'number' ? `R$ ${v.toFixed(2)}` : '-')
  const keyTF = (id: string, field: 'pago' | 'grupoWhatsapp') => `${id}:${field}`

  // update otimista no estado local
  const setLocalToggle = (id: string, field: 'pago' | 'grupoWhatsapp', value: boolean) => {
    setGrupos(prev => {
      const novo: typeof prev = {}
      for (const [curso, lista] of Object.entries(prev)) {
        novo[curso] = lista.map(i => (i.id === id ? { ...i, [field]: value } : i))
      }
      return novo
    })
  }

  const toggleField = async (id: string, current: boolean | null | undefined, field: 'pago' | 'grupoWhatsapp') => {
    if (!token) return
    const nextValue = !(current === true) // null/false -> true ; true -> false (espelho do backend)
    const toggleKey = keyTF(id, field)

    // otimista
    setLocalToggle(id, field, nextValue)
    setToggling(s => ({ ...s, [toggleKey]: true }))
    setError(null)

    try {
      await axios.post(
        TOGGLE_ENDPOINT,
        { id, field },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
      // sucesso: nada a fazer, já está otimista
    } catch (err) {
      console.error(err)
      setError(`Falha ao alternar ${field}`)
      // rollback
      setLocalToggle(id, field, !nextValue)
    } finally {
      setToggling(s => {
        const { [toggleKey]: _, ...rest } = s
        return rest
      })
    }
  }

  if (!user) {
    return (
      <Container className="py-5" style={{ maxWidth: 420 }}>
        <h2 className="mb-4">Galaxy (Admin)</h2>
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
    <Container className="py-5">
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

      {Object.entries(grupos).map(([curso, lista]) => (
        <div key={curso} className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-2">
            <h4 className="mb-0">{curso}</h4>
            <Badge bg="dark">{lista.length}</Badge>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(i => {
                const pagoKey = keyTF(i.id, 'pago')
                const grupoKey = keyTF(i.id, 'grupoWhatsapp')
                const pagoChecked = !!i.pago
                const grupoChecked = !!i.grupoWhatsapp

                return (
                  <tr key={i.id}>
                    <td>{new Date(i.dataInscricao).toLocaleString()}</td>
                    <td>{i.nomeCompleto}</td>
                    <td>{i.email}</td>
                    <td>{i.whatsapp || '-'}</td>
                    <td>{i.ondeEstuda || '-'}</td>
                    <td>{fmtMoney(i.valorCurso)}</td>
                    <td>{i.cupom || '-'}</td>

                    {/* Toggle Pago */}
                    <td className="text-center">
                      <div className="d-inline-flex align-items-center gap-2">
                        <Form.Check
                          type="switch"
                          id={`pago-${i.id}`}
                          checked={pagoChecked}
                          disabled={!!toggling[pagoKey]}
                          onChange={() => toggleField(i.id, i.pago, 'pago')}
                          title="Marcar pagamento"
                        />
                        {toggling[pagoKey] && <Spinner size="sm" animation="border" />}
                      </div>
                    </td>

                    {/* Toggle Grupo WhatsApp */}
                    <td className="text-center">
                      <div className="d-inline-flex align-items-center gap-2">
                        <Form.Check
                          type="switch"
                          id={`grupo-${i.id}`}
                          checked={grupoChecked}
                          disabled={!!toggling[grupoKey]}
                          onChange={() => toggleField(i.id, i.grupoWhatsapp, 'grupoWhatsapp')}
                          title="Marcar entrada no grupo"
                        />
                        {toggling[grupoKey] && <Spinner size="sm" animation="border" />}
                      </div>
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
      ))}

      {!Object.keys(grupos).length && !loading && (
        <Alert variant="info">Nenhuma inscrição encontrada.</Alert>
      )}
    </Container>
  )
}
