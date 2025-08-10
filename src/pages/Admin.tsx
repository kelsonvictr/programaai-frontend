import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { Container, Table, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap'

const API_BASE = import.meta.env.VITE_ADMIN_API as string
const ENDPOINT = `${API_BASE}/galaxy/inscricoes-por-curso`

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

  // botão deletar desativado por enquanto (endpoint ainda não existe na Admin API)
  const deletar = async (_id: string) => {
    alert('Excluir ainda não disponível nesta API')
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(i => (
                <tr key={i.id}>
                  <td>{new Date(i.dataInscricao).toLocaleString()}</td>
                  <td>{i.nomeCompleto}</td>
                  <td>{i.email}</td>
                  <td>{i.whatsapp || '-'}</td>
                  <td>{i.ondeEstuda || '-'}</td>
                  <td>
                    {typeof i.valorCurso === 'number'
                      ? `R$ ${i.valorCurso.toFixed(2)}`
                      : '-'}
                  </td>
                  <td>{i.cupom || '-'}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deletar(i.id)} disabled>
                      🗑️ Deletar
                    </Button>
                  </td>
                </tr>
              ))}
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
