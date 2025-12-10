const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Clientes
app.get('/clientes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/clientes', async (req, res) => {
  const { nome, telefone } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING *',
      [nome, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telefone } = req.body;
  try {
    const result = await db.query(
      'UPDATE clientes SET nome = $1, telefone = $2 WHERE id = $3 RETURNING *',
      [nome, telefone, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Cardapio
app.get('/cardapio', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cardapio ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/cardapio', async (req, res) => {
  const { nome, preco, unidade, categoria } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO cardapio (nome, preco, unidade, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, preco, unidade, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/cardapio/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, preco, unidade, categoria } = req.body;
  try {
    const result = await db.query(
      'UPDATE cardapio SET nome = $1, preco = $2, unidade = $3, categoria = $4 WHERE id = $5 RETURNING *',
      [nome, preco, unidade, categoria, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/cardapio/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM cardapio WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'Item removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM pedidos p 
      JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.data_retirada DESC
    `);
    
    const orders = result.rows;
    for (let order of orders) {
      const itemsRes = await db.query(`
        SELECT ip.*, m.nome as item_nome, m.unidade, m.categoria 
        FROM itens_pedido ip 
        JOIN cardapio m ON ip.cardapio_id = m.id 
        WHERE ip.pedido_id = $1
      `, [order.id]);
      order.itens = itemsRes.rows;
    }
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/pedidos', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { clienteId, dataRetirada, horaRetirada, valorAdiantado, valorTotal, itens } = req.body;

    const pedidoRes = await client.query(
      `INSERT INTO pedidos (cliente_id, data_retirada, hora_retirada, valor_adiantado, valor_total) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [clienteId, dataRetirada, horaRetirada, valorAdiantado, valorTotal]
    );
    const pedidoId = pedidoRes.rows[0].id;

    for (const item of itens) {
      // item: { itemId, quantidade, valorTotal, valorUnitario (optional) }
      // If valorUnitario is missing, we calculate it or just trust the frontend?
      // Better to trust frontend 'preco' snapshot if available, or fetch it.
      // For simplicity here, assuming frontend sends it or we derive it.
      const valorUnitario = item.valorUnitario || (item.valorTotal / item.quantidade);

      await client.query(
        `INSERT INTO itens_pedido (pedido_id, cardapio_id, quantidade, valor_unitario, valor_total) 
         VALUES ($1, $2, $3, $4, $5)`,
        [pedidoId, item.itemId, item.quantidade, valorUnitario, item.valorTotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: pedidoId, message: 'Pedido criado com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/pedidos/:id', async (req, res) => {
  const client = await db.pool.connect();
  const { id } = req.params;
  const { dataRetirada, horaRetirada, valorAdiantado, valorTotal, itens } = req.body;

  try {
    await client.query('BEGIN');

    // Atualiza dados do pedido
    const updateQuery = `
       UPDATE pedidos 
       SET data_retirada = $1, hora_retirada = $2, valor_adiantado = $3, valor_total = $4
       WHERE id = $5 RETURNING *
    `;
    const result = await client.query(updateQuery, [dataRetirada, horaRetirada, valorAdiantado, valorTotal, id]);
    
    if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Se itens foram fornecidos, substitui os existentes
    if (itens && Array.isArray(itens)) {
        // Remove itens antigos
        await client.query('DELETE FROM itens_pedido WHERE pedido_id = $1', [id]);
        
        // Insere novos itens
        for (const item of itens) {
             await client.query(
                `INSERT INTO itens_pedido (pedido_id, cardapio_id, quantidade, valor_unitario, valor_total) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, item.itemId, item.quantidade, item.valorUnitario, item.valorTotal]
              );
        }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
