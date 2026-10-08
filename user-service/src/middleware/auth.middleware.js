const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logger = require('../utils/logger');
const userService = require('../services/user.service');

// JWKS client for Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Middleware to verify JWT token from AWS Cognito
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // For local development with LocalStack
    if (process.env.NODE_ENV === 'development' && process.env.AWS_ENDPOINT) {
      // Simple decode for local testing (not secure for production!)
      const decoded = jwt.decode(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      
      // Fetch user from database for development
      try {
        const cognitoUserId = decoded.sub;
        const user = await userService.getUserByCognitoId(cognitoUserId);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
          });
        }

        req.user = {
          ...decoded,
          dbUser: user,
          role: user.role,
          isActive: user.isActive,
        };
        
        return next();
      } catch (dbError) {
        logger.error('Error fetching user from database:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Failed to authenticate user',
        });
      }
    }

    // Verify token with Cognito for production
    jwt.verify(
      token,
      getKey,
      {
        issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
        algorithms: ['RS256'],
      },
      async (err, decoded) => {
        if (err) {
          logger.error('Token verification failed:', err);
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
          });
        }

        // Fetch user from database to get role and other info
        try {
          const cognitoUserId = decoded.sub;
          logger.info(`Fetching user from database with cognitoUserId: ${cognitoUserId}`);
          
          const user = await userService.getUserByCognitoId(cognitoUserId);

          if (!user) {
            logger.error(`User not found in database for cognitoUserId: ${cognitoUserId}`);
            return res.status(401).json({
              success: false,
              message: 'User not found',
            });
          }

          logger.info(`User found: ${user.email}, role: ${user.role}, isActive: ${user.isActive}`);

          // Attach both JWT claims and database user info
          req.user = {
            ...decoded,
            dbUser: user,
            role: user.role,
            isActive: user.isActive,
          };

          logger.info(`req.user after assignment:`, req.user);
          next();
        } catch (dbError) {
          logger.error('Error fetching user from database:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Failed to authenticate user',
          });
        }
      }
    );
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get role from database user (already fetched in authenticate middleware)
    const userRole = req.user.role;

    logger.info(`Authorization check: User ${req.user.sub} has role ${userRole}, required roles: ${roles.join(', ')}`);

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
