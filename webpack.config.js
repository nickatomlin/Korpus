var path = require('path');

module.exports = {
  entry: './jsx/index.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'jsx')
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react']
      }
    }]
  }
};
