import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

const TAMANHO_PAGINA = 50

// O filtro .or() do PostgREST usa vírgula como separador de condições,
// então removemos vírgulas/parênteses do termo digitado para não quebrar a query.
function sanitizarTermo(termo) {
  return termo.replace(/[,()]/g, ' ').trim()
}

/**
 * Busca produtos com paginação real no servidor (range) + pesquisa por
 * código, descrição, departamento e subcategoria — em vez de carregar toda
 * a base de uma vez (o que travava a listagem em ~1.000 itens, limite
 * padrão de linhas do PostgREST/Supabase quando não se usa .range()).
 *
 * Uso: role o final da lista e chame `carregarMais()` (lazy loading).
 */
export function useProdutosPaginados(termoBusca) {
  const [produtos, setProdutos] = useState([])
  const [pagina, setPagina] = useState(0)
  const [total, setTotal] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const termoAtualRef = useRef(termoBusca)

  const buscarPagina = useCallback(async (numeroPagina, termo, substituir) => {
    setCarregando(true)
    setErro(null)
    try {
      const de = numeroPagina * TAMANHO_PAGINA
      const ate = de + TAMANHO_PAGINA - 1

      let query = supabase.from('produtos').select('*', { count: 'exact' }).order('descricao').range(de, ate)

      const termoLimpo = sanitizarTermo(termo || '')
      if (termoLimpo) {
        const like = `%${termoLimpo}%`
        query = query.or(
          `codigo.ilike.${like},descricao.ilike.${like},departamento.ilike.${like},subcategoria.ilike.${like}`,
        )
      }

      const { data, error, count } = await query
      if (error) throw error

      // Se o termo de busca mudou enquanto a requisição estava em voo, descarta o resultado.
      if (termoAtualRef.current !== termo) return

      setProdutos((atual) => (substituir ? data : [...atual, ...data]))
      setTotal(count ?? 0)
    } catch (e) {
      setErro(e.message || 'Erro ao buscar produtos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  // Nova busca: zera a paginação sempre que o termo digitado muda.
  useEffect(() => {
    termoAtualRef.current = termoBusca
    setPagina(0)
    buscarPagina(0, termoBusca, true)
  }, [termoBusca, buscarPagina])

  const carregarMais = useCallback(() => {
    const proxima = pagina + 1
    setPagina(proxima)
    buscarPagina(proxima, termoBusca, false)
  }, [pagina, termoBusca, buscarPagina])

  const recarregar = useCallback(() => {
    setPagina(0)
    buscarPagina(0, termoBusca, true)
  }, [termoBusca, buscarPagina])

  const temMais = produtos.length < total

  return { produtos, total, carregando, erro, temMais, carregarMais, recarregar }
}
