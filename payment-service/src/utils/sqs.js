const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const logger = require('./logger');

// Initialize SQS client
const sqsClient = new SQSClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

// Support both single queue (legacy) and multiple queues (new)
const QUEUE_URL = process.env.SQS_QUEUE_URL;
const EMAIL_QUEUE_URL = process.env.EMAIL_QUEUE_URL;
const INVENTORY_QUEUE_URL = process.env.INVENTORY_QUEUE_URL;

/**
 * Publish message to SQS queue
 * @param {string} eventType - Type of event (e.g., 'payment.succeeded')
 * @param {object} data - Event data
 */
async function publishToSQS(eventType, data) {
  const queues = [];
  
  if (EMAIL_QUEUE_URL && INVENTORY_QUEUE_URL) {
    // separate queues for email and inventory
    queues.push({ name: 'email', url: EMAIL_QUEUE_URL });
    queues.push({ name: 'inventory', url: INVENTORY_QUEUE_URL });
    logger.info('Using separate queues for email and inventory');
  } else if (QUEUE_URL) {
    // Legacy setup: single queue for both
    queues.push({ name: 'main', url: QUEUE_URL });
    logger.info('Using single shared queue (legacy mode)');
  } else {
    logger.warn('No SQS queues configured - skipping SQS publish');
    return false;
  }

  const message = {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...data,
  };

  let successCount = 0;
  const results = [];

  // Publish to all configured queues
  for (const queue of queues) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queue.url,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: eventType,
          },
        },
      });

      const response = await sqsClient.send(command);
      
      logger.info(`Published ${eventType} to ${queue.name} queue`, {
        messageId: response.MessageId,
        orderId: data.orderId,
        queue: queue.name,
      });

      successCount++;
      results.push({ queue: queue.name, success: true, messageId: response.MessageId });
    } catch (error) {
      logger.error(`Failed to publish to ${queue.name} queue:`, {
        error: error.message,
        eventType,
        orderId: data.orderId,
        queue: queue.name,
      });
      results.push({ queue: queue.name, success: false, error: error.message });
    }
  }

  logger.info(`Published to ${successCount}/${queues.length} queues`, { results });
  return successCount > 0;
}

module.exports = { publishToSQS };
