const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('./logger');

// Configure AWS EventBridge client
// Uses environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
const client = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'ecommerce-events';

/**
 * Publish event to AWS EventBridge
 * @param {string} detailType - Event type (e.g., 'payment.succeeded')
 * @param {object} detail - Event payload
 * @returns {Promise<object>} EventBridge response
 */
const publishEvent = async (detailType, detail) => {
  const params = {
    Entries: [
      {
        EventBusName: EVENT_BUS_NAME,
        Source: 'payment.service',
        DetailType: detailType,
        Detail: JSON.stringify(detail),
        Time: new Date(),
      },
    ],
  };

  try {
    const command = new PutEventsCommand(params);
    const response = await client.send(command);

    if (response.FailedEntryCount > 0) {
      logger.error('Failed to publish event to EventBridge:', {
        failedCount: response.FailedEntryCount,
        entries: response.Entries,
      });
      throw new Error(`EventBridge: ${response.FailedEntryCount} entries failed`);
    }

    logger.info(`Event published to EventBridge: ${detailType}`, {
      eventId: response.Entries[0]?.EventId,
      detailType,
    });

    return response;
  } catch (error) {
    logger.error('Error publishing event to EventBridge:', {
      error: error.message,
      detailType,
    });
    throw error;
  }
};

module.exports = { publishEvent };
