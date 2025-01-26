/** @type {import('jest').Config} */
const config = {
    rootDir: '..',
    testTimeout: 120000,
    maxWorkers: 1,
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    reporters: ['detox/runners/jest/reporter'],
    testEnvironment: 'detox/runners/jest/testEnvironment',
    verbose: true,
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    testMatch: ["**/tests/**/*.test.js"],//path to unit test
    testPathIgnorePatterns:["/node_modules/","/e2e"], // ignore these so unit runs with unit
};

module.exports = config;