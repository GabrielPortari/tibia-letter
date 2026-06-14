import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function Forbidden() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-red font-bold">403</p>
      <h1 className="text-xl font-semibold text-text">Acesso negado</h1>
      <p className="text-text-muted max-w-sm">Você não tem permissão para acessar esta página.</p>
      <Link to="/worlds"><Button variant="secondary">Ir para Mundos</Button></Link>
    </div>
  )
}
