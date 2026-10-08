const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  InitiateAuthCommand,
  AdminSetUserPasswordCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');
const awsConfig = require('../config/aws');
const logger = require('../utils/logger');

class CognitoService {
  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: awsConfig.region,
      credentials: awsConfig.credentials,
    });
    this.userPoolId = awsConfig.cognito.userPoolId;
    this.clientId = awsConfig.cognito.clientId;
    this.clientSecret = awsConfig.cognito.clientSecret;
  }

  /**
   * Create a new user in Cognito
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} [userData.password] - Permanent password (optional)
   * @returns {Promise<string>} - Cognito User ID (sub)
   */
  async createUser({ email, firstName, lastName, password }) {
    try {
      const params = {
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'given_name', Value: firstName },
          { Name: 'family_name', Value: lastName },
        ],
        DesiredDeliveryMediums: ['EMAIL'],
        MessageAction: 'SUPPRESS', // Don't send welcome email
      };

      // Create user with temporary password
      if (password) {
        params.TemporaryPassword = password;
      }

      const command = new AdminCreateUserCommand(params);
      const response = await this.client.send(command);

      // Extract the Cognito User ID (sub) from the response
      const cognitoUserId = response.User.Attributes.find(
        (attr) => attr.Name === 'sub'
      ).Value;

      // Set permanent password if provided
      if (password) {
        await this.setUserPassword(email, password);
      }

      logger.info(`Cognito user created: ${cognitoUserId} (${email})`);
      return cognitoUserId;
    } catch (error) {
      logger.error('Error creating Cognito user:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'UsernameExistsException') {
        throw new Error('A user with this email already exists in Cognito');
      }
      
      throw new Error(`Failed to create Cognito user: ${error.message}`);
    }
  }

  /**
   * Set a permanent password for a user
   * @param {string} username - Username (email)
   * @param {string} password - New password
   */
  async setUserPassword(username, password) {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      });

      await this.client.send(command);
      logger.info(`Permanent password set for user: ${username}`);
    } catch (error) {
      logger.error('Error setting user password:', error);
      throw new Error(`Failed to set user password: ${error.message}`);
    }
  }

  /**
   * Delete a user from Cognito
   * @param {string} username - Username (email) to delete
   */
  async deleteUser(username) {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      await this.client.send(command);
      logger.info(`Cognito user deleted: ${username}`);
    } catch (error) {
      logger.error('Error deleting Cognito user:', error);
      throw new Error(`Failed to delete Cognito user: ${error.message}`);
    }
  }

  /**
   * Get user details from Cognito
   * @param {string} username - Username (email) to get
   */
  async getUser(username) {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return null;
      }
      logger.error('Error getting Cognito user:', error);
      throw new Error(`Failed to get Cognito user: ${error.message}`);
    }
  }

  /**
   * Sign in a user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Authentication result with tokens
   */
  async signIn({ email, password }) {
    try {
      const authParameters = {
        USERNAME: email,
        PASSWORD: password,
      };

      if (this.clientSecret) {
        authParameters.SECRET_HASH = crypto
          .createHmac('sha256', this.clientSecret)
          .update(email + this.clientId)
          .digest('base64');
      }

      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: authParameters,
      };

      const command = new InitiateAuthCommand(params);
      const response = await this.client.send(command);

      // Check if user needs to complete new password challenge
      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        logger.info(`User ${email} needs to set a new password`);
        return {
          challenge: 'NEW_PASSWORD_REQUIRED',
          session: response.Session,
          message: 'New password required. Please set a new password.',
        };
      }

      logger.info(`User signed in successfully: ${email}`);
      return {
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        expiresIn: response.AuthenticationResult.ExpiresIn,
        tokenType: response.AuthenticationResult.TokenType,
      };
    } catch (error) {
      logger.error('Error signing in user:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password');
      }
      if (error.name === 'UserNotFoundException') {
        throw new Error('Invalid email or password');
      }
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('User account is not confirmed');
      }
      
      throw new Error(`Failed to sign in: ${error.message}`);
    }
  }
}

module.exports = new CognitoService();
