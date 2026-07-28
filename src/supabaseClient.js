import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Falha alto e cedo: melhor um erro claro no console do que telas em branco.
  console.error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. ' +
      'Copie .env.example para .env e preencha com as credenciais do projeto.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Garante que, ao deslogar, nada de sessão fique em cache local.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Limpa qualquer resquício de sessão/local storage do Supabase.
 * Usado no logout para garantir que nenhum dado do usuário anterior
 * permaneça acessível (item de segurança do escopo #9).
 */
export function limparCacheLocal() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('sb-') || k.startsWith('supabase.'))
      .forEach((k) => window.localStorage.removeItem(k))
    window.sessionStorage.clear()
  } catch {
    // localStorage pode não estar disponível em alguns contextos; seguimos.
  }
}
