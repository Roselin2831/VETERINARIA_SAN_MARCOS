module.exports = (config) => config.set({
  basePath: '',
  frameworks: ['jasmine'],
  files: ['tests/browser/**/*.spec.js'],
  browsers: ['ChromeHeadless'],
  singleRun: true,
  plugins: ['karma-jasmine', 'karma-chrome-launcher']
});
