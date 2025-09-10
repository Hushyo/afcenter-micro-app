// webpack.prod.analyze.js
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer'); 

const prodConfig =  require('./webpack.prod');
// 智能合并webpack common配置

module.exports = merge(prodConfig,{
  mode:'production',
  plugins:[
    // window.ENV = "production"
    new webpack.DefinePlugin({NODE_ENV:JSON.stringify('production')}),
    new webpack.DefinePlugin({npm_config_report:true}),
    // 性能分析，仅在npm run analyze
    new BundleAnalyzerPlugin()
  ]
});