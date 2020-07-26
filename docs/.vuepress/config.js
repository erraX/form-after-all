const postCssPresetEnv = require('postcss-preset-env');

module.exports = {
  title: 'form-after-all',
  description: 'build uncontrolled, headless form in vue',
  themeConfig: {
    repo: 'erraX/form-after-all',
    repoLabel: 'Github',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Api', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: ['/guide/', '/api/', '/examples/'],
  },
  postcss: {
    plugins: [require('autoprefixer'), require('postcss-nested')],
  },
};
