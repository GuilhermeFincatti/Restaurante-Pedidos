import { ArrowLeft, Plus, Trash2, Search, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente } from '../services/api';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

export function Clientes() {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadClientes();
  }, [currentPage]);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchClientes(currentPage);
      setClientes(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError('Falha ao carregar clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
  };

  const handleCancelEdit = () => {
    setEditingCliente(null);
    setNome('');
    setTelefone('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await deleteCliente(id);
      loadClientes();
    } catch (err) {
      alert('Erro ao excluir cliente, verifique se o cliente tem um pedido registrado antes de excluir.');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, { nome, telefone });
      } else {
        await createCliente({ nome, telefone });
      }
      setEditingCliente(null);
      setNome('');
      setTelefone('');
      loadClientes();
    } catch (err) {
      setError('Falha ao salvar cliente.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">Gerenciar Clientes</h1>
            <p className="text-slate-500 mt-1">Cadastre e visualize seus clientes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  {editingCliente ? (
                    <Pencil className="w-5 h-5 mr-2 text-orange-500" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  )}
                  {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                </div>
                {editingCliente && (
                  <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    id="nome"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    id="telefone"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    maxLength={15}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    editingCliente
                      ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {editingCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Clientes Cadastrados</h2>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-48 transition-all"
                    />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 font-medium">
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">Telefone</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-slate-500">Carregando clientes...</td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-red-500">{error}</td>
                      </tr>
                    )}
                    {!loading && clientes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-slate-500">Nenhum cliente cadastrado.</td>
                      </tr>
                    )}
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{cliente.nome}</td>
                        <td className="px-6 py-4">{cliente.telefone}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleEdit(cliente)}
                            className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cliente.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Mostrando {clientes.length} de {totalItems} clientes.
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}