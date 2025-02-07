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
  /*apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && call gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      reversePorts: [
        8081
      ]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && gradlew.bat assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..'
    }
  }, */
  apps: {
      'android.debug': {
        type: 'android.apk',
        build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
        //build: 'cd android && gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',

        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        //testBinaryPath: 'custom/path/to/app-debug-androidTest.apk'
        reversePorts: [
            8081
        ]
      },
      'android.release': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
        //build: 'cd android && gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
        build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
        //testBinaryPath: 'custom/path/to/app-release-androidTest.apk'
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
        avdName: 'TestEmulator'
        emulatorLaunchArgs: "-accel off -feature Vulkan=false -gpu swiftshader_indirect"
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
