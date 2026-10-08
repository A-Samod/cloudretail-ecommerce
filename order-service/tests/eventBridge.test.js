const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const { publishEvent } = require('../src/utils/eventBridge');
const logger = require('../src/utils/logger');

// Mock AWS SDK v3
jest.mock('@aws-sdk/client-eventbridge');
jest.mock('../src/utils/logger');

describe('EventBridge Service', () => {
  let mockSend;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = jest.fn();
    EventBridgeClient.mockImplementation(() => ({
      send: mockSend,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should successfully publish an event', async () => {
    // Arrange
    const mockResponse = {
      FailedEntryCount: 0,
      Entries: [{ EventId: 'test-event-id-123' }],
    };
    mockSend.mockResolvedValue(mockResponse);

    const detailType = 'OrderCreated';
    const detail = { orderId: '12345', customerId: 'customer-1' };

    // Act
    const result = await publishEvent(detailType, detail);

    // Assert
    expect(result).toEqual(mockResponse);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutEventsCommand));
    expect(logger.info).toHaveBeenCalledWith(`Event published: ${detailType}`);
  });

  test('should handle event publishing with correct parameters', async () => {
    // Arrange
    mockSend.mockResolvedValue({ FailedEntryCount: 0 });
    const detailType = 'OrderUpdated';
    const detail = { orderId: '67890', status: 'shipped' };

    // Act
    await publishEvent(detailType, detail);

    // Assert
    const callArg = mockSend.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(PutEventsCommand);
    expect(callArg.input.Entries[0]).toMatchObject({
      Source: 'order-service',
      DetailType: detailType,
      Detail: JSON.stringify(detail),
      EventBusName: expect.any(String),
    });
  });

  test('should handle errors when event publishing fails', async () => {
    // Arrange
    const mockError = new Error('EventBridge service unavailable');
    mockSend.mockRejectedValue(mockError);

    const detailType = 'OrderDeleted';
    const detail = { orderId: '99999' };

    // Act & Assert
    await expect(publishEvent(detailType, detail)).rejects.toThrow(
      'EventBridge service unavailable'
    );
    expect(logger.error).toHaveBeenCalledWith('Error publishing event:', mockError);
  });

  test('should properly format event detail as JSON string', async () => {
    // Arrange
    mockSend.mockResolvedValue({ FailedEntryCount: 0 });
    const detailType = 'OrderCancelled';
    const detail = {
      orderId: '11111',
      reason: 'customer request',
      items: [{ id: 1, name: 'Product A' }],
    };

    // Act
    await publishEvent(detailType, detail);

    // Assert
    const callArg = mockSend.mock.calls[0][0];
    const detailParam = callArg.input.Entries[0].Detail;
    expect(detailParam).toBe(JSON.stringify(detail));
    expect(() => JSON.parse(detailParam)).not.toThrow();
  });
});
