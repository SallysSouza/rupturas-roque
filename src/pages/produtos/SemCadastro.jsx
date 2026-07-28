import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout.jsx'
import { supabase } from '../../supabaseClient'

export default function SemCadastro() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    const { data } = await supabase
      .from('produtos_sem_cadastro')
      .select('*')
      .order('data_hora', { ascending: false })
    setItens(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
    const canal = supabase
      .channel(`produtos-sem-cadastro-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos_sem_cadastro' }, carregar)
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  async function marcarResolvido(id) {
    await supabase.from('produtos_sem_cadastro').update({ status: 'resolvido' }).eq('id', id)
  }

  const pendentes = itens.filter((i) => i.status !== 'resolvido')

  return (
    <AppLayout titulo="Produtos sem Cadastro">
      <div className="card divide-y divide-concrete-100">
        {pendentes.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-concrete-900">{item.descricao_informada}</p>
              <p className="text-xs text-concrete-500">
                Solicitado por {item.criado_por_nome || 'vendedor'} em {new Date(item.data_hora).toLocaleString('pt-BR')}
              </p>
            </div>
            <button onClick={() => marcarResolvido(item.id)} className="btn-ghost shrink-0">
              <CheckCircle2 size={16} />
              Marcar como cadastrado
            </button>
          </div>
        ))}
        {!carregando && pendentes.length === 0 && (
          <p className="p-8 text-center text-sm text-concrete-500">Nenhuma pendência no momento. 🎉</p>
        )}
      </div>
    </AppLayout>
  )
}
