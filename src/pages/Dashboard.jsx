import { useEffect, useState } from 'react'
import { ClipboardList, Boxes, PackageX } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Badge from '../components/common/Badge.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient'
import { LOJAS } from '../lib/lojas.js'

function CardIndicador({ icone: Icone, rotulo, valor, cor }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`rounded-xl p-3 ${cor}`}>
        <Icone size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-concrete-900">{valor ?? '—'}</p>
        <p className="text-sm text-concrete-500">{rotulo}</p>
      </div>
    </div>
  )
}

function BarraStatus({ rotulo, valor, maximo, cor }) {
  const largura = maximo ? Math.max(4, Math.round((valor / maximo) * 100)) : 0
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-concrete-700">{rotulo}</span>
        <span className="font-semibold text-concrete-900">{valor}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-concrete-100">
        <div className="h-full rounded-full" style={{ width: `${largura}%`, backgroundColor: cor }} />
      </div>
    </div>
  )
}

const CORES_STATUS = {
  'Em análise': '#d68a20',
  'Pedido realizado': '#2f47b8',
  'Em trânsito': '#eda916',
  Resolvido: '#2f8f5b',
}

export default function Dashboard() {
  const { perfil } = useAuth()
  const ehGestor = perfil?.role === 'comprador' || perfil?.role === 'admin'

  const [indicadores, setIndicadores] = useState({ rupturas: null, produtos: null, semCadastro: null })
  const [recentes, setRecentes] = useState([])
  const [porStatus, setPorStatus] = useState([])
  const [porLoja, setPorLoja] = useState([])
  const [pendentes, setPendentes] = useState([])

  useEffect(() => {
    async function carregarIndicadores() {
      const [rupturas, produtos, semCadastro] = await Promise.all([
        supabase.from('rupturas').select('*', { count: 'exact', head: true }).eq('status', 'Em análise'),
        supabase.from('produtos').select('*', { count: 'exact', head: true }),
        supabase.from('produtos_sem_cadastro').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
      ])
      setIndicadores({
        rupturas: rupturas.count ?? 0,
        produtos: produtos.count ?? 0,
        semCadastro: semCadastro.count ?? 0,
      })
    }
    carregarIndicadores()

    if (!ehGestor) return

    async function carregarPainelGestor() {
      const { data: todasRupturas } = await supabase
        .from('rupturas')
        .select('*')
        .order('data_hora', { ascending: false })
        .limit(200)

      setRecentes((todasRupturas || []).slice(0, 5))

      const contagemStatus = new Map()
      const contagemLoja = new Map()
      ;(todasRupturas || []).forEach((r) => {
        contagemStatus.set(r.status, (contagemStatus.get(r.status) || 0) + 1)
        if (r.status !== 'Resolvido') contagemLoja.set(r.loja, (contagemLoja.get(r.loja) || 0) + 1)
      })
      setPorStatus([...contagemStatus.entries()])
      setPorLoja(LOJAS.map((loja) => [loja, contagemLoja.get(loja) || 0]))

      const { data: semCadastro } = await supabase
        .from('produtos_sem_cadastro')
        .select('*')
        .eq('status', 'pendente')
        .order('data_hora', { ascending: false })
        .limit(5)
      setPendentes(semCadastro || [])
    }
    carregarPainelGestor()
  }, [ehGestor])

  const maximoStatus = Math.max(1, ...porStatus.map(([, v]) => v))

  return (
    <AppLayout titulo={`Olá, ${perfil?.nome?.split(' ')[0] || ''}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardIndicador
          icone={ClipboardList}
          rotulo="Rupturas em análise"
          valor={indicadores.rupturas}
          cor="bg-signal-amber/10 text-signal-amber"
        />
        {ehGestor && (
          <>
            <CardIndicador
              icone={Boxes}
              rotulo="Produtos cadastrados"
              valor={indicadores.produtos}
              cor="bg-roque-blue-100 text-roque-blue-700"
            />
            <CardIndicador
              icone={PackageX}
              rotulo="Produtos sem cadastro"
              valor={indicadores.semCadastro}
              cor="bg-signal-red/10 text-signal-red"
            />
          </>
        )}
      </div>

      {ehGestor && (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display font-bold text-concrete-900">Rupturas recentes</h2>
              </div>
              <div className="divide-y divide-concrete-100">
                {recentes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-concrete-900">{r.produto_descricao}</p>
                      <p className="text-xs text-concrete-500">
                        {r.loja} · {r.criado_por_nome || 'vendedor'}
                      </p>
                    </div>
                    <Badge texto={r.status} />
                  </div>
                ))}
                {recentes.length === 0 && (
                  <p className="py-6 text-center text-sm text-concrete-500">Nenhuma ruptura registrada ainda.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <h2 className="mb-3 font-display font-bold text-concrete-900">Rupturas por status</h2>
                <div className="space-y-3.5">
                  {porStatus.map(([status, valor]) => (
                    <BarraStatus
                      key={status}
                      rotulo={status}
                      valor={valor}
                      maximo={maximoStatus}
                      cor={CORES_STATUS[status] || '#83868f'}
                    />
                  ))}
                  {porStatus.length === 0 && <p className="text-sm text-concrete-500">Sem dados ainda.</p>}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="mb-3 font-display font-bold text-concrete-900">Rupturas em aberto por loja</h2>
                <div className="divide-y divide-concrete-100">
                  {porLoja.map(([loja, qtd]) => (
                    <div key={loja} className="flex items-center justify-between py-2.5">
                      <span className="text-sm font-medium text-concrete-900">{loja}</span>
                      <span className="badge bg-signal-amber/10 text-signal-amber">{qtd} em aberto</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-4 p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display font-bold text-concrete-900">Produtos sem cadastro pendentes</h2>
            </div>
            <div className="divide-y divide-concrete-100">
              {pendentes.map((p) => (
                <div key={p.id} className="py-3">
                  <p className="text-sm font-medium text-concrete-900">{p.descricao_informada}</p>
                  <p className="text-xs text-concrete-500">
                    Solicitado por {p.criado_por_nome || 'vendedor'} · {p.loja} ·{' '}
                    {new Date(p.data_hora).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
              {pendentes.length === 0 && (
                <p className="py-6 text-center text-sm text-concrete-500">Nenhuma pendência no momento.</p>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
