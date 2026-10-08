module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/database.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.spec.js'],
  testTimeout: 10000,
  verbose: true,
};
