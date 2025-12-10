# Restaurante Pedidos

Sistema de gerenciamento de pedidos para restaurante, focado em produção de salgados e doces. Permite o cadastro de clientes, gerenciamento de cardápio, criação e acompanhamento de pedidos, com funcionalidades de relatórios e exportação para PDF.

## Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

*   **`backend/`**: API RESTful construída com Node.js, Express e PostgreSQL.
*   **`frontend/`**: Interface do usuário construída com React, TypeScript e Vite.

## Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina:

*   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
*   [PostgreSQL](https://www.postgresql.org/) (Banco de dados)
*   [Git](https://git-scm.com/)

## Instalação e Execução

Siga os passos abaixo para configurar e rodar a aplicação.

### 1. Configuração do Backend

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    *   Crie um arquivo `.env` na raiz da pasta `backend`.
    *   Adicione a string de conexão com o seu banco de dados PostgreSQL. Exemplo:
        ```env
        DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
        PORT=3000
        ```
    *   *Certifique-se de criar o banco de dados no PostgreSQL antes de prosseguir.*

4.  Inicialize o banco de dados (tabelas e esquema):
    ```bash
    npm run init-db
    ```

5.  Inicie o servidor:
    ```bash
    npm start
    ```
    O backend estará rodando em `http://localhost:3000`.

### 2. Configuração do Frontend

1.  Abra um novo terminal e navegue até a pasta do frontend:
    ```bash
    cd frontend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  (Opcional) Verifique a configuração da API:
    *   Por padrão, o frontend espera que o backend esteja em `http://localhost:3000`. Se você mudou a porta do backend, ajuste a URL base em `frontend/src/services/api.ts` ou via variável de ambiente `VITE_API_URL`.

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    O frontend estará acessível geralmente em `http://localhost:5173`.

## Funcionalidades Principais

*   **Cardápio:** Cadastro de itens com categorias (Salgados/Doces), preço e unidade.
*   **Clientes:** Cadastro simples de clientes.
*   **Pedidos:** Criação de pedidos com cálculo automático de valores, sinal (adiantamento) e data de retirada.
*   **Lista de Pedidos:**
    *   Filtragem por nome de cliente e intervalo de datas de retirada.
    *   Visualização detalhada e edição de pedidos.
    *   **Resumo de Produção:** Visão agrupada por item para cozinha/confeitaria.
    *   **Exportação PDF:** Relatórios de lista de pedidos e resumo de produção para impressão.

## Tecnologias Utilizadas

*   **Backend:** Node.js, Express, PostgreSQL, pg (node-postgres).
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React (ícones), jsPDF (geração de PDF).
