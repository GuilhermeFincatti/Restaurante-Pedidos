import React, { useState, useEffect } from 'react'; // Added useEffect
import { ArrowLeft, Calendar, Clock, Plus, DollarSign, ShoppingCart, User, CheckCircle, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchClientes, fetchCardapio, createPedido } from '../services/api'; // New imports

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

interface ItemCardapio {
  id: string;
  nome: string;
  unidade: 'un' | 'kg';
  preco: number;
  categoria: 'salgados' | 'doces'; // Added categoria
}

interface PedidoItem {
  item: ItemCardapio;
  quantidade: number;
  valorTotal: number;
  valorUnitario: number; // Added for backend
}

export function Pedidos() {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [dataPedido, setDataPedido] = useState(new Date().toISOString().split('T')[0]);
  const [dataRetirada, setDataRetirada] = useState('');
  const [horaRetirada, setHoraRetirada] = useState('');
  const [itensPedido, setItensPedido] = useState<PedidoItem[]>([]);
  const [valorAdiantado, setValorAdiantado] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedClientes = await fetchClientes(1, 1000);
        setClientes(fetchedClientes.data);
        const fetchedCardapio = await fetchCardapio(1, 1000);
        setCardapio(fetchedCardapio.data);
      } catch (err) {
        setError('Falha ao carregar dados iniciais.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      itemId: { value: string };
      quantidade: { value: string };
    };

    const itemId = target.itemId.value;
    const quantidade = parseFloat(target.quantidade.value);

    if (!itemId || isNaN(quantidade) || quantidade <= 0) {
      alert('Selecione um item e insira uma quantidade válida.');
      return;
    }

    const item = cardapio.find(i => i.id === itemId); // Use fetched cardapio
    if (item) {
      const valorTotalItem = item.preco * quantidade;
      setItensPedido([...itensPedido, { item, quantidade, valorTotal: valorTotalItem, valorUnitario: item.preco }]);
    }
  };

  const calcularTotalPedido = () => {
    return itensPedido.reduce((sum, currentItem) => sum + currentItem.valorTotal, 0);
  };

  const totalPedido = calcularTotalPedido();
  const valorFaltaPagar = totalPedido - valorAdiantado;

  const handleFinalizarPedido = async () => {
    if (!clienteSelecionado) {
      alert('Por favor, selecione um cliente.');
      return;
    }
    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um item ao pedido.');
      return;
    }
    if (!dataRetirada || !horaRetirada) {
      alert('Informe a data e hora de retirada.');
      return;
    }

    setError(null);
    try {
      const pedidoData = {
        clienteId: clienteSelecionado.id,
        dataRetirada,
        horaRetirada,
        valorAdiantado,
        valorTotal: totalPedido,
        itens: itensPedido.map(item => ({
          itemId: item.item.id,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal,
        })),
      };
      await createPedido(pedidoData);
      alert('Pedido finalizado com sucesso!');
      // Reset form
      setClienteSelecionado(null);
      setDataRetirada('');
      setHoraRetirada('');
      setItensPedido([]);
      setValorAdiantado(0);
      setDataPedido(new Date().toISOString().split('T')[0]); // Reset dataPedido
    } catch (err) {
      setError('Falha ao finalizar pedido.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Home
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Novo Pedido</h1>
                <p className="text-slate-500 mt-1">Registre os detalhes do pedido e itens solicitados.</p>
            </div>
            <Link 
              to="/pedidos/lista" 
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm font-medium"
            >
              <List className="w-4 h-4 mr-2" />
              Visualizar Pedidos
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Info Cliente e Data */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Informações Gerais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                            <select
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                onChange={(e) => setClienteSelecionado(clientes.find(c => c.id === e.target.value) || null)}
                                value={clienteSelecionado?.id || ''}
                            >
                                <option value="">Selecione um cliente...</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>{cliente.nome} ({cliente.telefone})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Data do Pedido</span>
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={dataPedido}
                                onChange={(e) => setDataPedido(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:block"></div> {/* Spacer */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Data Retirada</span>
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={dataRetirada}
                                onChange={(e) => setDataRetirada(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Hora Retirada</span>
                            </label>
                            <input
                                type="time"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={horaRetirada}
                                onChange={(e) => setHoraRetirada(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Adicionar Itens */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                     <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                        Itens do Pedido
                    </h2>
                    <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-grow">
                            <select
                                name="itemId"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="">Selecione um item...</option>
                                {cardapio.map(item => ( // Use fetched cardapio
                                    <option key={item.id} value={item.id}>
                                        {item.nome} ({item.unidade === 'un' ? 'Unidade' : 'Kilograma'}) - R$ {item.preco.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-24">
                            <input
                                type="number"
                                name="quantidade"
                                step="any"
                                placeholder="Qtd"
                                className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            <Plus className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Adicionar</span>
                        </button>
                    </form>

                    {itensPedido.length > 0 ? (
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 font-medium text-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3 text-center">Qtd</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {itensPedido.map((pi, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">{pi.item.nome}</td>
                                            <td className="px-4 py-3 text-center">{pi.quantidade} <span className="text-xs text-slate-400">{pi.item.unidade}</span></td>
                                            <td className="px-4 py-3 text-right font-medium">R$ {pi.valorTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8 text-sm italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            Nenhum item adicionado ao pedido ainda.
                        </p>
                    )}
                </div>
            </div>

            {/* Resumo Financeiro (Lateral) */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
                     <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Pagamento
                    </h2>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="text-xl font-bold text-slate-800">R$ {totalPedido.toFixed(2)}</span>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                                Valor Adiantado (Sinal)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all"
                                    value={valorAdiantado}
                                    onChange={(e) => setValorAdiantado(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <span className="text-slate-800 font-medium">Restante</span>
                            <span className={`text-xl font-bold ${valorFaltaPagar > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                R$ {valorFaltaPagar.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {loading && <p className="text-center text-slate-500 mb-4">Carregando dados...</p>}
                    {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                    
                    <button
                        type="button"
                        onClick={handleFinalizarPedido}
                        className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg shadow-blue-200 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 font-medium"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Finalizar Pedido
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}