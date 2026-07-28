import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, limparCacheLocal } from '../supabaseClient'

const AuthContext = createContext(null)

// Perfis conhecidos do sistema. "vendedor" só enxerga a pesquisa/registro de
// ruptura; "comprador" e "admin" têm acesso ao módulo de produtos e gestão.
export const PERFIS = {
  VENDEDOR: 'vendedor',
  COMPRADOR: 'comprador',
  ADMIN: 'admin',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = carregando
  const [perfil, setPerfil] = useState(null)
  const navigate = useNavigate()

  const carregarPerfil = useCallback(async (user) => {
    if (!user) {
      setPerfil(null)
      return
    }
    // O perfil (role) fica nos metadados do usuário no Supabase Auth.
    // Ajuste aqui caso vocês guardem o perfil em uma tabela separada (ex: "usuarios").
    const role = user.user_metadata?.role || PERFIS.VENDEDOR
    setPerfil({
      id: user.id,
      nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      role,
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      carregarPerfil(session?.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      carregarPerfil(session?.user)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [carregarPerfil])

  const login = useCallback(async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
    return data
  }, [])

  /**
   * Logout seguro (escopo #8/#9):
   * - encerra a sessão no Supabase
   * - limpa qualquer cache local do usuário anterior
   * - zera o estado em memória (perfil/sessão)
   * - redireciona para o login substituindo a entrada no histórico,
   *   para que o botão "Voltar" do navegador não reabra uma tela protegida
   *   (o ProtectedRoute também revalida a sessão a cada navegação).
   */
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    limparCacheLocal()
    setSession(null)
    setPerfil(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const alterarSenha = useCallback(async (novaSenha) => {
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) throw error
  }, [])

  const value = {
    session,
    perfil,
    carregando: session === undefined,
    autenticado: !!session,
    login,
    logout,
    alterarSenha,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
