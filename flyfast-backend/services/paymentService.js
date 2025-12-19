const Stripe = require('stripe');
const Order = require('../models/Order');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class PaymentService {
  constructor() {
    this.stripe = null;
    
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      console.log('✅ Stripe payment service initialized');
    } else {
      console.warn('⚠️ Stripe secret key not found, payment service disabled');
    }
  }

  /**
   * Cria um cliente Stripe
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Cliente Stripe
   */
  async createCustomer(userData) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        metadata: {
          userId: userData.id,
          system: 'flyfast'
        }
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };
      
    } catch (error) {
      console.error('❌ Error creating Stripe customer:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cria uma sessão de checkout
   * @param {Object} order - Dados do pedido
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Sessão de checkout
   */
  async createCheckoutSession(order, user) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      // Garantir que o usuário tem um customerId no Stripe
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customerResult = await this.createCustomer(user);
        
        if (!customerResult.success) {
          throw new Error('Failed to create customer');
        }
        
        customerId = customerResult.customerId;
        
        // Atualizar usuário com customerId
        await User.findByIdAndUpdate(user.id, {
          stripeCustomerId: customerId
        });
      }

      // Preparar line items
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: item.name,
            description: item.description || `SKU: ${item.sku}`,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
              sku: item.sku
            }
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Adicionar shipping cost se aplicável
      if (order.shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: `Frete - ${order.shipping.method}`,
              description: 'Custo de envio'
            },
            unit_amount: Math.round(order.shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Criar sessão de checkout
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card', 'mb_way'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: user.id
        },
        shipping_address_collection: {
          allowed_countries: ['PT', 'AO'],
        },
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          shipping: 'auto'
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      });

      // Atualizar ordem com sessionId
      await Order.findByIdAndUpdate(order._id, {
        'payment.stripeSessionId': session.id,
        'payment.status': 'processing'
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
        expiresAt: new Date(session.expires_at * 1000)
      };
      
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa webhook do Stripe
   * @param {string} payload - Payload do webhook
   * @param {string} sig - Assinatura do webhook
   * @returns {Promise<Object>} Resultado
   */
  async handleWebhook(payload, sig) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      let event;
      
      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (error) {
        console.error('❌ Webhook signature verification failed:', error);
        throw new Error(`Webhook Error: ${error.message}`);
      }

      // Processar evento
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
          
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
          
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return {
        success: true,
        event: event.type,
        received: true
      };
      
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa sessão de checkout completada
   * @param {Object} session - Sessão Stripe
   */
  async handleCheckoutSessionCompleted(session) {
    try {
      const { orderId, userId } = session.metadata;
      
      // Atualizar ordem
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          'payment.status': 'paid',
          'payment.stripePaymentId': session.payment_intent,
          'payment.paidAt': new Date(),
          'payment.transactionId': session.id,
          status: 'confirmed'
        },
        { new: true }
      ).populate('userId');
      
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      // Enviar notificação
      await NotificationService.sendNotification(
        userId,
        'payment_confirmation',
        '✅ Pagamento Confirmado',
        `Seu pagamento para o pedido ${order.orderNumber} foi confirmado.`,
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          currency: order.currency,
          method: 'stripe'
        }
      );
      
      console.log(`✅ Payment confirmed for order: ${order.orderNumber}`);
      
    } catch (error) {
      console.error('❌ Error handling checkout session completed:', error);
    }
  }

  /**
   * Processa pagamento bem-sucedido
   * @param {Object} paymentIntent - PaymentIntent Stripe
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    // Já tratado no checkout.session.completed
    console.log('PaymentIntent succeeded:', paymentIntent.id);
  }

  /**
   * Processa pagamento falhado
   * @param {Object} paymentIntent - PaymentIntent Stripe
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Encontrar ordem pelo payment intent
      const order = await Order.findOne({
        'payment.stripePaymentId': paymentIntent.id
      });
      
      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          'payment.status': 'failed',
          status: 'cancelled'
        });
        
        // Enviar notificação
        await NotificationService.sendNotification(
          order.userId,
          'payment_confirmation',
          '❌ Pagamento Falhou',
          `O pagamento para o pedido ${order.orderNumber} falhou.`,
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            error: paymentIntent.last_payment_error?.message
          }
        );
      }
      
    } catch (error) {
      console.error('❌ Error handling payment intent failed:', error);
    }
  }

  /**
   * Processa reembolso
   * @param {Object} charge - Charge Stripe
   */
  async handleChargeRefunded(charge) {
    try {
      // Encontrar ordem pelo charge id
      const order = await Order.findOne({
        'payment.stripePaymentId': charge.payment_intent
      });
      
      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          'payment.status': 'refunded'
        });
        
        // Enviar notificação
        await NotificationService.sendNotification(
          order.userId,
          'payment_confirmation',
          '🔄 Reembolso Processado',
          `Seu reembolso para o pedido ${order.orderNumber} foi processado.`,
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            refundAmount: charge.amount_refunded / 100,
            currency: charge.currency
          }
        );
      }
      
    } catch (error) {
      console.error('❌ Error handling charge refunded:', error);
    }
  }

  /**
   * Cria um pagamento MB Way
   * @param {Object} order - Dados do pedido
   * @param {string} phone - Número de telefone
   * @returns {Promise<Object>} Resultado
   */
  async createMBWayPayment(order, phone) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency.toLowerCase(),
        payment_method_types: ['mb_way'],
        payment_method_options: {
          mb_way: {
            setup_future_usage: 'off_session'
          }
        },
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          phone
        }
      });

      // Criar confirmação MB Way
      const confirmation = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: 'pm_card_mbway',
        return_url: `${process.env.FRONTEND_URL}/checkout/success?payment_intent=${paymentIntent.id}`
      });

      // Atualizar ordem
      await Order.findByIdAndUpdate(order._id, {
        'payment.stripePaymentId': paymentIntent.id,
        'payment.status': 'processing',
        'payment.method': 'mbway'
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        nextAction: confirmation.next_action
      };
      
    } catch (error) {
      console.error('❌ Error creating MB Way payment:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica status de um pagamento
   * @param {string} paymentIntentId - ID do payment intent
   * @returns {Promise<Object>} Status do pagamento
   */
  async checkPaymentStatus(paymentIntentId) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
        lastPaymentError: paymentIntent.last_payment_error
      };
      
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Processa reembolso manual
   * @param {string} paymentIntentId - ID do payment intent
   * @param {number} amount - Valor a reembolsar
   * @returns {Promise<Object>} Resultado
   */
  async processRefund(paymentIntentId, amount) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100)
      });

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
      
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas de pagamentos
   * @returns {Promise<Object>} Estatísticas
   */
  async getPaymentStats() {
    try {
      if (!this.stripe) {
        throw new Error('Stripe service is not enabled');
      }

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      // Obter balanço
      const balance = await this.stripe.balance.retrieve();

      // Obter pagamentos deste mês
      const payments = await this.stripe.paymentIntents.list({
        limit: 100,
        created: {
          gte: Math.floor(firstDayOfMonth.getTime() / 1000)
        }
      });

      // Calcular estatísticas
      const totalAmount = payments.data.reduce((sum, pi) => sum + pi.amount, 0) / 100;
      const successfulPayments = payments.data.filter(pi => pi.status === 'succeeded');
      const failedPayments = payments.data.filter(pi => pi.status === 'failed');
      
      // Por método de pagamento
      const paymentMethods = {};
      payments.data.forEach(pi => {
        const method = pi.payment_method_types[0] || 'unknown';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });

      return {
        success: true,
        stats: {
          balance: {
            available: balance.available[0]?.amount / 100 || 0,
            pending: balance.pending[0]?.amount / 100 || 0,
            currency: balance.available[0]?.currency || 'eur'
          },
          payments: {
            total: payments.data.length,
            successful: successfulPayments.length,
            failed: failedPayments.length,
            successRate: payments.data.length > 0 
              ? (successfulPayments.length / payments.data.length) * 100 
              : 0
          },
          revenue: {
            total: totalAmount,
            average: payments.data.length > 0 ? totalAmount / payments.data.length : 0
          },
          paymentMethods
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting payment stats:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar instância única
const paymentService = new PaymentService();
module.exports = paymentService;