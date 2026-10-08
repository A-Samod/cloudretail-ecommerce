const prisma = require('../config/database');
const logger = require('../utils/logger');

class UserService {
  /**
   * Create a new user profile
   */
  async createUser(userData) {
    try {
      const user = await prisma.user.create({
        data: userData,
      });
      logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by Cognito ID
   */
  async getUserByCognitoId(cognitoUserId) {
    try {
      const user = await prisma.user.findUnique({
        where: { cognitoUserId },
      });
      return user;
    } catch (error) {
      logger.error('Error fetching user by Cognito ID:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, role, isActive } = filters;
      const skip = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(id, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      logger.info(`User updated: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user (GDPR compliance)
   */
  async deleteUser(id) {
    try {
      await prisma.user.delete({
        where: { id },
      });
      logger.info(`User deleted: ${id}`);
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      logger.info(`User deactivated: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
