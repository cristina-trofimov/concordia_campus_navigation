const createIconSet = () => 'Icon';
const MaterialCommunityIcons = () => 'MaterialCommunityIcons';
MaterialCommunityIcons.displayName = 'MaterialCommunityIcons';

module.exports = {
  MaterialCommunityIcons,
  createIconSet,
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  Entypo
  // Add any other icon sets you might be using
};

// Mock the direct import path
module.exports.MaterialCommunityIcons = MaterialCommunityIcons;