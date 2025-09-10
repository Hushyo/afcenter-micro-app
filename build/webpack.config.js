const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin'); // 处理静态资源
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 处理模板页面
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 打包css文件
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const Mfp = require('webpack').container.ModuleFederationPlugin;
const resolve = function(dir){
  return path.resolve(__dirname, '../'+dir)
}
const devMode = process.env.NODE_ENV == "development";
const mfpConfig = require('./mfp.config.js')
const supportIE = process.env.IE === 'true'
const mustBabel = !devMode && supportIE
// webpack的基本配置
module.exports = {
  entry: mustBabel ? ['babel-polyfill', './src/main.js'] : './src/main.js', // 获取入口配置
  output: {
    filename: 'assets/js/[name].[chunkhash:5].js',
    // publicPath: '', // 公用的公共路径 /
    path: resolve('./dist/' + mfpConfig.name), // 输出目录为 dist
    uniqueName: 'my-package-form-primeton-afcenter-template',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
      '@actions': resolve('src/actions'),
      '@static': resolve('static'),
      '@controller': resolve('src/actions/controller.js'),
      'vue$': 'vue/dist/vue.esm.js',
      'vue': 'vue/dist/vue.esm.js',
    },
    fallback: {
      path: require.resolve('path-browserify'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
    },
  },
  stats: {
    colors: true, // 打包时使用不同的颜色区分信息
    modules: false, // 打包时不显示具体模块信息
    entrypoints: false, // 打包时不显示入口模块信息
    children: false, // 打包时不显示子模块信息
  },
  module: {
    rules: [
      {
        test: /\.(png)|(gif)|(jpg)|(svg)|(bmp)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: 'assets/images/[name].[hash:5].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(eot)|(woff)|(ttf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              publicPath: '../../',
              limit: 1024,
              name: 'assets/fonts/[name].[hash:5].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      { test: /\.js$/, use: 'babel-loader',exclude:[
        resolve('node_modules/lodash/lodash.js'),
        resolve('node_modules/tinymce/tinymce.js'),
        resolve('node_modules/luckyexcel/dist/luckyexcel.umd.js'),
        resolve('node_modules/ali-oss/dist/aliyun-oss-sdk.js'),
        resolve('node_modules/@vue-office/excel/lib/index.js'),
        resolve('node_modules/@vue-office/pdf/lib/index.js'),
      ]},
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      template: './public/index_app.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[hash:5].css',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: resolve('static'),
          to: './static',
        },
        {
          from: resolve('public/assets'),
          to: './assets',
        },
      ],
    }),

    new VueLoaderPlugin(),
    new Mfp(mfpConfig)
  ],
};
