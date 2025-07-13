import { useState, useEffect } from 'react'
import axios from 'axios'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { Container, Table, Button, Form, Spinner, Alert } from 'react-bootstrap'

const API_URL = `${import.meta.env.VITE_API_URL}/galaxy/inscricoes`

type Inscricao = {
  id: string
  nomeCompleto: string
  email: string
  curso: string
  dataInscricao: string
  whatsapp: string
  ondeEstuda?: string
  asaasPaymentLinkUrl?: string
}

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
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
    setInscricoes([])
    setToken('')
  }

  const fetchInscricoes = async (jwt: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get<Inscricao[]>(API_URL, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      const ordenadas = data.sort((a, b) => new Date(b.dataInscricao).getTime() - new Date(a.dataInscricao).getTime())
      setInscricoes(ordenadas)
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const deletar = async (id: string) => {
    if (!window.confirm('Confirma excluir esta inscrição?')) return
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInscricoes(inscricoes.filter(i => i.id !== id))
    } catch (err) {
      console.error(err)
      setError('Erro ao deletar inscrição')
    }
  }

  if (!user) {
    return (
      <Container className="py-5" style={{ maxWidth: 400 }}>
        <h2>Galaxy</h2>
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

  const inscricoesPorCurso = inscricoes.reduce((acc, inscricao) => {
    if (!acc[inscricao.curso]) acc[inscricao.curso] = []
    acc[inscricao.curso].push(inscricao)
    return acc
  }, {} as Record<string, Inscricao[]>)

  return (
    <Container className="py-5">
      <h2>Inscrições</h2>
      <Button variant="secondary" onClick={logout} className="mb-3">Sair</Button>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {Object.entries(inscricoesPorCurso).map(([curso, lista]) => (
        <div key={curso} className="mb-5">
          <h4>{curso}</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Nome</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Onde Estuda</th>
                <th>Link Pagamento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(i => (
                <tr key={i.id}>
                  <td>
                    {new Date(i.dataInscricao).toLocaleString()}
                  </td>
                  <td>{i.nomeCompleto}</td>
                  <td>{i.email}</td>
                  <td>{i.whatsapp}</td>
                  <td>{i.ondeEstuda || '-'}</td>
                  <td>
                    {i.asaasPaymentLinkUrl
                      ? <a href={i.asaasPaymentLinkUrl} target="_blank" rel="noreferrer">Link</a>
                      : '-'}
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deletar(i.id)}>
                      🗑️ Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
    </Container>
  )
}
