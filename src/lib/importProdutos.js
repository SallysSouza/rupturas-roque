import * as XLSX from 'xlsx'
import { supabase } from '../supabaseClient'

const TAMANHO_LOTE = 500 // upsert em lotes pequenos evita timeout/estouro de memória

// Aceita variações comuns de nome de coluna na planilha (maiúsculas, com/sem acento).
const MAPA_COLUNAS = {
  codigo: ['codigo', 'código', 'cod', 'sku'],
  descricao: ['descricao', 'descrição', 'produto', 'nome'],
  departamento: ['departamento', 'depto'],
  subcategoria: ['subcategoria', 'subcategoria do sku', 'sub-categoria'],
  fornecedor: ['fornecedor'],
  unidade: ['unidade', 'un', 'unid'],
}

function normalizarChave(chave) {
  return chave
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function valorDaLinha(linha, alvos) {
  const chaves = Object.keys(linha)
  for (const chave of chaves) {
    if (alvos.includes(normalizarChave(chave))) {
      return String(linha[chave] ?? '').trim()
    }
  }
  return ''
}

function linhaParaProduto(linha) {
  const codigo = valorDaLinha(linha, MAPA_COLUNAS.codigo)
  const descricao = valorDaLinha(linha, MAPA_COLUNAS.descricao)
  if (!codigo || !descricao) return null // linha vazia/ inválida (ex: rodapé da planilha)

  return {
    codigo,
    descricao,
    departamento: valorDaLinha(linha, MAPA_COLUNAS.departamento),
    subcategoria: valorDaLinha(linha, MAPA_COLUNAS.subcategoria),
    fornecedor: valorDaLinha(linha, MAPA_COLUNAS.fornecedor),
    unidade: valorDaLinha(linha, MAPA_COLUNAS.unidade),
    status: 'ativo',
  }
}

function dividirEmLotes(lista, tamanho) {
  const lotes = []
  for (let i = 0; i < lista.length; i += tamanho) {
    lotes.push(lista.slice(i, i + tamanho))
  }
  return lotes
}

/**
 * Importa produtos de uma planilha (.xlsx/.csv) para a tabela `produtos`.
 *
 * - Suporta portfólios grandes (20.000+ linhas): não há limite artificial,
 *   o único teto é a memória do navegador ao ler o arquivo.
 * - Importa em lotes (upsert por `codigo`) para não estourar timeout/memória.
 * - Nenhuma linha válida é descartada silenciosamente; linhas sem código ou
 *   descrição são reportadas em `ignoradas` no resultado final, para revisão.
 * - Reporta progresso via `onProgresso({ processados, total, restante, percentual })`.
 */
export async function importarProdutosDaPlanilha(arquivo, { onProgresso } = {}) {
  const buffer = await arquivo.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const primeiraAba = workbook.Sheets[workbook.SheetNames[0]]
  const linhasBrutas = XLSX.utils.sheet_to_json(primeiraAba, { defval: '' })

  const produtosValidos = []
  const linhasIgnoradas = []
  linhasBrutas.forEach((linha, indice) => {
    const produto = linhaParaProduto(linha)
    if (produto) produtosValidos.push(produto)
    else linhasIgnoradas.push(indice + 2) // +2 = compensa cabeçalho e index base 0
  })

  const total = produtosValidos.length
  const lotes = dividirEmLotes(produtosValidos, TAMANHO_LOTE)
  const departamentosEncontrados = new Set()

  let processados = 0
  onProgresso?.({ processados, total, restante: total, percentual: 0 })

  for (const lote of lotes) {
    const { error } = await supabase.from('produtos').upsert(lote, { onConflict: 'codigo' })
    if (error) {
      throw Object.assign(new Error(`Falha ao importar lote (${error.message}). ${processados} de ${total} já foram importados com sucesso — corrija e importe novamente, os já importados serão apenas atualizados.`), {
        processados,
        total,
      })
    }

    lote.forEach((p) => p.departamento && departamentosEncontrados.add(p.departamento))

    processados += lote.length
    const percentual = Math.round((processados / total) * 100)
    onProgresso?.({ processados, total, restante: total - processados, percentual })
  }

  // Mantém a tabela de departamentos sincronizada com o que veio na planilha.
  if (departamentosEncontrados.size) {
    const linhas = [...departamentosEncontrados].map((nome) => ({ nome }))
    await supabase.from('departamentos').upsert(linhas, { onConflict: 'nome' })
  }

  return { total, importados: processados, ignoradas: linhasIgnoradas }
}
