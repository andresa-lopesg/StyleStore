import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Usuarios from './pages/Usuarios';
import Funcionarios from './pages/Funcionarios';
import Categorias from './pages/Categorias';
import Produtos from './pages/Produtos';
import Pedidos from './pages/Pedidos';
import Producao from './pages/Producao';
import Estoque from './pages/Estoque';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/producao" element={<Producao />} />
            <Route path="/estoque" element={<Estoque />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
