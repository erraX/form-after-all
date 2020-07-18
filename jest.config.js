module.exports = {
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue', 'json'],
  transform: {
    '^.+\\.(tsx?|jsx?)$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
  },
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
};
