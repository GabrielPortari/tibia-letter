import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl text-gold font-bold">404</p>
      <h1 className="text-xl font-semibold text-text">Página não encontrada</h1>
      <p className="text-text-muted max-w-sm">A página que você procura não existe ou foi movida.</p>
      <Link to="/"><Button variant="secondary">Voltar ao início</Button></Link>
    </div>
  )
}
