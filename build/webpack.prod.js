const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 清除 dist 目录
const prodConfig = {
  mode: 'production',
  optimization: {
    "sideEffects": false,
    splitChunks: {
      minimizer: [
        new TerserPlugin({
          // 自定义配置选项（可选）
          terserOptions: {
            compress: {
              drop_console: true, // 移除所有 console.log
              pure_funcs: ['console.info'], // 移除特定函数（如 console.info）
            },
            format: {
              comments: false, // 移除注释
            },
          },
          extractComments: false, // 不生成单独的注释文件
        }),
      ],
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
}
module.exports = merge(baseConfig, prodConfig)
