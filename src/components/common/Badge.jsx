const CORES = {
  'em análise': 'bg-signal-amber/10 text-signal-amber',
  'pedido realizado': 'bg-roque-blue-100 text-roque-blue-700',
  'em trânsito': 'bg-roque-gold-100 text-roque-gold-600',
  resolvido: 'bg-signal-green/10 text-signal-green',
  ativo: 'bg-signal-green/10 text-signal-green',
  inativo: 'bg-concrete-200 text-concrete-700',
}

export default function Badge({ texto }) {
  const cor = CORES[texto?.toLowerCase()] || 'bg-concrete-200 text-concrete-700'
  return <span className={`badge ${cor}`}>{texto}</span>
}
