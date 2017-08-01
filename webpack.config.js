var path = require('path');

module.exports = {
  entry: './jsx/server.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'js')
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react', ["env", { "targets": { "node": "current" } }]]
      }
    }]
  }
};
