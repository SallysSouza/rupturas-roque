import {
  LayoutDashboard,
  PackageSearch,
  ClipboardList,
  History,
  Boxes,
  FolderTree,
  Tags,
  BarChart3,
  Settings,
  UserCircle,
  FileSpreadsheet,
  PackagePlus,
  PackageX,
} from 'lucide-react'
import { PERFIS } from '../contexts/AuthContext.jsx'

/**
 * Estrutura do menu lateral, por perfil (escopo #6 da atualização).
 * Cada perfil enxerga só os itens permitidos.
 */
export const MENU = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    perfis: [PERFIS.VENDEDOR, PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    to: '/registrar-ruptura',
    label: 'Registrar Ruptura',
    icon: PackagePlus,
    perfis: [PERFIS.VENDEDOR],
  },
  {
    to: '/historico',
    label: 'Histórico',
    icon: History,
    perfis: [PERFIS.VENDEDOR],
  },
  {
    to: '/rupturas',
    label: 'Rupturas',
    icon: ClipboardList,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    label: 'Produtos',
    icon: Boxes,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
    submenu: [
      { to: '/produtos/gestao', label: 'Gestão do Cadastro', icon: Boxes },
      { to: '/produtos/cadastro', label: 'Cadastro Manual', icon: PackagePlus },
      { to: '/produtos/importar', label: 'Importação por Planilha', icon: FileSpreadsheet },
      { to: '/produtos/sem-cadastro', label: 'Produtos sem Cadastro', icon: PackageX, badgeKey: 'semCadastro' },
    ],
  },
  {
    to: '/departamentos',
    label: 'Departamentos',
    icon: FolderTree,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    to: '/subcategorias',
    label: 'Subcategorias',
    icon: Tags,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    to: '/relatorios',
    label: 'Relatórios',
    icon: BarChart3,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    to: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
    perfis: [PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
  {
    to: '/minha-conta',
    label: 'Minha Conta',
    icon: UserCircle,
    perfis: [PERFIS.VENDEDOR, PERFIS.COMPRADOR, PERFIS.ADMIN],
  },
]

export const ICONS = { PackageSearch }
