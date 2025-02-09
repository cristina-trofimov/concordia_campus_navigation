module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
      'react-native-reanimated/plugin', // If you're using Reanimated, ensure this plugin is present
    ],
};