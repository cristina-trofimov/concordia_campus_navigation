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
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use babel-jest for JavaScript and TypeScript files
  },
  preset: 'ts-jest',  // Tells Jest to use ts-jest to process .ts and .tsx files
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(@rnmapbox/maps)/)', // For React Native Mapbox library (if needed)
  ],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy', // If you're using CSS, you can mock it
    '\\.png$': '<rootDir>/__mocks__/fileMock.js', // Mock image files
  },
};

module.exports = config;
