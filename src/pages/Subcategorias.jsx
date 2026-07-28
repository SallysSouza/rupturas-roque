import { useEffect, useState } from 'react'
import AppLayout from '../components/layout/AppLayout.jsx'
import { supabase } from '../supabaseClient'

/**
 * Subcategoria é um campo livre em `produtos` (não uma tabela própria no
 * schema original). Esta tela lista as subcategorias em uso e quantos
 * produtos cada uma tem, útil para conferência e padronização.
 */
export default function Subcategorias() {
  const [linhas, setLinhas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('produtos').select('subcategoria').not('subcategoria', 'is', null)
      const contagem = new Map()
      ;(data || []).forEach((p) => {
        const nome = (p.subcategoria || '').trim()
        if (!nome) return
        contagem.set(nome, (contagem.get(nome) || 0) + 1)
      })
      setLinhas([...contagem.entries()].sort((a, b) => a[0].localeCompare(b[0])))
      setCarregando(false)
    }
    carregar()
  }, [])

  return (
    <AppLayout titulo="Subcategorias">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-concrete-50 text-left text-xs uppercase tracking-wide text-concrete-500">
            <tr>
              <th className="px-4 py-3">Subcategoria</th>
              <th className="px-4 py-3 text-right">Produtos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {linhas.map(([nome, qtd]) => (
              <tr key={nome}>
                <td className="px-4 py-3 font-medium text-concrete-900">{nome}</td>
                <td className="px-4 py-3 text-right text-concrete-500">{qtd}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!carregando && linhas.length === 0 && (
          <p className="p-8 text-center text-sm text-concrete-500">Nenhuma subcategoria cadastrada ainda.</p>
        )}
      </div>
    </AppLayout>
  )
}
