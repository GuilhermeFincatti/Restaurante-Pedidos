CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS cardapio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    unidade VARCHAR(10) CHECK (unidade IN ('un', 'kg')) NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('cozinha', 'confeitaria')) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    data_retirada DATE NOT NULL,
    hora_retirada VARCHAR(10) NOT NULL,
    valor_adiantado DECIMAL(10, 2) DEFAULT 0,
    valor_total DECIMAL(10, 2) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_retirada DATE,
    hora_retirada TIME,
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    cardapio_id UUID REFERENCES cardapio(id),
    quantidade DECIMAL(10, 3) NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL
);
