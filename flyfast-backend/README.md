# FLYFAST Backend - API Engine

Esta é a API que sustenta a operação da FLYFAST, lidando com lógica de negócios, integração de pagamentos e persistência de dados.

## 🌟 Funcionalidades Principais

- **Gestão de Envios (Shipments)**: Criação de ordens de logística com cálculo automático de pontos de fidelidade.
- **Fidelização**: Sistema de tiers (Bronze, Silver, Gold, Platinum) baseado em gastos.
- **Integração Shopify**: Webhooks para sincronização de estoque e pedidos entre a Shopify e o banco de dados local.
- **Pagamentos**: Fluxo completo com Stripe, incluindo Checkout Sessions e suporte a MB Way.
- **Logística em Tempo Real**: Agenda de rotas (Schedules) com gestão de capacidade de carga.

## ⚙️ Variáveis de Ambiente (.env)

O backend exige as seguintes variáveis para funcionamento pleno:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="---BEGIN PRIVATE KEY---\n...\n---END PRIVATE KEY---"

# Shopify
SHOPIFY_DOMAIN=flyfast.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=...
SHOPIFY_WEBHOOK_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email (SMTP)
EMAIL_USER=...
EMAIL_PASS=...
```

## 📡 Principais Endpoints

| Rota | Descrição | Acesso |
| :--- | :--- | :--- |
| `POST /api/auth/register` | Registro de novo usuário (Firebase) | Público |
| `GET /api/shipments` | Listar envios do usuário autenticado | Privado |
| `POST /api/shopify/graphql` | Proxy para Shopify Storefront API | Público/App |
| `POST /api/schedules` | Criar nova rota de transporte | Admin |
| `POST /api/admin/change-role` | Alterar nível de acesso de usuário | Admin |

## 🧪 Lógica de Negócio Destacada

### Transações de Envio
Ao criar um envio (`routes/shipments.js`), a API executa uma transação atômica que:
1. Verifica a capacidade disponível na rota (`schedules`).
2. Deduz o peso da carga da capacidade da rota.
3. Atribui pontos de fidelidade ao usuário (1 ponto por cada 1000 AOA).
4. Persiste o documento do envio.

### Proxy Shopify
Para evitar exposição de tokens no frontend, o backend atua como um Proxy para a API GraphQL da Shopify, garantindo que as requisições venham de uma origem confiável.

## 🛠️ Comandos
- `npm start`: Inicia o servidor.
- `npm run dev`: Inicia com nodemon para desenvolvimento.