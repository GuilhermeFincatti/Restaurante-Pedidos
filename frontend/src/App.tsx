import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Clientes } from './pages/Clientes';
import { Cardapio } from './pages/Cardapio';
import { Pedidos } from './pages/Pedidos';
import { ListaPedidos } from './pages/ListaPedidos';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/lista" element={<ListaPedidos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;