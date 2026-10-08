const prisma = require('../config/database');
const logger = require('../utils/logger');
const { publishToSQS } = require('../utils/sqs');
const axios = require('axios');

class PaymentService {
  /**
   * Process payment
   */
  async processPayment(paymentData) {
    try {
      const { orderId, userId, amount, paymentMethod, cardNumber } = paymentData;

      // Generate payment number
      const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create payment record with PENDING status
      let payment = await prisma.payment.create({
        data: {
          paymentNumber,
          orderId,
          userId,
          amount,
          paymentMethod: paymentMethod || 'credit_card',
          status: 'PROCESSING',
        },
      });

      logger.info(`Payment processing started: ${paymentNumber}`);

      // Simulate payment processing delay (300ms = 0.3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check card number for success/failure
      // Success only if card number is exactly 1234567812345678
      const isSuccess = cardNumber === '1234567812345678';

      if (isSuccess) {
        // Payment SUCCESS
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            transactionId,
            processedAt: new Date(),
          },
        });

        // Publish PaymentSucceeded event to SQS 
        try {
          // Get order details for email (items info)
          const orderResponse = await axios.get(
            `${process.env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}`
          );
          
          logger.info('Order Service Response:', {
            status: orderResponse.status,
            data: orderResponse.data,
            dataKeys: Object.keys(orderResponse.data),
          });
          
          const order = orderResponse.data.data || orderResponse.data.order || orderResponse.data;
          
          logger.info('Extracted Order:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            userEmail: order.userEmail,
            items: order.items,
            itemsCount: order.items ? order.items.length : 0,
          });
          
          // Build SQS payload
          const sqsPayload = {
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber,
            orderId: order.orderNumber || payment.orderId, // Use orderNumber (ORD-xxx) instead of UUID
            orderUuid: payment.orderId, // Keep UUID for internal reference
            userId: payment.userId,
            userEmail: order.userEmail || 'customer@example.com', // Include email for email lambda
            amount: parseFloat(payment.amount),
            totalAmount: parseFloat(payment.amount),
            transactionId,
            items: order.items || [], // Include items for inventory lambda and email
          };
          
          // Log payload before sending to SQS
          logger.info('Sending payload to SQS:', {
            orderId: sqsPayload.orderId,
            orderNumber: order.orderNumber,
            itemsCount: sqsPayload.items.length,
            items: sqsPayload.items,
            userEmail: sqsPayload.userEmail,
            totalAmount: sqsPayload.totalAmount,
            fullPayload: sqsPayload
          });
          
          await publishToSQS('payment.succeeded', sqsPayload);
        } catch (eventError) {
          logger.warn('Failed to publish to SQS:', eventError.message);
        }
        
        // Always update order status directly (not dependent on SQS)
        try {
          await axios.put(
            `${process.env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}/status`,
            {
              status: 'PAID',
              paymentId: payment.id
            }
          );
          logger.info(`Updated order ${payment.orderId} status to PAID`);
        } catch (apiError) {
          logger.error('Failed to update order status via API:', apiError.message);
        }

        logger.info(`Payment successful: ${paymentNumber}`);
      } else {
        // Payment FAILED
        const failureReason = 'Card declined. Invalid card number.';

        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureReason,
            processedAt: new Date(),
          },
        });

        // Publish PaymentFailed event to SQS (optional - continue even if fails)
        try {
          await publishToSQS('payment.failed', {
            paymentId: payment.id,
            paymentNumber: payment.paymentNumber,
            orderId: payment.orderId,
            userId: payment.userId,
            amount: parseFloat(payment.amount),
            failureReason,
          });
        } catch (eventError) {
          logger.warn('Failed to publish to SQS:', eventError.message);
        }
        
        // Always update order status directly (not dependent on SQS)
        try {
          await axios.put(
            `${process.env.ORDER_SERVICE_URL}/api/orders/${payment.orderId}/status`,
            {
              status: 'FAILED'
            }
          );
          logger.info(`Updated order ${payment.orderId} status to FAILED`);
        } catch (apiError) {
          logger.error('Failed to update order status via API:', apiError.message);
        }

        logger.info(`Payment failed: ${paymentNumber} - ${failureReason}`);
      }

      return payment;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    try {
      return await prisma.payment.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId) {
    try {
      return await prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching payment by order:', error);
      throw error;
    }
  }

  /**
   * Get all payments (Admin)
   */
  async getAllPayments(filters = {}) {
    try {
      const { page = 1, limit = 20, status } = filters;
      const skip = (page - 1) * limit;
      const where = {};

      if (status) where.status = status;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching all payments:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { userId },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where: { userId } }),
      ]);

      return {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching user payments:', error);
      throw error;
    }
  }

  /**
   * Refund payment (for future use)
   */
  async refundPayment(id) {
    try {
      const payment = await this.getPaymentById(id);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'SUCCESS') {
        throw new Error('Only successful payments can be refunded');
      }

      const refundedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          updatedAt: new Date(),
        },
      });

      // Publish event (optional - continue even if fails)
      try {
        await publishEvent('payment.refunded', {
          paymentId: refundedPayment.id,
          orderId: refundedPayment.orderId,
          amount: parseFloat(refundedPayment.amount),
        });
      } catch (eventError) {
        logger.warn('Failed to publish payment.refunded event:', eventError.message);
      }

      logger.info(`Payment refunded: ${refundedPayment.paymentNumber}`);
      return refundedPayment;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
