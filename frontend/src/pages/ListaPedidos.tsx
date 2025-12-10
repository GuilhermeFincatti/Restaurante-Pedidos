import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, List, ClipboardList, Package, FileDown, Pencil, Trash2, X, Plus } from 'lucide-react';
import { fetchPedidos, updatePedido, deletePedido, fetchCardapio } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ItemCardapio {
  id: string;
  nome: string;
  preco: number;
  unidade: 'un' | 'kg';
  categoria: 'cozinha' | 'confeitaria';
}

interface PedidoItem {
  id: string;
  cardapio_id: string; 
  item_nome: string;
  quantidade: number;
  unidade?: string;
  categoria?: string;
  valor_total: number;
  valor_unitario: number;
}

interface Pedido {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  data_retirada: string;
  hora_retirada: string;
  valor_total: number;
  valor_adiantado: number;
  itens: PedidoItem[];
}

export function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cardapio, setCardapio] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'resumo'>('lista');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Edição
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [editDataRetirada, setEditDataRetirada] = useState('');
  const [editHoraRetirada, setEditHoraRetirada] = useState('');
  const [editValorAdiantado, setEditValorAdiantado] = useState(0);
  const [editItens, setEditItens] = useState<PedidoItem[]>([]);
  
  // Estado para adicionar item no modal
  const [newItemId, setNewItemId] = useState('');
  const [newItemQtd, setNewItemQtd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pedidosData, cardapioData] = await Promise.all([
        fetchPedidos(),
        fetchCardapio()
      ]);
      setPedidos(pedidosData);
      setCardapio(cardapioData);
    } catch (err) {
      setError('Falha ao carregar dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPedidos = async () => {
    try {
        const data = await fetchPedidos();
        setPedidos(data);
    } catch(err) {
        console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await deletePedido(id);
      loadPedidos();
    } catch (err) {
      alert('Erro ao excluir pedido');
      console.error(err);
    }
  };

  const startEdit = (pedido: Pedido) => {
    setEditingPedido(pedido);
    
    const dateObj = new Date(pedido.data_retirada);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    setEditDataRetirada(dateStr);
    setEditHoraRetirada(pedido.hora_retirada);
    setEditValorAdiantado(pedido.valor_adiantado);
    setEditItens([...pedido.itens]); 
  };

  const cancelEdit = () => {
    setEditingPedido(null);
    setEditItens([]);
    setNewItemId('');
    setNewItemQtd('');
  };

  const handleEditItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updatedItens = [...editItens];
    const item = updatedItens[index];
    
    updatedItens[index] = {
      ...item,
      quantidade: newQty,
      valor_total: item.valor_unitario * newQty
    };
    setEditItens(updatedItens);
  };

  const handleRemoveEditItem = (index: number) => {
    const updatedItens = [...editItens];
    updatedItens.splice(index, 1);
    setEditItens(updatedItens);
  };

  const handleAddEditItem = () => {
    if (!newItemId || !newItemQtd || parseFloat(newItemQtd) <= 0) {
      alert('Selecione um item e uma quantidade válida.');
      return;
    }
    const cardapioItem = cardapio.find(i => i.id === newItemId);
    if (!cardapioItem) return;

    const qty = parseFloat(newItemQtd);
    const newItem: PedidoItem = {
      id: `temp-${Date.now()}`, 
      cardapio_id: cardapioItem.id,
      item_nome: cardapioItem.nome,
      quantidade: qty,
      unidade: cardapioItem.unidade,
      categoria: cardapioItem.categoria,
      valor_unitario: cardapioItem.preco,
      valor_total: cardapioItem.preco * qty
    };

    setEditItens([...editItens, newItem]);
    setNewItemId('');
    setNewItemQtd('');
  };

  const calculateTotal = () => {
    return editItens.reduce((sum, item) => sum + item.valor_total, 0);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPedido) return;
    
    if (editItens.length === 0) {
        alert('O pedido deve ter pelo menos um item.');
        return;
    }

    try {
      const total = calculateTotal();
      
      const itensPayload = editItens.map(item => ({
          itemId: item.cardapio_id,
          quantidade: item.quantidade,
          valorUnitario: item.valor_unitario,
          valorTotal: item.valor_total
      }));

      await updatePedido(editingPedido.id, {
        dataRetirada: editDataRetirada,
        horaRetirada: editHoraRetirada,
        valorAdiantado: editValorAdiantado,
        valorTotal: total,
        itens: itensPayload
      });
      setEditingPedido(null);
      loadPedidos();
    } catch (err) {
      alert('Erro ao atualizar pedido');
      console.error(err);
    }
  };

  const filteredPedidos = pedidos.filter(pedido => 
    pedido.cliente_nome.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const resumoProducao = pedidos.reduce((acc, pedido) => {
    pedido.itens.forEach(item => {
      const key = `${item.item_nome}-${item.unidade}`; 
      
      if (!acc[key]) {
        acc[key] = {
          nome: item.item_nome,
          quantidade: 0,
          unidade: item.unidade || 'un',
          categoria: item.categoria || 'cozinha'
        };
      }
      acc[key].quantidade += item.quantidade;
    });
    return acc;
  }, {} as Record<string, { nome: string; quantidade: number; unidade: string; categoria: string }>);

  const listaResumo = Object.values(resumoProducao).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  const cozinhaItems = listaResumo.filter(item => item.categoria === 'cozinha');
  const confeitariaItems = listaResumo.filter(item => item.categoria === 'confeitaria');

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');

    if (viewMode === 'resumo') {
      doc.text(`Resumo de Produção - ${today}`, 14, 15);
      
      let finalY = 20;

      if (cozinhaItems.length > 0) {
          doc.setFontSize(12);
          doc.text('Cozinha', 14, finalY + 5);
          finalY += 8;

          autoTable(doc, {
            head: [['Item', 'Quantidade Total']],
            body: cozinhaItems.map(i => [i.nome, `${i.quantidade} ${i.unidade}`]),
            startY: finalY,
            theme: 'striped'
          });
          
          finalY = (doc as any).lastAutoTable.finalY + 10;
      }

      if (confeitariaItems.length > 0) {
          doc.setFontSize(12);
          doc.text('Confeitaria', 14, finalY + 5);
          finalY += 8;

          autoTable(doc, {
            head: [['Item', 'Quantidade Total']],
            body: confeitariaItems.map(i => [i.nome, `${i.quantidade} ${i.unidade}`]),
            startY: finalY,
            theme: 'striped'
          });
      }

      doc.save(`resumo_producao_${today.replaceAll('/', '-')}.pdf`);
    } else {
      doc.text(`Lista de Pedidos - ${today}`, 14, 15);

      const tableData: any[] = [];

      // Calculate totals
      const totalValorGeral = filteredPedidos.reduce((acc, p) => acc + p.valor_total, 0);
      const totalAdiantadoGeral = filteredPedidos.reduce((acc, p) => acc + p.valor_adiantado, 0);
      const totalRestanteGeral = totalValorGeral - totalAdiantadoGeral;

      filteredPedidos.forEach((pedido, index) => {
        const totalItems = pedido.itens.length;
        const saldo = pedido.valor_total - pedido.valor_adiantado;
        const statusPagamento = saldo <= 0 ? 'Pago' : `Falta R$ ${saldo.toFixed(2)}`;
        const financeiroText = `Total: R$ ${pedido.valor_total.toFixed(2)}
${statusPagamento}`;
        const retiradaText = `${formatDate(pedido.data_retirada)} às ${pedido.hora_retirada}`;
        
        const rowFillColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
        const baseStyle = { valign: 'middle', fillColor: rowFillColor };

        const telefone = pedido.cliente_telefone || '-';

        if (totalItems === 0) {
            tableData.push([
                { content: pedido.cliente_nome, styles: baseStyle },
                { content: telefone, styles: baseStyle },
                { content: '-', styles: baseStyle },
                { content: '-', styles: baseStyle },
                { content: retiradaText, styles: baseStyle },
                { content: financeiroText, styles: baseStyle }
            ]);
        } else {
            pedido.itens.forEach((item, i) => {
                const itemQtd = `${item.quantidade} ${item.unidade || ''}`;
                const itemStyle = { fillColor: rowFillColor };
                
                if (i === 0) {
                    tableData.push([
                        { content: pedido.cliente_nome, rowSpan: totalItems, styles: baseStyle },
                        { content: telefone, rowSpan: totalItems, styles: baseStyle },
                        { content: item.item_nome, styles: itemStyle },
                        { content: itemQtd, styles: { ...itemStyle, halign: 'right' } },
                        { content: retiradaText, rowSpan: totalItems, styles: baseStyle },
                        { content: financeiroText, rowSpan: totalItems, styles: baseStyle }
                    ]);
                } else {
                    tableData.push([
                        { content: item.item_nome, styles: itemStyle },
                        { content: itemQtd, styles: { ...itemStyle, halign: 'right' } }
                    ]);
                }
            });
        }
      });

      autoTable(doc, {
        head: [['Cliente', 'Telefone', 'Item', 'Qtd', 'Retirada', 'Financeiro']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
        columnStyles: { 
            0: { cellWidth: 35 },
            1: { cellWidth: 25 },
            2: { cellWidth: 40 },
            3: { cellWidth: 20 },
            5: { cellWidth: 30 }
        },
        theme: 'grid'
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text('Resumo Financeiro', 14, finalY);
      
      autoTable(doc, {
        head: [['Total Geral', 'Total Adiantado', 'Total a Receber']],
        body: [[
            `R$ ${totalValorGeral.toFixed(2)}`,
            `R$ ${totalAdiantadoGeral.toFixed(2)}`,
            `R$ ${totalRestanteGeral.toFixed(2)}`
        ]],
        startY: finalY + 2,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [41, 128, 185] }
      });

      doc.save(`lista_pedidos_${today.replaceAll('/', '-')}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
      {editingPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Editar Pedido</h3>
              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Retirada</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm"
                    value={editDataRetirada}
                    onChange={(e) => setEditDataRetirada(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Retirada</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm"
                    value={editHoraRetirada}
                    onChange={(e) => setEditHoraRetirada(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor Adiantado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm"
                  value={editValorAdiantado}
                  onChange={(e) => setEditValorAdiantado(parseFloat(e.target.value))}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Itens do Pedido</h4>
                
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {editItens.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                            <div className="flex-1">
                                <span className="font-medium text-slate-700">{item.item_nome}</span>
                                <div className="text-xs text-slate-400">{item.unidade}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    className="w-16 p-1 border border-slate-200 rounded text-center"
                                    value={item.quantidade}
                                    onChange={(e) => handleEditItemQuantity(index, parseFloat(e.target.value))}
                                    step="any"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveEditItem(index)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Adicionar Item</label>
                        <select 
                            className="w-full p-2 border border-slate-200 rounded text-sm"
                            value={newItemId}
                            onChange={(e) => setNewItemId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {cardapio.map(item => (
                                <option key={item.id} value={item.id}>{item.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-20">
                         <label className="block text-xs text-slate-500 mb-1">Qtd</label>
                         <input 
                            type="number" 
                            className="w-full p-2 border border-slate-200 rounded text-sm"
                            placeholder="0"
                            step="any"
                            value={newItemQtd}
                            onChange={(e) => setNewItemQtd(e.target.value)}
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={handleAddEditItem}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-4 text-right">
                    <span className="text-sm text-slate-500 mr-2">Novo Total Estimado:</span>
                    <span className="font-bold text-slate-800">R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
            <Link to="/pedidos" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Novo Pedido
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Visualizar Pedidos</h1>
                <p className="text-slate-500 mt-1">Acompanhe a produção e o histórico de encomendas.</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar PDF
                </button>

                <div className="flex p-1 bg-white border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setViewMode('lista')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${ viewMode === 'lista' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Lista Completa
                  </button>
                  <button
                    onClick={() => setViewMode('resumo')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${ viewMode === 'resumo' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Resumo de Produção
                  </button>
                </div>
              </div>
            </div>
        </div>

        {viewMode === 'lista' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
               <Search className="w-5 h-5 text-slate-400 mr-3" />
               <input 
                  type="text" 
                  placeholder="Filtrar por nome do cliente..." 
                  className="flex-1 outline-none text-slate-700 placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {loading && <p className="text-center text-slate-500 py-8">Carregando pedidos...</p>}
            {error && <p className="text-center text-red-500 py-8">{error}</p>}
            
            {!loading && filteredPedidos.length === 0 && (
              <p className="text-center text-slate-500 py-8 italic">Nenhum pedido encontrado.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPedidos.map((pedido) => (
                <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg">{pedido.cliente_nome}</h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEdit(pedido)}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-white transition-colors"
                          title="Editar Pedido"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pedido.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-white transition-colors"
                          title="Excluir Pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                       <p>Retirada: <span className="font-medium text-slate-700">{formatDate(pedido.data_retirada)} às {pedido.hora_retirada}</span></p>
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Itens do Pedido</p>
                    <ul className="space-y-2">
                      {pedido.itens.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-700 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                            {item.item_nome}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {item.quantidade} <span className="text-xs text-slate-400">{item.unidade}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
                     <span className="text-slate-500">Total: <span className="font-bold text-slate-800">R$ {pedido.valor_total.toFixed(2)}</span></span>
                     <span className={`font-medium ${pedido.valor_total - pedido.valor_adiantado <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {pedido.valor_total - pedido.valor_adiantado <= 0 ? 'Pago' : `Falta R$ ${(pedido.valor_total - pedido.valor_adiantado).toFixed(2)}`}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'resumo' && (
           <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Cozinha */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Produção: Cozinha
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-800 font-medium">
                      <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4 text-right">Qtd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cozinhaItems.length === 0 && (
                         <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Nenhum item de cozinha.</td></tr>
                      )}
                      {cozinhaItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.nome}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                            {item.quantidade} <span className="text-base text-slate-500">{item.unidade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confeitaria */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-pink-500" />
                    Produção: Confeitaria
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-800 font-medium">
                      <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4 text-right">Qtd</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {confeitariaItems.length === 0 && (
                         <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Nenhum item de confeitaria.</td></tr>
                      )}
                      {confeitariaItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.nome}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                            {item.quantidade} <span className="text-base text-slate-500">{item.unidade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

           </div>
        )}
      </div>
    </div>
  );
}
