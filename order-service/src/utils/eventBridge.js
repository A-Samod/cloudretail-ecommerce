const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const logger = require('./logger');

const eventBridgeConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.AWS_ENDPOINT) {
  eventBridgeConfig.endpoint = process.env.AWS_ENDPOINT;
  eventBridgeConfig.credentials = {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  };
}

const eventBridge = new EventBridgeClient(eventBridgeConfig);
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'ecommerce-events';

const publishEvent = async (detailType, detail) => {
  try {
    const params = {
      Entries: [
        {
          Source: 'order-service',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };

    const command = new PutEventsCommand(params);
    const result = await eventBridge.send(command);
    logger.info(`Event published: ${detailType}`);
    return result;
  } catch (error) {
    logger.error('Error publishing event:', error);
    throw error;
  }
};

module.exports = { publishEvent };
