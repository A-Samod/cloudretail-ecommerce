const userService = require('../src/services/user.service');
const prisma = require('../src/config/database');

jest.mock('../src/config/database', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        cognitoUserId: 'cognito-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = { id: '1', ...userData, createdAt: new Date(), updatedAt: new Date() };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByCognitoId', () => {
    it('should return user by Cognito ID', async () => {
      const cognitoUserId = 'cognito-123';
      const mockUser = {
        id: '1',
        cognitoUserId,
        email: 'test@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserByCognitoId(cognitoUserId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { cognitoUserId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserByCognitoId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(2);

      const result = await userService.getAllUsers({ page: 1, limit: 10 });

      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = '1';
      const updateData = { firstName: 'Jane' };
      const mockUpdatedUser = { id: userId, firstName: 'Jane', email: 'test@example.com' };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = '1';
      prisma.user.delete.mockResolvedValue({ id: userId });

      const result = await userService.deleteUser(userId);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result.message).toBe('User deleted successfully');
    });
  });
});
