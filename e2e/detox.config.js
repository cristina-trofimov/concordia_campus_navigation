/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  testPathIgnorePatterns: ["/node_modules/", "/tests"], // ignore jest
};
const isMac = process.platform === 'darwin';

module.exports = {
  "detox": {
    "configurations": {
      // iOS Configuration (macOS)
      "ios.sim.debug": isMac ? {
        "device": {
          "type": "ios.simulator",
          "name": "iPhone 11"
        },
        "app": {
          "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/YOUR_APP.app",
          "build": "xcodebuild -workspace ios/YOUR_APP.xcworkspace -scheme YOUR_APP -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
        }
      } : undefined,

      // Android Configuration (Windows or other environments)
      "android.emu.debug": !isMac ? {
        "device": {
          "type": "android.emulator",
          "name": "Pixel_3a_API_30" // Example Android emulator
        },
        "app": {
          "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
          "build": "cd android && ./gradlew assembleDebug"
        }
      } : undefined
    }
  }
};
