const userService = require('../services/user.service');
const cognitoService = require('../services/cognito.service');
const logger = require('../utils/logger');

class UserController {
  /**
   * @desc Create user profile
   * @route POST /api/users
   * @access Public
   */
  async createUser(req, res, next) {
    try {
      const { email, firstName, lastName, phone, address, city, state, zipCode, country, password } = req.body;

      // Step 1: Check if user already exists in database by email
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Step 2: Create user in Cognito
      let cognitoUserId;

      try {
        cognitoUserId = await cognitoService.createUser({
          email,
          firstName,
          lastName,
          password: password, // This will be set as permanent password
        });
      } catch (cognitoError) {
        logger.error('Failed to create Cognito user:', cognitoError);
        return res.status(500).json({
          success: false,
          message: cognitoError.message || 'Failed to create user in authentication system',
        });
      }

      // Step 3: Create user profile in database with Cognito ID
      let user;
      try {
        user = await userService.createUser({
          cognitoUserId,
          email,
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          zipCode,
          country,
        });
      } catch (dbError) {
        // Rollback: Delete the Cognito user if database creation fails
        logger.error('Failed to create user in database, rolling back Cognito user:', dbError);
        try {
          await cognitoService.deleteUser(email);
        } catch (rollbackError) {
          logger.error('Failed to rollback Cognito user:', rollbackError);
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile',
        });
      }

      res.status(201).json({
        success: true,
        message: 'User profile created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get current user profile
   * @route GET /api/users/me
   * @access Private
   */
  async getCurrentUser(req, res, next) {
    try {
      // User is already fetched in authenticate middleware
      const user = req.user.dbUser;

      // Format address as object for frontend
      const formattedUser = {
        ...user,
        address: {
          street: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          country: user.country || '',
        },
      };

      res.json({
        success: true,
        data: formattedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get user by ID
   * @route GET /api/users/:id
   * @access Private (Admin only)
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Get all users
   * @route GET /api/users
   * @access Private (Admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page, limit, role, isActive } = req.query;
      const result = await userService.getAllUsers({ page, limit, role, isActive });

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Update user profile
   * @route PUT /api/users/me
   * @access Private
   */
  async updateCurrentUser(req, res, next) {
    try {
      // User is already fetched in authenticate middleware
      const user = req.user.dbUser;

      const { firstName, lastName, phone, address, city, state, zipCode, country, avatar } = req.body;

      // Handle address object if sent from frontend
      const updateData = {
        firstName,
        lastName,
        phone,
        avatar,
      };

      // If address is an object, extract the fields
      if (address && typeof address === 'object') {
        updateData.address = address.street;
        updateData.city = address.city || city;
        updateData.state = address.state || state;
        updateData.zipCode = address.zipCode || zipCode;
        updateData.country = address.country || country;
      } else {
        // If address is a string or individual fields are provided
        updateData.address = address;
        updateData.city = city;
        updateData.state = state;
        updateData.zipCode = zipCode;
        updateData.country = country;
      }

      const updatedUser = await userService.updateUser(user.id, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Update user by ID
   * @route PUT /api/users/:id
   * @access Private (Admin only)
   */
  async updateUserById(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await userService.updateUser(id, updateData);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Delete user account (GDPR)
   * @route DELETE /api/users/me
   * @access Private
   */
  async deleteCurrentUser(req, res, next) {
    try {
      // User is already fetched in authenticate middleware
      const user = req.user.dbUser;

      await userService.deleteUser(user.id);

      res.json({
        success: true,
        message: 'User account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Delete user by ID
   * @route DELETE /api/users/:id
   * @access Private (Admin only)
   */
  async deleteUserById(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc Sign in user
   * @route POST /api/users/signin
   * @access Public
   */
  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;

      // Authenticate with Cognito
      const authResult = await cognitoService.signIn({ email, password });

      // Check if new password is required
      if (authResult.challenge === 'NEW_PASSWORD_REQUIRED') {
        return res.status(200).json({
          success: true,
          challenge: authResult.challenge,
          session: authResult.session,
          message: authResult.message,
        });
      }

      res.json({
        success: true,
        message: 'Signed in successfully',
        data: {
          accessToken: authResult.accessToken,
          idToken: authResult.idToken,
          refreshToken: authResult.refreshToken,
          expiresIn: authResult.expiresIn,
          tokenType: authResult.tokenType,
        },
      });
    } catch (error) {
      logger.error('Sign in error:', error);
      
      // Return appropriate error response
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      
      next(error);
    }
  }
}

module.exports = new UserController();
