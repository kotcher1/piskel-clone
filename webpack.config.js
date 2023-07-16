const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: './src/app.js',
  output: {
    filename: '../dist/builds.js',
  },
  watch: NODE_ENV === 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.(otf|ttf|eot|woff)$/i,
        use: [
          'url-loader',
        ],
      },
    ],
  },
  devtool: 'eval-cheap-source-map',
};
