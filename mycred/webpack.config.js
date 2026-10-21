const defaults = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const shared = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

const adminConfig = {
  ...defaults,
  ...shared,
  entry: {
    settings: './src/pages/Settings/index.js',
    hooks: './src/pages/Hooks/index.js',
    logs: './src/pages/Logs/index.js',
    about: './src/pages/About/index.js',
    treasures: './src/pages/Treasures/index.js',
    tools: './src/pages/Tools/index.js',
    support: './src/pages/Support/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'assets/build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      ...defaults.module.rules,
    ],
  },
};

const loyaltyWidgetConfig = {
  ...defaults,
  ...shared,
  entry: {
    index: './includes/loyalty-widget/src/index.js',
    frontend: './includes/loyalty-widget/src/frontend-index.js',
  },
  output: {
    path: path.resolve(__dirname, 'includes/loyalty-widget/build'),
    filename: '[name].bundle.js',
  },
};

const dashboardConfig = {
  ...defaults,
  ...shared,
  entry: {
    index: './includes/dashboard/src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'includes/dashboard/build'),
    filename: '[name].bundle.js',
  },
};

const addonsConfig = {
  ...defaults,
  ...shared,
  entry: {
    admin: './addons/src/admin/index.js',
    badges: './addons/badges/src/index.js',
    coupons: './addons/coupons/src/index.js',
    ranks: './addons/ranks/src/index.js',
    'email-notices': './addons/email-notices/src/index.js',
    'buycred-gateways': './addons/buy-creds/src/gateways/index.js',
    'buycred-pending': './addons/buy-creds/src/pending/index.js',
    'cashcred-gateways': './addons/cash-creds/src/gateways/index.js',
    'cashcred-withdrawals': './addons/cash-creds/src/withdrawals/index.js',
    'banking-settings': './addons/banking/src/index.js',
    'woocommerce-settings': './addons/woocommerce/src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'addons/build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      ...defaults.module.rules,
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'],
      },
    ],
  },
};

module.exports = [adminConfig, loyaltyWidgetConfig, dashboardConfig, addonsConfig];
