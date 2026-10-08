const { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getPresignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');

// Configure AWS SDK
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Use LocalStack for local development
if (process.env.AWS_ENDPOINT) {
  s3Config.endpoint = process.env.AWS_ENDPOINT;
  s3Config.forcePathStyle = true;
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  };
}

const s3 = new S3Client(s3Config);
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'product-images';

/**
 * Initialize S3 bucket
 */
const initializeBucket = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    logger.info(`S3 bucket ${BUCKET_NAME} exists`);
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404) {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        logger.info(`S3 bucket ${BUCKET_NAME} created`);
      } catch (createError) {
        logger.error('Error creating bucket:', createError);
      }
    }
  }
};

/**
 * Upload file to S3
 */
const uploadFile = async (file, key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    const location = process.env.AWS_ENDPOINT
      ? `${process.env.AWS_ENDPOINT.replace(/\/$/, '')}/${BUCKET_NAME}/${key}`
      : `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${key}`;
    logger.info(`File uploaded to S3: ${location}`);
    return location;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 */
const deleteFile = async (key) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw error;
  }
};

/**
 * Get signed URL for private file
 */
const getSignedUrl = (key, expiresIn = 3600) => {
  try {
    return getPresignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
      { expiresIn },
    );
  } catch (error) {
    logger.error('S3 signed URL error:', error);
    throw error;
  }
};

// Initialize bucket on startup (for LocalStack)
if (process.env.AWS_ENDPOINT) {
  initializeBucket();
}

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  s3,
  BUCKET_NAME,
};
