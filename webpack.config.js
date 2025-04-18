const sass = require('sass');

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              sassOptions: {
                // Suppress warnings from dependencies
                quietDeps: true,
              },
            },
          },
        ],
      },
    ],
  },
};