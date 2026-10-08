const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Initialize SES client
const ses = new SESClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

/**
 * Lambda handler for sending order confirmation emails
 * Triggered by SQS messages after successful payment
 */
exports.handler = async (event) => {
  console.log('Email Lambda triggered');
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
      
      const { orderId, userId, userEmail, items, totalAmount } = message;
      
      // Build email content
      const itemsList = items.map(item => 
        `- ${item.productName || 'Product'} (x${item.quantity}): $${item.price}`
      ).join('\n');
      
      const emailParams = {
        Source: process.env.SENDER_EMAIL,
        Destination: {
          ToAddresses: [userEmail],
        },
        Message: {
          Subject: {
            Data: `Order Confirmation - ${orderId}`,
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: `
Dear Customer,

Thank you for your order! Your payment has been successfully processed.

Order Details:
--------------
Order ID: ${orderId}
Total Amount: $${totalAmount}

Items:
${itemsList}

Your order is being processed and will be shipped soon.

Thank you for shopping with us!

Best regards,
eCommerce Team
              `,
              Charset: 'UTF-8',
            },
            Html: {
              Data: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .items { list-style: none; padding: 0; }
    .items li { padding: 10px; border-bottom: 1px solid #eee; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Thank you for your order! Your payment has been successfully processed.</p>
      
      <div class="order-details">
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${totalAmount}</p>
        
        <h3>Items:</h3>
        <ul class="items">
          ${items.map(item => `
            <li>${item.productName || 'Product'} (x${item.quantity}): <strong>$${item.price}</strong></li>
          `).join('')}
        </ul>
      </div>
      
      <p>Your order is being processed and will be shipped soon.</p>
      <p>Thank you for shopping with us!</p>
      
      <p><strong>Best regards,</strong><br>eCommerce Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
              `,
              Charset: 'UTF-8',
            },
          },
        },
      };
      
      try {
        const command = new SendEmailCommand(emailParams);
        const response = await ses.send(command);
        
        console.log(`Email sent successfully to ${userEmail}`, {
          messageId: response.MessageId,
          orderId: orderId,
        });
        
        results.success.push({
          orderId: orderId,
          email: userEmail,
          messageId: response.MessageId,
        });
        
      } catch (error) {
        console.error(`Failed to send email to ${userEmail}:`, {
          error: error.message,
          orderId: orderId,
        });
        
        results.failed.push({
          orderId: orderId,
          email: userEmail,
          error: error.message,
        });
      }
      
    } catch (error) {
      console.error('Error processing SQS record:', {
        error: error.message,
        stack: error.stack,
      });
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
      message: 'Email processing complete',
      results: results,
    }),
  };
};
