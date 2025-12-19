describe('Jornada de Compra na Loja (E2E)', () => {
  beforeEach(() => {
    // Intercetamos as chamadas à API para simular respostas controladas.
    // Isto garante que o nosso teste não depende do estado real do backend.

    // Simula a resposta da API para a lista de produtos da loja.
    cy.intercept('GET', '/api/products', {
      fixture: 'products.json', // Assume que temos um ficheiro `products.json` em `cypress/fixtures`
    }).as('getProducts');

    // Simula um carrinho vazio ao carregar a página.
    cy.intercept('GET', '/api/cart', { body: { items: [] } }).as('getEmptyCart');

    // Simula a adição de um item ao carrinho.
    cy.intercept('POST', '/api/cart/add', {
      fixture: 'cart-with-item.json', // Resposta da API após adicionar o item.
    }).as('addToCart');

    // Simula a remoção de um item do carrinho.
    cy.intercept('POST', '/api/cart/remove', {
      body: { items: [] }, // Resposta da API após remover o item (carrinho vazio).
    }).as('removeFromCart');
  });

  it('permite ao utilizador adicionar e remover um produto do carrinho', () => {
    // 1. Visitar a página da loja
    cy.visit('/shop');
    cy.wait('@getProducts'); // Espera que a chamada à API dos produtos seja concluída.

    // 2. Encontrar um produto e adicioná-lo ao carrinho
    cy.contains('h3', 'T-shirt FLYFAST').parents('.card').within(() => {
      cy.contains('button', 'Adicionar ao Carrinho').click();
    });

    // 3. Verificar se a chamada `addToCart` foi feita e se o indicador do carrinho no header foi atualizado.
    cy.wait('@addToCart');
    cy.get('header').contains('Carrinho (1)').should('be.visible');

    // 4. Clicar no botão do carrinho para ir para a página do carrinho
    cy.get('header').contains('Carrinho (1)').click();
    cy.url().should('include', '/cart'); // Verifica se a URL mudou para /cart

    // 5. Na página do carrinho, verificar se o produto está lá e se o total está correto.
    cy.contains('h3', 'T-shirt FLYFAST').should('be.visible');
    cy.contains('span', '5.990 AOA').should('be.visible'); // Verifica o subtotal
    cy.contains('span', '10.990 AOA').should('be.visible'); // Verifica o total com portes

    // 6. Remover o item do carrinho
    cy.get('[data-testid="remove-item-button"]').click();
    cy.wait('@removeFromCart');

    // 7. Verificar se o carrinho ficou vazio
    cy.contains('h2', 'O seu carrinho está vazio').should('be.visible');
    cy.get('header').contains('Carrinho (0)').should('be.visible');
  });
});