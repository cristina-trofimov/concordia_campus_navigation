module.exports = {
  presets: ['module:metro-react-native-babel-preset',['@babel/preset-env', {targets: {node: 'current'}}],'@babel/preset-typescript',],
  plugins: ['@babel/plugin-transform-flow-strip-types'],

};
