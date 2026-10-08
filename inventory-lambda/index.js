const axios = require('axios');

// Get Inventory Service URL from environment variable 
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;

/**
 * Lambda handler for inventory updates
 * Triggered by SQS messages after successful payment
 */
exports.handler = async (event) => {
  console.log('Inventory Lambda triggered');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const results = {
    success: [],
    failed: [],
  };
  
  // Process each SQS record
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      console.log('Processing message:', message);
      
      // Only process payment.succeeded events
      if (message.type !== 'payment.succeeded') {
        console.log(`Skipping message type: ${message.type}`);
        continue;
      }
      
      const { orderId, items } = message;
      
      if (!items || items.length === 0) {
        console.log('No items to process');
        continue;
      }
      
      // Confirm sale for each item in the order
      for (const item of items) {
        try {
          const url = `${INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/confirm-sale`;
          
          console.log(`Confirming inventory for product ${item.productId}`);
          
          const response = await axios.post(url, {
            quantity: item.quantity,
            orderId: orderId,
          }, {
            timeout: 5000, // 5 second timeout
          });
          
          console.log(`Inventory confirmed for product ${item.productId}: ${item.quantity} units`);
          
          results.success.push({
            productId: item.productId,
            quantity: item.quantity,
            orderId: orderId,
          });
          
        } catch (error) {
          console.error(`Failed to confirm inventory for product ${item.productId}:`, {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          
          results.failed.push({
            productId: item.productId,
            quantity: item.quantity,
            orderId: orderId,
            error: error.message,
          });
          
          // Continue with other items even if one fails
        }
      }
      
    } catch (error) {
      console.error('Error processing SQS record:', {
        error: error.message,
        stack: error.stack,
      });
      
      // Don't throw - allow other records to process
    }
  }
  
  console.log('Processing complete:', {
    total: results.success.length + results.failed.length,
    success: results.success.length,
    failed: results.failed.length,
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Inventory processing complete',
      results: results,
    }),
  };
};
