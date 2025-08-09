# RetalPro – Sistema de Gerenciamento de Aluguel de Roupas

[🌐 Demo ao vivo](https://retal-pro.vercel.app)  
Sistema completo e responsivo para gestão de loja de aluguel de roupas, desenvolvido com React, TypeScript, ShadCN UI e JSON Server.

---

##  Visão Geral
- Painel de controle com KPIs e gráficos.
- Gestão de roupas e clientes com operações completas (CRUD).
- Controle de aluguéis, devoluções com cálculos automáticos de multas e relatórios exportáveis em CSV.
- Autenticação por nível de usuário, tema claro/escuro e design mobile-friendly.

---

##  Tecnologias Utilizadas
- **Frontend**: React 18, TypeScript, Vite  
- **UI**: ShadCN UI, TailwindCSS, Lucide Icons  
- **Gerenciamento de Estado**: TanStack Query, Context API  
- **Formulários & Validação**: React Hook Form + Zod  
- **Backend Simulado**: JSON Server  
- **Requisições HTTP**: Axios  
- **Roteamento**: React Router DOM  

---

##  Pré-requisitos
- Node.js 18+  
- npm ou yarn

---

##  Como Executar

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/CarlosSeixas2/RetalPro.git
   cd RetalPro
   ```

2. **Instale as dependências**  
   ```bash
   npm install
   ```  
   ou  
   ```bash
   yarn install
   ```

3. **Execute a aplicação**  
   - Para rodar frontend e servidor JSON simultaneamente:  
     ```bash
     npm run dev:full
     ```  
   - Ou separadamente:  
     ```bash
     # Terminal 1
     npm run server
     # Terminal 2
     npm run dev
     ```

4. **Acesse**  
   - Frontend: `http://localhost:5173`  
   - Simulador de API: `http://localhost:3001`

---

##  Credenciais de Teste
| Tipo           | Email                  | Senha         |
|----------------|------------------------|---------------|
| Administrador  | admin@rental.com       | admin123      |
| Atendente      | atendente@rental.com   | atendente123  |

---

##  Estrutura do Projeto
```
src/
├── components/
│   ├── ui/          – Componentes de interface (ShadCN UI)
│   ├── atoms/       – Elementos básicos
│   ├── molecules/   – Componentes compostos
│   └── organisms/   – Seções completas
├── contexts/        – Context API
├── hooks/           – Hooks personalizados
├── pages/           – Páginas da aplicação
├── services/        – Chamadas à API
└── lib/             – Utilitários
```

---

##  Endpoints da API Simulada

### Autenticação
- `GET /users?email={email}` – Buscar usuário

### Roupas
- `GET /clothes` – Listar roupas  
- `POST /clothes` – Criar nova roupa  
- `PATCH /clothes/:id` – Atualizar roupa  
- `DELETE /clothes/:id` – Remover roupa  
- `GET /clothes?status={status}` – Filtrar por status

### Clientes
- `GET /customers`, `POST /customers`, `PATCH /customers/:id`, `DELETE /customers/:id`  
- `GET /customers?q={query}` – Buscar cliente

### Aluguéis
- `GET /rentals`, `POST /rentals`, `PATCH /rentals/:id`  
- `GET /rentals?status={status}`, `GET /rentals?customerId={id}` – Filtrar aluguéis

---

##  Personalização

- **Cores do Tema**: ajuste em `src/index.css`  
  ```css
  :root {
    --primary: 221.2 83.2% 53.3%;
    --secondary: 210 40% 96%;
    /* Outras variáveis… */
  }
  ```

- **URL da API**: configure em `src/services/api.ts`  
  ```typescript
  const api = axios.create({
    baseURL: 'http://localhost:3001', // atualize conforme necessário
    timeout: 10000,
  });
  ```

---

##  Dados Iniciais
O arquivo `db.json` oferece dados de exemplo:
- 2 usuários (admin e atendente)  
- 4 roupas  
- 3 clientes  
- 2 aluguéis

---

##  Scripts Disponíveis
```bash
npm run dev         # Inicia apenas o frontend
npm run server      # Inicia apenas o JSON Server
npm run dev:full    # Inicia ambos simultaneamente
npm run build       # Compila para produção
npm run preview     # Visualiza o build
npm run lint        # Executa linting
```

---

##  Deploy

- **Frontend**: Vercel ou Netlify — gere o build com `npm run build` e só fazer o deploy  
- **Backend**: migrar do JSON Server para API real (Railway, Heroku etc.), configurar variáveis de ambiente e atualizar `src/services/api.ts`

---

##  Como Contribuir
1. **Fork** o projeto  
2. **Crie uma branch**  
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```  
3. **Commit suas alterações**  
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```  
4. **Envie para o seu fork**  
   ```bash
   git push origin feature/nova-funcionalidade
   ```  
5. **Abra um Pull Request**

---

##  Licença
Projeto sob a licença **MIT**

---

##  Suporte
Se tiver problemas:
1. Verifique se o Node.js 18+ está instalado.  
2. Confirme se as portas 3001 e 5173 estão livres.  
3. Reexecute `npm install`.  
4. Consulte os logs no console.

---

Desenvolvido com ❤️ usando **React**, **TypeScript** e **ShadCN UI**
