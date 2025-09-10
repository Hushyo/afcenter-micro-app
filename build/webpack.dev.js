const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')

// webpack的开发环境配置，从基本配置中合并
// 合并是利用 webpack-merge 完成的： https://github.com/survivejs/webpack-merge
const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  target: ['web', 'es5'], // 必须配置, 否则无法热更新代码
  // optimization: {
  //     runtimeChunk: 'single' // 必须配置, 否则无法热更新代码
  // },
  devServer: {
    open: false,
    hot: true,
    port: 8008,
    proxy: {
      // 如果开发环境中有跨域问题，在这里配置代理
      '/knowledgeBase/api': {
        target: 'http://192.168.1.252:4399',
        changeOrigin: true,
        pathRewrite: {
          '^/knowledgeBase/api': '/api'
        }
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    devMiddleware: {
      index: true,
      mimeTypes: { phtml: 'text/html' },
      publicPath: '/pyhApp',
      serverSideRender: true,
      writeToDisk: false,
    },
    client: {
      logging: 'error',
      overlay: {
        errors: true,
        warnings: false
      }
    },
    // stats: "minimal",
  },
}
module.exports = merge(baseConfig, devConfig)
