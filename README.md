# FLYFAST - Logística e E-commerce (Angola-Portugal)

O ecossistema **FLYFAST** é uma plataforma integrada de logística e comércio eletrônico que conecta Luanda (Angola) e Lisboa (Portugal). O projeto permite a gestão de envios, rastreamento em tempo real, compras assistidas (Personal Shopper) e uma loja online integrada com a Shopify.

## 🏗️ Arquitetura do Projeto

O projeto está estruturado em uma arquitetura cliente-servidor moderna:

- **`/flyfast-frontend`**: Single Page Application (SPA) construída em React, focada na experiência do usuário e responsividade.
- **`/flyfast-backend`**: API RESTful construída em Node.js/Express, utilizando Firebase como infraestrutura de dados e autenticação, e Stripe para processamento de pagamentos.

## 🚀 Stack Tecnológica Principal

- **Frontend**: React 18, Tailwind CSS, Shopify Buy SDK.
- **Backend**: Node.js, Express, Firebase Admin SDK (Firestore, Auth).
- **Pagamentos**: Stripe API (Cartões e MB Way).
- **E-commerce**: Shopify Storefront API (via Proxy).
- **Comunicação**: Nodemailer (SMTP para notificações).

## 🛠️ Requisitos Prévios

- Node.js v16+ 
- Conta no Firebase com Service Account.
- Storefront Access Token da Shopify.
- Chaves de API do Stripe (Modo Teste ou Live).

## 🔧 Instalação Rápida

1. **Configuração do Backend**:
   ```bash
   cd flyfast-backend
   npm install
   # Configure o arquivo .env (veja flyfast-backend/README.md)
   npm start
   ```

2. **Configuração do Frontend**:
   ```bash
   cd flyfast-frontend
   npm install
   # Configure o arquivo .env (veja flyfast-frontend/README.md)
   npm start
   ```

## 🛡️ Segurança e Performance

- **Autenticação**: Gerida pelo Firebase Auth com Custom Claims para níveis de acesso (Admin/User).
- **Segurança**: Uso de `helmet`, `cors` e `express-rate-limit` no backend.
- **Transações**: Operações críticas de estoque e pontos de fidelidade utilizam Transações do Firestore para garantir atomicidade.
- **Proxy Shopify**: Implementado para proteger tokens de acesso e evitar problemas de Cross-Origin Resource Sharing (CORS).

## 📄 Licença

© 2024 Flyfast - Prestação de Serviços, LDA. Todos os direitos reservados.