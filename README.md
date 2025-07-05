# 🎯 Sistema de Gerenciamento de Aluguel de Roupas

Sistema completo para gerenciamento de loja de aluguel de roupas, desenvolvido com React + TypeScript, ShadCN UI e JSON Server.

## 🚀 Funcionalidades

- ✅ **Dashboard** com KPIs e gráficos
- ✅ **Gerenciamento de Roupas** (CRUD completo)
- ✅ **Gerenciamento de Clientes** (CRUD completo)
- ✅ **Sistema de Aluguéis** com controle de datas
- ✅ **Devoluções** com cálculo automático de multas
- ✅ **Relatórios** com exportação CSV
- ✅ **Autenticação** com controle de acesso
- ✅ **Tema claro/escuro**
- ✅ **Design responsivo**

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: ShadCN UI + TailwindCSS + Lucide Icons
- **Estado**: TanStack Query + Context API
- **Formulários**: React Hook Form + Zod
- **Backend**: JSON Server (simulação)
- **HTTP**: Axios
- **Roteamento**: React Router DOM

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🚀 Como executar

### 1. Clone o repositório

\`\`\`bash
git clone <url-do-repositorio>
cd rental-management-system
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Execute o projeto completo

\`\`\`bash

# Executa JSON Server (porta 3001) + Frontend (porta 5173) simultaneamente

npm run dev:full
\`\`\`

**OU execute separadamente:**

\`\`\`bash

# Terminal 1 - JSON Server

npm run server

# Terminal 2 - Frontend

npm run dev
\`\`\`

### 4. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

## 🔐 Credenciais de Teste

### Administrador

- **Email**: admin@rental.com
- **Senha**: admin123

### Atendente

- **Email**: atendente@rental.com
- **Senha**: atendente123

## 📁 Estrutura do Projeto

\`\`\`
src/
├── components/
│ ├── ui/ # Componentes ShadCN UI
│ ├── atoms/ # Componentes básicos
│ ├── molecules/ # Componentes compostos
│ └── organisms/ # Seções complexas
├── contexts/ # Context API
├── hooks/ # Hooks customizados
├── pages/ # Páginas da aplicação
├── services/ # Serviços de API
└── lib/ # Utilitários
\`\`\`

## 🔌 API Endpoints

### Autenticação

- `GET /users?email={email}` - Buscar usuário por email

### Roupas

- `GET /clothes` - Listar todas as roupas
- `POST /clothes` - Criar nova roupa
- `PATCH /clothes/:id` - Atualizar roupa
- `DELETE /clothes/:id` - Deletar roupa
- `GET /clothes?status={status}` - Filtrar por status

### Clientes

- `GET /customers` - Listar todos os clientes
- `POST /customers` - Criar novo cliente
- `PATCH /customers/:id` - Atualizar cliente
- `DELETE /customers/:id` - Deletar cliente
- `GET /customers?q={query}` - Buscar clientes

### Aluguéis

- `GET /rentals` - Listar todos os aluguéis
- `POST /rentals` - Criar novo aluguel
- `PATCH /rentals/:id` - Atualizar aluguel
- `GET /rentals?status={status}` - Filtrar por status
- `GET /rentals?customerId={id}` - Aluguéis por cliente

## 🎨 Customização

### Cores do Tema

Edite `src/index.css` para personalizar as cores:

\`\`\`css
:root {
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96%;
/_ ... outras variáveis _/
}
\`\`\`

### Configuração da API

Edite `src/services/api.ts` para alterar a URL base:

\`\`\`typescript
const api = axios.create({
baseURL: 'http://localhost:3001', // Altere aqui
timeout: 10000,
})
\`\`\`

## 📊 Dados Iniciais

O arquivo `db.json` contém dados de exemplo:

- 2 usuários (admin + atendente)
- 4 roupas de exemplo
- 3 clientes de exemplo
- 2 aluguéis de exemplo

## 🔧 Scripts Disponíveis

\`\`\`bash
npm run dev # Executa apenas o frontend
npm run server # Executa apenas o JSON Server
npm run dev:full # Executa ambos simultaneamente
npm run build # Build para produção
npm run preview # Preview do build
npm run lint # Executa o linter
\`\`\`

## 🚀 Deploy

### Frontend (Vercel/Netlify)

1. Faça build: `npm run build`
2. Deploy da pasta `dist/`

### Backend (Railway/Heroku)

1. Substitua JSON Server por API real
2. Configure variáveis de ambiente
3. Atualize `src/services/api.ts`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o Node.js 18+ está instalado
2. Certifique-se que as portas 3001 e 5173 estão livres
3. Execute `npm install` novamente
4. Verifique os logs no console

---

Desenvolvido com ❤️ usando React + TypeScript + ShadCN UI
