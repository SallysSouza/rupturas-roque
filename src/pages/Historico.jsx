import { useEffect, useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Badge from '../components/common/Badge.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../supabaseClient'

export default function Historico() {
  const { perfil } = useAuth()
  const [rupturas, setRupturas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!perfil?.id) return

    async function carregar() {
      const { data } = await supabase
        .from('rupturas')
        .select('*')
        .eq('criado_por', perfil.id)
        .order('data_hora', { ascending: false })
      setRupturas(data || [])
      setCarregando(false)
    }
    carregar()

    // Atualização em tempo real: reflete mudanças de status feitas pelo comprador.
    const canal = supabase
      .channel(`historico-${perfil.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rupturas', filter: `criado_por=eq.${perfil.id}` }, carregar)
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [perfil?.id])

  return (
    <AppLayout titulo="Minhas Rupturas">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete-50 text-left text-xs uppercase tracking-wide text-concrete-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {rupturas.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-concrete-900">{r.produto_descricao}</p>
                  <p className="text-xs text-concrete-500">{r.produto_codigo}</p>
                </td>
                <td className="px-4 py-3 text-concrete-500">{new Date(r.data_hora).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <Badge texto={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!carregando && rupturas.length === 0 && (
          <p className="p-8 text-center text-sm text-concrete-500">Você ainda não registrou nenhuma ruptura.</p>
        )}
      </div>
    </AppLayout>
  )
}
