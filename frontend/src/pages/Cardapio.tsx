import { ArrowLeft, Plus, Trash2, Utensils, Cake, Pencil, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchCardapio, createItemCardapio, updateItemCardapio, deleteItemCardapio } from '../services/api';

interface ItemCardapio {
  id: string;
  nome: string;
  preco: number;
  unidade: 'un' | 'kg';
  categoria: 'cozinha' | 'confeitaria';
}

export function Cardapio() {

  const [itensCardapio, setItensCardapio] = useState<ItemCardapio[]>([]);
  const [itemNome, setItemNome] = useState('');
  const [unidade, setUnidade] = useState<'un' | 'kg'>('un');
  const [preco, setPreco] = useState<number>(0);
  const [displayPreco, setDisplayPreco] = useState('R$ 0,00');
  const [categoria, setCategoria] = useState<'cozinha' | 'confeitaria'>('cozinha');
  const [editingItem, setEditingItem] = useState<ItemCardapio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCardapio();
  }, []);

  const loadCardapio = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCardapio();
      setItensCardapio(data);
    } catch (err) {
      setError('Falha ao carregar cardápio.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, '');
    
    const numericValue = parseFloat(value) / 100;
    setPreco(numericValue);
    setDisplayPreco(formatCurrency(numericValue));
  };

  const handleEdit = (item: ItemCardapio) => {
    setEditingItem(item);
    setItemNome(item.nome);
    setUnidade(item.unidade);
    setPreco(item.preco);
    setDisplayPreco(formatCurrency(item.preco));
    setCategoria(item.categoria);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setItemNome('');
    setUnidade('un');
    setPreco(0);
    setDisplayPreco('R$ 0,00');
    setCategoria('cozinha');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await deleteItemCardapio(id);
      loadCardapio();
    } catch (err) {
      alert('Erro ao excluir item');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingItem) {
        await updateItemCardapio(editingItem.id, { nome: itemNome, preco, unidade, categoria });
      } else {
        await createItemCardapio({ nome: itemNome, preco, unidade, categoria });
      }
      handleCancelEdit(); // Resets form
      loadCardapio();
    } catch (err) {
      setError('Falha ao salvar item no cardápio.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">Cardápio</h1>
            <p className="text-slate-500 mt-1">Gerencie os itens da cozinha e confeitaria.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  {editingItem ? (
                    <Pencil className="w-5 h-5 mr-2 text-orange-500" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  )}
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </div>
                {editingItem && (
                  <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="itemNome" className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
                  <input
                    type="text"
                    id="itemNome"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: Bolo de Chocolate"
                    value={itemNome}
                    onChange={(e) => setItemNome(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="unidade" className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                    <select
                        id="unidade"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        value={unidade}
                        onChange={(e) => setUnidade(e.target.value as 'un' | 'kg')}
                    >
                        <option value="un">Unidade (un)</option>
                        <option value="kg">Kilograma (kg)</option>
                    </select>
                    </div>
                    <div>
                    <label htmlFor="preco" className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                    <input
                        type="text"
                        id="preco"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        placeholder="R$ 0,00"
                        value={displayPreco}
                        onChange={handlePrecoChange}
                        required
                    />
                    </div>
                </div>
                <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                    <select
                        id="categoria"
                        className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value as 'cozinha' | 'confeitaria')}
                    >
                        <option value="cozinha">Cozinha</option>
                        <option value="confeitaria">Confeitaria</option>
                    </select>
                </div>
                <button
                  type="submit"
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    editingItem
                      ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {editingItem ? 'Salvar Alterações' : 'Adicionar ao Menu'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2 space-y-6">
            {loading && <p className="text-center text-slate-500">Carregando cardápio...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && (
              <>
                {/* Categoria Cozinha */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center">
                        <Utensils className="w-4 h-4 mr-2 text-blue-600" />
                        <h3 className="font-bold text-slate-800">Cozinha</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {itensCardapio
                        .filter(item => item.categoria === 'cozinha')
                        .map(item => (
                          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                              <div>
                                  <p className="font-medium text-slate-900">{item.nome}</p>
                                  <p className="text-xs text-slate-500">{item.unidade === 'un' ? 'Unidade' : 'Kilograma'}</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                  <span className="font-bold text-slate-700">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEdit(item)}
                                      className="text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {itensCardapio.filter(item => item.categoria === 'cozinha').length === 0 && (
                         <div className="p-4 text-center text-slate-500">Nenhum item na categoria Cozinha.</div>
                      )}
                    </div>
                </div>

                {/* Categoria Confeitaria */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center">
                        <Cake className="w-4 h-4 mr-2 text-pink-500" />
                        <h3 className="font-bold text-slate-800">Confeitaria</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {itensCardapio
                        .filter(item => item.categoria === 'confeitaria')
                        .map(item => (
                          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                              <div>
                                  <p className="font-medium text-slate-900">{item.nome}</p>
                                  <p className="text-xs text-slate-500">{item.unidade === 'un' ? 'Unidade' : 'Kilograma'}</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                  <span className="font-bold text-slate-700">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => handleEdit(item)}
                                      className="text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {itensCardapio.filter(item => item.categoria === 'confeitaria').length === 0 && (
                         <div className="p-4 text-center text-slate-500">Nenhum item na categoria Confeitaria.</div>
                      )}
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}