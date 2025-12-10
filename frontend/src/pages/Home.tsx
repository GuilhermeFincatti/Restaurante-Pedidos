import { Link } from 'react-router-dom';
import { Users, UtensilsCrossed, ClipboardList, ChefHat } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-600 rounded-full shadow-lg">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">La Vecchi Restaurante</h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Gerencie seu estabelecimento de forma simples e eficiente. Selecione uma opção abaixo para começar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <Link 
          to="/clientes" 
          className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Clientes</h2>
          <p className="text-slate-500 text-sm">Gerencie sua base de clientes e informações de contato.</p>
        </Link>

        <Link 
          to="/cardapio" 
          className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Cardápio</h2>
          <p className="text-slate-500 text-sm">Adicione e edite pratos, bebidas e preços do menu.</p>
        </Link>

        <Link 
          to="/pedidos" 
          className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pedidos</h2>
          <p className="text-slate-500 text-sm">Registre e acompanhe os pedidos em andamento.</p>
        </Link>
      </div>
      
      <footer className="mt-16 text-slate-400 text-sm">
        &copy; 2025 Sistema de Gerenciamento
      </footer>
    </div>
  );
}