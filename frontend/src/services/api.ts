const API_URL = 'http://localhost:3000';

export async function fetchClientes() {
  const response = await fetch(`${API_URL}/clientes`);
  if (!response.ok) throw new Error('Erro ao buscar clientes');
  return response.json();
}

export async function createCliente(cliente: { nome: string; telefone: string }) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error('Erro ao criar cliente');
  return response.json();
}

export async function updateCliente(id: string, cliente: { nome: string; telefone: string }) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error('Erro ao atualizar cliente');
  return response.json();
}

export async function deleteCliente(id: string) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar cliente');
  return response.json();
}

export async function fetchCardapio() {
  const response = await fetch(`${API_URL}/cardapio`);
  if (!response.ok) throw new Error('Erro ao buscar cardápio');
  const data = await response.json();
  return data.map((item: any) => ({
    ...item,
    preco: parseFloat(item.preco)
  }));
}

export async function createItemCardapio(item: { nome: string; preco: number; unidade: string; categoria: string }) {
  const response = await fetch(`${API_URL}/cardapio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Erro ao criar item do cardápio');
  const newItem = await response.json();
  return {
    ...newItem,
    preco: parseFloat(newItem.preco)
  };
}

export async function updateItemCardapio(id: string, item: { nome: string; preco: number; unidade: string; categoria: string }) {
  const response = await fetch(`${API_URL}/cardapio/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Erro ao atualizar item do cardápio');
  const updatedItem = await response.json();
  return {
    ...updatedItem,
    preco: parseFloat(updatedItem.preco)
  };
}

export async function deleteItemCardapio(id: string) {
  const response = await fetch(`${API_URL}/cardapio/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar item do cardápio');
  return response.json();
}

export async function fetchPedidos() {
  const response = await fetch(`${API_URL}/pedidos`);
  if (!response.ok) throw new Error('Erro ao buscar pedidos');
  const data = await response.json();
  return data.map((pedido: any) => ({
    ...pedido,
    valor_adiantado: parseFloat(pedido.valor_adiantado),
    valor_total: parseFloat(pedido.valor_total),
    itens: pedido.itens.map((item: any) => ({
      ...item,
      quantidade: parseFloat(item.quantidade),
      valor_unitario: parseFloat(item.valor_unitario),
      valor_total: parseFloat(item.valor_total)
    }))
  }));
}

export async function createPedido(pedido: any) {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido),
  });
  if (!response.ok) throw new Error('Erro ao criar pedido');
  // A resposta de createPedido pode ser simples (ex: { id: ... }), mas se retornar o objeto completo, precisaria de conversão.
  // No server.js atual, ele retorna { id, message }, então não precisamos converter o retorno aqui para renderização imediata de dados complexos,
  // mas é boa prática manter a consistência se mudarmos o retorno.
  return response.json();
}

export async function updatePedido(id: string, dados: { 
  dataRetirada: string; 
  horaRetirada: string; 
  valorAdiantado: number; 
  valorTotal: number;
  itens: any[];
}) {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error('Erro ao atualizar pedido');
  return response.json();
}

export async function deletePedido(id: string) {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao deletar pedido');
  return response.json();
}
