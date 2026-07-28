import { useEffect, useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import { supabase } from '../supabaseClient'

function BarraStat({ rotulo, valor, maximo }) {
  const largura = maximo ? Math.max(4, Math.round((valor / maximo) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-concrete-700">{rotulo}</span>
        <span className="font-semibold text-concrete-900">{valor}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-concrete-100">
        <div className="h-full rounded-full bg-roque-blue-700" style={{ width: `${largura}%` }} />
      </div>
    </div>
  )
}

export default function Relatorios() {
  const [porStatus, setPorStatus] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('rupturas').select('status')
      const contagem = new Map()
      ;(data || []).forEach((r) => contagem.set(r.status, (contagem.get(r.status) || 0) + 1))
      setPorStatus([...contagem.entries()])
      setCarregando(false)
    }
    carregar()
  }, [])

  const maximo = Math.max(1, ...porStatus.map(([, v]) => v))

  return (
    <AppLayout titulo="Relatórios">
      <div className="card max-w-xl p-6">
        <h2 className="mb-5 font-display font-bold text-concrete-900">Rupturas por status</h2>
        <div className="space-y-4">
          {porStatus.map(([status, valor]) => (
            <BarraStat key={status} rotulo={status} valor={valor} maximo={maximo} />
          ))}
        </div>
        {!carregando && porStatus.length === 0 && (
          <p className="text-sm text-concrete-500">Ainda não há rupturas registradas para gerar relatório.</p>
        )}
      </div>
    </AppLayout>
  )
}
