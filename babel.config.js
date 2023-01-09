// 确保 JavaScript 代码兼容所有的浏览器，比如 IE 11
module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    'development': {
      // babel插件动态导入节点插件只做一件事：将所有 import 转换为require
      // 当有大量页面时, 该插件可以显著提高热更新速度
      // https://panjiachen.github.io/vue-element-admin-site/guide/advanced/lazy-loading.html
      'plugins': ['dynamic-import-node']
    }
  }
}
