// Adicione este método dentro da classe ShopController no seu ficheiro controllers/shopController.js

const Product = require('../models/Product'); // Certifique-se que o modelo Product está importado
const User = require('../models/User'); // Modelo de Usuário para gerir carrinhos
const Order = require('../models/Order'); // Modelo de Pedido
const { generateSlug } = require('../utils/helpers'); // Helper para criar slugs amigáveis para URL
const { db } = require('../config/firebase'); // Importar a instância do Firestore

class ShopController {
  
  /**
   * Obtém uma lista de produtos com filtros e paginação.
   */
  async getProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 12, 
        category, 
        sortBy = 'createdAt', // ex: 'price', 'name'
        order = 'desc'      // 'asc' ou 'desc'
      } = req.query;

      // Construir a consulta ao Firestore
      let query = db.collection('products').where('status', '==', 'active');

      if (category) {
        query = query.where('category', '==', category);
      }

      // Contar o total de documentos para a paginação
      const totalSnapshot = await query.count().get();
      const total = totalSnapshot.data().count;

      // Aplicar ordenação, paginação e obter os documentos
      const productsSnapshot = await query
        .orderBy(sortBy, order)
        .limit(parseInt(limit))
        .offset((parseInt(page) - 1) * parseInt(limit))
        .get();

      const products = productsSnapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));

      res.json({
        success: true,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error("Erro ao obter produtos:", error);
      res.status(500).json({ error: 'Erro ao obter produtos.' });
    }
  }

  // Métodos de Produto
  /**
   * Obtém um único produto pelo seu ID.
   * Rota pública, retorna apenas produtos com status 'active'.
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      // Para uma rota pública, só retornamos o produto se ele existir e estiver ativo.
      if (!product || product.status !== 'active') {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      res.json({ success: true, product });
    } catch (error) {
      console.error("Erro ao obter produto por ID:", error);
      res.status(500).json({ error: 'Erro interno ao obter o produto.', message: error.message });
    }
  }

  async getProductBySlug(req, res) { res.status(501).json({ message: 'Not Implemented: getProductBySlug' }); }
  async getProductsByCategory(req, res) { res.status(501).json({ message: 'Not Implemented: getProductsByCategory' }); }
  async searchProducts(req, res) { res.status(501).json({ message: 'Not Implemented: searchProducts' }); }

  // Métodos de Carrinho
  /**
   * Obtém o carrinho do usuário autenticado, enriquecido com detalhes dos produtos.
   */
  async getCart(req, res) {
    if (!req.user) {
      // Para convidados, o carrinho é gerido no frontend. Retornamos um carrinho vazio.
      return res.json({ success: true, cart: [] });
    }

    try {
      const userId = req.user.uid;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const cartItems = user.cart || [];
      if (cartItems.length === 0) {
        return res.json({ success: true, cart: [] });
      }

      // Enriquecer os itens do carrinho com os detalhes dos produtos
      const enrichedCart = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        // Se o produto não for encontrado (ex: foi apagado), ainda retornamos o item
        // para que o frontend possa decidir como lidar com ele (ex: mostrar uma mensagem e permitir remover).
        return product
          ? { ...item, product: { name: product.name, price: product.price, images: product.images, slug: product.slug } }
          : { ...item, product: null, error: 'Produto não encontrado' };
      }));

      // Filtra itens que não foram encontrados para não os enviar ao frontend se não for desejado
      res.json({ success: true, cart: enrichedCart.filter(item => item.product) });
    } catch (error) {
      console.error("Erro ao obter carrinho:", error);
      res.status(500).json({ error: 'Erro interno ao obter o carrinho.', message: error.message });
    }
  }
  /**
   * Adiciona um item ao carrinho do usuário autenticado.
   */
  async addToCart(req, res) {
    // Nota: Esta rota é pública, mas a lógica abaixo só funciona para usuários autenticados.
    // Para convidados, o carrinho deve ser gerido no frontend (localStorage).
    // Um middleware `optionalAuth` poderia popular `req.user` se um token for fornecido.
    if (!req.user) {
      return res.status(401).json({ error: 'Apenas usuários autenticados podem adicionar itens ao carrinho no servidor.' });
    }

    try {
      const { productId, quantity } = req.body;
      const userId = req.user.uid;

      // 1. Validar produto e stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      if (product.inventory.stock < quantity) {
        return res.status(400).json({ error: 'Stock insuficiente.' });
      }

      // 2. Obter usuário e seu carrinho
      const user = await User.findById(userId);
      const cart = user.cart || [];

      // 3. Verificar se o item já está no carrinho
      const cartItemIndex = cart.findIndex(item => item.productId === productId);

      if (cartItemIndex > -1) {
        // Atualizar quantidade
        cart[cartItemIndex].quantity += quantity;
        // Verificar novamente o stock com a nova quantidade total
        if (product.inventory.stock < cart[cartItemIndex].quantity) {
          return res.status(400).json({ error: 'Stock insuficiente para a quantidade total no carrinho.' });
        }
      } else {
        // Adicionar novo item
        cart.push({ productId, quantity, addedAt: new Date() });
      }

      // 4. Salvar o carrinho atualizado
      user.cart = cart;
      await user.save();

      res.json({ success: true, message: 'Produto adicionado ao carrinho.', cart: user.cart });

    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      res.status(500).json({ error: 'Erro interno ao adicionar ao carrinho.', message: error.message });
    }
  }
  /**
   * Atualiza a quantidade de um item no carrinho.
   */
  async updateCartItem(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Apenas usuários autenticados podem modificar o carrinho.' });
    }

    try {
      const { itemId } = req.params; // itemId é o productId
      const { quantity } = req.body;
      const userId = req.user.uid;

      if (quantity <= 0) {
        return res.status(400).json({ error: 'A quantidade deve ser maior que zero. Para remover, use a rota de exclusão.' });
      }

      const user = await User.findById(userId);
      const cart = user.cart || [];
      const cartItemIndex = cart.findIndex(item => item.productId === itemId);

      if (cartItemIndex === -1) {
        return res.status(404).json({ error: 'Item não encontrado no carrinho.' });
      }

      const product = await Product.findById(itemId);
      if (!product || product.inventory.stock < quantity) {
        return res.status(400).json({ error: 'Stock insuficiente.' });
      }

      cart[cartItemIndex].quantity = quantity;
      user.cart = cart;
      await user.save();

      res.json({ success: true, message: 'Carrinho atualizado.', cart: user.cart });
    } catch (error) {
      console.error("Erro ao atualizar item do carrinho:", error);
      res.status(500).json({ error: 'Erro interno ao atualizar o carrinho.', message: error.message });
    }
  }
  /**
   * Remove um item do carrinho.
   */
  async removeFromCart(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Apenas usuários autenticados podem modificar o carrinho.' });
    }

    try {
      const { itemId } = req.params; // itemId é o productId
      const userId = req.user.uid;

      const user = await User.findById(userId);
      const initialCartLength = user.cart?.length || 0;

      user.cart = user.cart?.filter(item => item.productId !== itemId) || [];

      if (user.cart.length === initialCartLength) {
        return res.status(404).json({ error: 'Item não encontrado no carrinho.' });
      }

      await user.save();
      res.json({ success: true, message: 'Item removido do carrinho.', cart: user.cart });
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      res.status(500).json({ error: 'Erro interno ao remover do carrinho.', message: error.message });
    }
  }
  /**
   * Limpa todos os itens do carrinho.
   */
  async clearCart(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Apenas usuários autenticados podem modificar o carrinho.' });
    }
    try {
      const userId = req.user.uid;
      const user = await User.findById(userId);
      user.cart = [];
      await user.save();
      res.json({ success: true, message: 'Carrinho esvaziado com sucesso.' });
    } catch (error) {
      console.error("Erro ao limpar o carrinho:", error);
      res.status(500).json({ error: 'Erro interno ao limpar o carrinho.', message: error.message });
    }
  }

  // Métodos de Checkout
  /**
   * Cria um novo pedido para um usuário autenticado.
   * Executa uma transação para garantir a consistência dos dados.
   */
  async createOrder(req, res) {
    try {
      const userId = req.user.uid;
      const { shipping, payment } = req.body;

      const newOrder = await db.runTransaction(async (transaction) => {
        // 1. Obter o usuário e seu carrinho
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error("Usuário não encontrado.");
        
        const cart = userDoc.data().cart || [];
        if (cart.length === 0) throw new Error("O carrinho está vazio.");

        let subtotal = 0;
        const orderItems = [];

        // 2. Validar cada item do carrinho (preço e stock)
        for (const item of cart) {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists) throw new Error(`Produto com ID ${item.productId} não encontrado.`);
          
          const productData = productDoc.data();
          if (productData.inventory.stock < item.quantity) {
            throw new Error(`Stock insuficiente para o produto: ${productData.name}.`);
          }

          // Adicionar item ao pedido e calcular subtotal
          orderItems.push({ ...item, name: productData.name, price: productData.price });
          subtotal += productData.price.amount * item.quantity;

          // 3. Atualizar o stock do produto
          const newStock = productData.inventory.stock - item.quantity;
          transaction.update(productRef, { 'inventory.stock': newStock });
        }

        // 4. Criar o pedido
        const orderData = {
          userId,
          items: orderItems,
          subtotal: { amount: subtotal, currency: 'AOA' }, // Assumindo AOA
          total: { amount: subtotal, currency: 'AOA' }, // TODO: Adicionar custos de envio e taxas
          shipping,
          payment,
          status: 'pending', // O status mudará após a confirmação do pagamento
        };
        const createdOrder = await Order.create(orderData, transaction);

        // 5. Limpar o carrinho do usuário
        transaction.update(userRef, { cart: [] });

        return createdOrder;
      });

      res.status(201).json({ success: true, message: 'Pedido criado com sucesso.', order: newOrder });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      res.status(400).json({ error: 'Não foi possível criar o pedido.', message: error.message });
    }
  }
  async createGuestOrder(req, res) { res.status(501).json({ message: 'Not Implemented: createGuestOrder' }); }
  async getCheckoutSession(req, res) { res.status(501).json({ message: 'Not Implemented: getCheckoutSession' }); }

  // Métodos de Webhook
  async handleStripeWebhook(req, res) { res.status(501).json({ message: 'Not Implemented: handleStripeWebhook' }); }
  async handlePayPalWebhook(req, res) { res.status(501).json({ message: 'Not Implemented: handlePayPalWebhook' }); }

  // Métodos de Pedidos (Usuário)
  /**
   * Obtém o histórico de pedidos do usuário autenticado.
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.uid;
      const { page = 1, limit = 10 } = req.query;

      const result = await Order.findForUser({
        userId,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        orderBy: 'createdAt',
        order: 'desc'
      });

      res.json({ success: true, ...result });

    } catch (error) {
      console.error("Erro ao obter pedidos do usuário:", error);
      res.status(500).json({ error: 'Erro interno ao obter pedidos.', message: error.message });
    }
  }
  async getOrderById(req, res) { res.status(501).json({ message: 'Not Implemented: getOrderById' }); }
  async cancelOrder(req, res) { res.status(501).json({ message: 'Not Implemented: cancelOrder' }); }

  // Métodos de Review
  async addReview(req, res) { res.status(501).json({ message: 'Not Implemented: addReview' }); }

  // Métodos de Admin (Produtos)
  /**
   * Cria um novo produto.
   * Requer role de 'admin'. Os dados são validados e as imagens são
   * carregadas para o Firebase Storage antes de chegar a este método.
   */
  async createProduct(req, res) {
    try {
      const { name, description, category, price, inventory, status, attributes } = req.body;

      // 1. Gerar um 'slug' a partir do nome para URLs amigáveis
      const slug = generateSlug(name);

      // 2. Verificar se já existe um produto com o mesmo slug para evitar duplicados
      const existingProduct = await Product.findBySlug(slug);
      if (existingProduct) {
        return res.status(409).json({ 
          error: 'Conflito: Produto já existe',
          message: `Um produto com o nome "${name}" já existe.`
        });
      }

      // 3. Obter as URLs das imagens carregadas pelo middleware de upload
      const imageUrls = req.files?.map(file => file.firebaseUrl) || [];

      // 4. Montar o objeto do novo produto
      const productData = {
        name,
        slug,
        description,
        category,
        price: JSON.parse(price), // O preço vem como string do form-data
        inventory: JSON.parse(inventory), // O inventário também
        status: status || 'active',
        images: imageUrls,
        attributes: attributes ? JSON.parse(attributes) : {},
      };

      // 5. Usar o modelo Product para criar o documento no Firestore
      const newProduct = await Product.create(productData);

      res.status(201).json({ success: true, message: 'Produto criado com sucesso', product: newProduct });
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      res.status(500).json({ error: 'Erro interno ao criar o produto.', message: error.message });
    }
  }

  /**
   * Atualiza um produto existente.
   * Requer role de 'admin'.
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // 1. Encontrar o produto existente
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      // 2. Lidar com a atualização do slug se o nome mudar
      if (updates.name && updates.name !== product.name) {
        const newSlug = generateSlug(updates.name);
        const existingProduct = await Product.findBySlug(newSlug);
        // Garante que o novo slug não conflita com outro produto
        if (existingProduct && existingProduct.id !== id) {
          return res.status(409).json({
            error: 'Conflito: Nome de produto já existe',
            message: `Um produto com o nome "${updates.name}" já existe.`
          });
        }
        updates.slug = newSlug;
      }

      // 3. Lidar com as imagens
      const newImageUrls = req.files?.map(file => file.firebaseUrl) || [];
      let finalImages = product.images || [];

      // Remover imagens especificadas para exclusão
      if (updates.imagesToRemove) {
        const imagesToRemove = JSON.parse(updates.imagesToRemove);
        finalImages = finalImages.filter(imgUrl => !imagesToRemove.includes(imgUrl));
        // TODO: Adicionar lógica para apagar os ficheiros do Firebase Storage
      }

      // Adicionar as novas imagens
      finalImages.push(...newImageUrls);
      updates.images = finalImages;

      // 4. Converter campos string (de form-data) para os seus tipos corretos
      if (updates.price) updates.price = JSON.parse(updates.price);
      if (updates.inventory) updates.inventory = JSON.parse(updates.inventory);
      if (updates.attributes) updates.attributes = JSON.parse(updates.attributes);

      // 5. Aplicar as atualizações e salvar
      Object.assign(product, updates);
      await product.save();

      res.json({ success: true, message: 'Produto atualizado com sucesso', product });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: 'Erro interno ao atualizar o produto.', message: error.message });
    }
  }

  async deleteProduct(req, res) { res.status(501).json({ message: 'Not Implemented: deleteProduct' }); }

  // Métodos de Admin (Pedidos)
  async getAllOrders(req, res) { res.status(501).json({ message: 'Not Implemented: getAllOrders' }); }
  async adminUpdateOrder(req, res) { res.status(501).json({ message: 'Not Implemented: adminUpdateOrder' }); }

  // Métodos de Admin (Outros)
  async getShopStats(req, res) { res.status(501).json({ message: 'Not Implemented: getShopStats' }); }

  // Métodos de Categoria
  async getCategories(req, res) { res.status(501).json({ message: 'Not Implemented: getCategories' }); }

  // Métodos de Desconto
  async validateDiscountCode(req, res) { res.status(501).json({ message: 'Not Implemented: validateDiscountCode' }); }
  async createDiscount(req, res) { res.status(501).json({ message: 'Not Implemented: createDiscount' }); }
}

module.exports = new ShopController();
