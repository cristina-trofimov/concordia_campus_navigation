/** @type {import('jest').Config} */
const config = {
  rootDir: '..',
  testTimeout: 120000,
  maxWorkers: 1,
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: [
    "**/tests/**/*.test.js",   // For JavaScript tests
    "**/tests/**/*.test.ts",   // For TypeScript tests
    "**/tests/**/*.test.tsx"   // For TypeScript JSX tests
  ],
  testPathIgnorePatterns: ["/node_modules/", "/e2e"], // Ignore these so unit tests run with unit
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest'
  },
  preset: 'react-native',  // Tells Jest to use react-native preset
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!(@react-native|react-native|@rnmapbox|@react-native-community|react-test-renderer)/).*/', // Transform these node_modules
  ],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy', // If you're using CSS, you can mock it
    '\\.png$': '<rootDir>/__mocks__/fileMock.js', // Mock image files
  },
};

module.exports = config;
