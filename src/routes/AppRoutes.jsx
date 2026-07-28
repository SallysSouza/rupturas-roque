import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import { PERFIS } from '../contexts/AuthContext.jsx'

import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import RegistrarRuptura from '../pages/RegistrarRuptura.jsx'
import Historico from '../pages/Historico.jsx'
import Rupturas from '../pages/Rupturas.jsx'
import Departamentos from '../pages/Departamentos.jsx'
import Subcategorias from '../pages/Subcategorias.jsx'
import Relatorios from '../pages/Relatorios.jsx'
import Configuracoes from '../pages/Configuracoes.jsx'
import MinhaConta from '../pages/MinhaConta.jsx'
import CadastroManual from '../pages/produtos/CadastroManual.jsx'
import Importar from '../pages/produtos/Importar.jsx'
import SemCadastro from '../pages/produtos/SemCadastro.jsx'
import Gestao from '../pages/produtos/Gestao.jsx'

const COMPRADOR_ADMIN = [PERFIS.COMPRADOR, PERFIS.ADMIN]

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/minha-conta" element={<ProtectedRoute><MinhaConta /></ProtectedRoute>} />

      {/* Perfil Vendedor */}
      <Route
        path="/registrar-ruptura"
        element={
          <ProtectedRoute perfisPermitidos={[PERFIS.VENDEDOR]}>
            <RegistrarRuptura />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historico"
        element={
          <ProtectedRoute perfisPermitidos={[PERFIS.VENDEDOR]}>
            <Historico />
          </ProtectedRoute>
        }
      />

      {/* Perfil Comprador / Admin */}
      <Route path="/rupturas" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Rupturas /></ProtectedRoute>} />
      <Route path="/produtos/gestao" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Gestao /></ProtectedRoute>} />
      <Route path="/produtos/cadastro" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><CadastroManual /></ProtectedRoute>} />
      <Route path="/produtos/importar" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Importar /></ProtectedRoute>} />
      <Route path="/produtos/sem-cadastro" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><SemCadastro /></ProtectedRoute>} />
      <Route path="/departamentos" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Departamentos /></ProtectedRoute>} />
      <Route path="/subcategorias" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Subcategorias /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Relatorios /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute perfisPermitidos={COMPRADOR_ADMIN}><Configuracoes /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
