const orderService = require('../services/order.service');
const logger = require('./logger');

// Simulated event listener (in production, use SQS or EventBridge)
const initEventListener = () => {
  logger.info('Event listener initialized for payment events');
  
  // In production, this would listen to SQS queue or EventBridge
  // For now, we'll handle events via direct API calls from Payment Service
};

const handlePaymentEvent = async (event) => {
  try {
    const { detailType, detail } = event;

    if (detailType === 'payment.succeeded') {
      await orderService.handlePaymentSuccess(detail);
    } else if (detailType === 'payment.failed') {
      await orderService.handlePaymentFailure(detail);
    }
  } catch (error) {
    logger.error('Error handling payment event:', error);
  }
};

module.exports = { initEventListener, handlePaymentEvent };
