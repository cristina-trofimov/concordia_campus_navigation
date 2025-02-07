/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/detox.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
      'android.debug': {
        type: 'android.apk',
        build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk'
      },
      'android.release': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
        build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      }
      },
  devices: {
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Android_API31',
      }
    }
  },
  configurations: {
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
