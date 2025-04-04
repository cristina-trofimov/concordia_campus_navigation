// tests/_mocks_/expo-modules-core.js
module.exports = {
  requireNativeModule: function (moduleName) {
    // Return a dummy module or an empty object as needed.
    return {};
  },
  requireOptionalNativeModule: function (moduleName) {
    return null;
  },
  Camera: {},
  MarkerView: {},
  MapView: function () {
    return null;
  },
};
