const devMode = process.env.NODE_ENV === 'development'
const appName = 'pyhApp'
module.exports = {
  name: appName,
  shared: {
    vue: {
      requiredVersion: '^2.7.8',
      singleton: true,
      eager: true,
    },
  },
  filename: `remoteEntry.js`,
  exposes: { // 对外暴露的模块（页面)
    './knowledgeBase': './src/views/knowledgeBase/index.vue',
    './store': './src/store/index.js', // 默认将子应用 store 导出,供base应用注册
    './index': './src/index.vue',
  },
  remotes: {
    base: devMode? 'base@http://10.15.15.151:13082/remoteEntry.js':'base@../remoteEntry.js'
  },
}
