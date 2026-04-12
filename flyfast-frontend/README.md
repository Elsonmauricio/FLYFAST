# 🚀 FLYFAST Website

Interface moderna e responsiva para o ecossistema FLYFAST, servindo como o portal principal para clientes em Angola e Portugal.

## ✨ Funcionalidades

*   **Dashboard do Cliente**: Acompanhamento de envios ativos, histórico e pontos de fidelidade.
*   **Reserva de Envios**: Interface intuitiva para agendamento de transporte de carga entre Luanda e Lisboa.
*   **Loja Integrada**: Catálogo de produtos alimentado via Shopify Buy SDK.
*   **Rastreamento (Tracking)**: Consulta rápida de status de encomendas via ID de rastreio.
*   **Personal Shopper**: Formulário dedicado para pedidos de compra assistida na Europa.
*   **Responsividade Total**: Otimizado para dispositivos móveis, tablets e desktops.

## 🛠️ Tecnologias

-   **Core**: React 18 (Hooks e Context API)
-   **Estilização**: Tailwind CSS (JIT mode)
-   **Roteamento**: React Router DOM 6
-   **Integração Shopify**: Shopify Buy SDK com Custom Fetch Interceptor.
-   **Comunicação**: Axios para chamadas à API Flyfast.

## 🔐 Integração com Shopify (CORS Bypass)

Uma decisão técnica importante neste projeto foi o **Interceptador Global de Fetch** (`src/lib/shopify.js`). Para evitar erros de CORS e proteger o domínio da Shopify, todas as chamadas do SDK da Shopify são interceptadas e redirecionadas para o nosso backend proxy:

```javascript
// Exemplo da lógica implementada:
if (urlString.includes('myshopify.com')) {
  return originalFetch(`${BACKEND_URL}/api/shopify/graphql`, options);
}
```

## � Instalação

```bash
npm install
```

### Configuração (.env)
Crie um arquivo `.env` na raiz do frontend:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Execução
```bash
npm start
```

## 🏗️ Estrutura de Pastas

```text
src/
├── components/       # Componentes de UI (Button, Navbar, etc.)
├── lib/              # Configurações de bibliotecas externas (Shopify, Firebase)
├── pages/            # Componentes de página (Home, Shop, Tracking)
├── services/         # Chamadas de API e lógica de negócio do lado do cliente
├── styles/           # Tailwind e CSS Global
└── utils/            # Helpers e formatadores
npm run build

🏗️ Estrutura do Projeto
text
flyfast-website/
├── public/           # Arquivos estáticos
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas do website
│   ├── styles/       # Estilos globais
│   ├── utils/        # Constantes e helpers
│   ├── App.js        # Configuração das rotas
│   └── index.js      # Ponto de entrada
└── configurações diversas

🎨 Cores
Amarelo Principal: #FFD42A

Azul Principal: #0C2E6D

Azul Claro: #3A7BFF

Amarelo Claro: #FFF9E6
