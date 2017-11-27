const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      // zip up the build file
      onBuildExit: [
        'echo "zipping..."',
        'cd dist && zip ../alexa-bundle.zip * && cd ../"',
        'echo "zipped!"'
      ]
    })
  ]
}
