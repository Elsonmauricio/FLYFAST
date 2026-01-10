✈️ Flyfast - Documentação do Projeto
Versão: 1.0.0
Estado: Em Desenvolvimento / Produção
Stack: MERN (MongoDB/Firebase, Express, React, Node.js)

1. Visão Geral do Projeto
O Flyfast é uma plataforma web de logística e serviços de concierge (Personal Shopper) focada na rota Luanda 🇦🇴 ↔️ Lisboa 🇵🇹. A aplicação permite a gestão de envios de encomendas, agendamento de rotas, rastreio em tempo real e solicitação de compras personalizadas.

O sistema divide-se em dois ambientes principais:

Portal do Cliente: Para rastreio, reservas, gestão de perfil e pedidos.
Painel Administrativo (Backoffice): Para gestão total de utilizadores, envios, rotas, tabela de preços e relatórios financeiros.

2. Arquitetura Técnica
O projeto segue uma arquitetura Cliente-Servidor desacoplada, utilizando serviços cloud para base de dados e autenticação.

2.1 Tecnologias Utilizadas
Frontend (Interface):

Framework: React.js (Vite/CRA)
Estilização: Tailwind CSS
Routing: React Router DOM v6
Gestão de Estado: React Context API (AuthContext, AlertContext)
Visualização de Dados: Recharts (Gráficos)
Ícones: React Icons (FontAwesome, Lucide)

Backend (API):

Runtime: Node.js
Framework: Express.js
Segurança: Helmet, CORS, Express Rate Limit
Logs: Morgan, Winston

Infraestrutura & Dados:

Base de Dados: Google Firebase Firestore (NoSQL)
Autenticação: Firebase Authentication
Hospedagem Frontend: Vercel
Hospedagem Backend: (Configurável: Vercel Serverless / Render / VPS)

3. Estrutura do Projeto
A estrutura de pastas segue o padrão de separação de responsabilidades:

text
 Show full code block 
flyfast/
├── flyfast-backend/         # Servidor API
│   ├── config/              # Configurações (Firebase, etc.)
│   ├── middleware/          # Middlewares (Auth, Validação)
│   ├── routes/              # Definição de Endpoints (API)
│   ├── lib/                 # Bibliotecas auxiliares
│   └── server.js            # Ponto de entrada do servidor
│
└── flyfast-frontend/        # Aplicação React
    ├── public/              # Assets estáticos (manifest, logos)
    ├── src/
    │   ├── assets/          # Imagens e estilos globais
    │   ├── components/      # Componentes reutilizáveis (Header, Cards)
    │   ├── contexts/        # Gestão de estado global
    │   ├── hooks/           # Custom Hooks
    │   ├── pages/           # Páginas principais (Admin, Account, Routes)
    │   └── App.js           # Configuração de rotas

4. Funcionalidades Principais
4.1 Módulo de Autenticação & Utilizadores
Registo/Login: Via Email/Password (Firebase Auth).
RBAC (Role-Based Access Control):
admin: Acesso total ao sistema.
customer / user: Acesso apenas aos seus dados e pedidos.
Perfil: Gestão de dados pessoais, moradas e preferências de notificação.
Fidelidade: Sistema de pontos de fidelidade gerido pelo admin.
4.2 Módulo de Envios (Shipments)
Criação: O Admin pode criar envios manuais; Clientes podem solicitar reservas.
Estados: Pendente → Em Processamento → Em Trânsito → Chegou ao Destino → Entregue.
Rastreio: Código único (ID) para rastreio público ou privado.
Cancelamento: Lógica para cancelar envios e libertar capacidade na rota.
4.3 Módulo de Rotas (Schedules)
Gestão: Criação de rotas aéreas com data, hora, capacidade (kg) e preço base.
Visualização: Clientes veem rotas disponíveis e capacidade restante.
Filtros: Filtragem por origem/destino (Luanda/Lisboa) e data.
4.4 Módulo Personal Shopper
Pedidos: Clientes enviam links/detalhes de produtos que desejam comprar no estrangeiro.
Gestão de Estado: O Admin atualiza o estado (Orçamentado, Comprado, Enviado).
Orçamentação: Campo para definir o orçamento aprovado.
4.5 Tabela de Preços Dinâmica
Configuração: O Admin define o preço base por Kg e taxas de serviço.
Artigos Específicos: Lista editável de produtos com preços fixos (ex: Telemóveis, Passaportes).
Artigos por Peso: Taxas percentuais sobre o valor da fatura para categorias (ex: Roupa, Eletrónica).
Frontend: A página de Rotas consome estes dados dinamicamente da API.

5. API Reference (Backend)
O backend expõe uma API RESTful. Abaixo estão os principais endpoints:

Método	Endpoint	Descrição	Acesso
GET	/api/pricing	Obtém a tabela de preços atual	Público
GET	/api/schedules	Lista as rotas disponíveis	Público
GET	/api/shipments/track/:id	Rastreia uma encomenda	Público
POST	/api/auth/login	Autenticação de utilizador	Público
GET	/api/account/shipments	Lista envios do utilizador logado	Privado
GET	/api/admin/dashboard/stats	Estatísticas gerais	Admin
PUT	/api/admin/pricing	Atualiza preços e gera logs	Admin
PUT	/api/users/:id	Atualiza role/pontos de um user	Admin

6. Modelo de Dados (Firestore)
A base de dados NoSQL está estruturada nas seguintes coleções principais:

users: Documentos de utilizadores (perfil, role, pontos).
shipments: Encomendas (origem, destino, peso, custo, estado).
schedules: Rotas de voo e capacidade.
personalShopperRequests: Pedidos de compra.
settings:
Documento pricing: Contém a configuração global de preços.
pricingLogs: Histórico de alterações de preços (Auditoria).
contactRequests: Mensagens do formulário de contacto.

7. Instalação e Configuração Local
Para rodar o projeto localmente:

Pré-requisitos
Node.js (v18+)
Conta Google Firebase (com Firestore e Auth ativados)
Passo 1: Configurar Backend
Navegue até flyfast-backend.
Instale as dependências: npm install.
Crie um ficheiro .env com as credenciais do Firebase Admin SDK.
Inicie o servidor: npm run dev (porta 5000).
Passo 2: Configurar Frontend
Navegue até flyfast-frontend.
Instale as dependências: npm install.
Crie um ficheiro .env na raiz:
env
VITE_API_URL=http://localhost:5000
# Credenciais Firebase Client
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
Inicie a aplicação: npm start (porta 3000).

8. Segurança e Boas Práticas Implementadas
Proteção de Rotas: O Frontend usa ProtectedRoute para impedir acesso não autorizado a páginas de conta e admin.
Verificação de Token: O Backend valida o token JWT do Firebase em cada requisição protegida (authMiddleware).
Validação de Admin: Middleware específico no backend garante que apenas utilizadores com role: 'admin' executam operações críticas.
Sanitização: Uso de helmet para headers HTTP seguros e validação de inputs.
Auditoria: Logs automáticos de alterações sensíveis (ex: Tabela de Preços).

9. Manutenção Futura (Roadmap)
[ ] Implementar upload de imagens (Storage) para comprovativos de pagamento.
[ ] Integração com gateway de pagamentos (Stripe/Multicaixa Express).
[ ] Notificações automáticas por Email/SMS na mudança de estado da encomenda.
[ ] App Mobile (React Native) reaproveitando o Backend existente.

Desenvolvido por: Elson Domingos Leitão Mauricio
Contacto de Suporte: maelsonmauricio0@g,ail.com