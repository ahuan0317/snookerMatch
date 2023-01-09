'use strict'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// 开发环境端口(process.env：读取 .env.development 数据)
const port = process.env.port || process.env.npm_config_port || 9527

// 所有配置可参考：https://cli.vuejs.org/config/
module.exports = {
  // 相对路径, 构建出来的包存放路径
  // 1.如果计划将站点部署到https://foo.github.io/bar/, 则应将publicPath设置为" /bar/ "
  // 2.大多数情况下使用 " / "
  publicPath: './',
  // 构建出来的包输出目录
  outputDir: 'dist',
  // 静态资源目录
  assetsDir: 'static',
  // Eslint-loader检查
  lintOnSave: process.env.NODE_ENV === 'development',
  // 不需要生产环境的sourceMap，设为false加速生产环境构建
  productionSourceMap: false,
  // 用于改变原devServer配置项的默认行为
  devServer: {
    port: port, // 端口
    open: true, // 跑服务自动打开浏览器
    overlay: { // 决定浏览器可以显示的提示
      warnings: false,
      errors: true
    }
  },
  // 操作对象的形式修改webpack
  // 1.对象形式：则会通过 webpack-merge 合并到最终的配置中
  // 2.函数形式：则会接收被解析的配置作为参数
  configureWebpack: {
    // 应用程序名称(以便可以在索引中访问, html来插入正确的标题)
    name: '桌球积分赛',
    resolve: {
      // 别名配置
      alias: {
        '@': resolve('src')
      }
    }
  },
  // 链式编程的形式修改webpack
  // 1.是一个函数, 会接收一个基于 webpack-chain 的 ChainableConfig 实例
  // 2.允许对内部的 webpack 配置进行更细粒度的修改
  chainWebpack(config) {
    // 它可以提高首屏的速度，建议开启预加载
    // 1.preload：为了让当前页面的关键资源尽早被发现和加载，从而提升首屏渲染性能
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // 忽略 runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 当页面太多时，会导致太多无意义的请求
    // 1.prefetch：提前加载下一个导航所需的资源，提升下一次导航的首屏渲染性能
    config.plugins.delete('prefetch')

    // 设置 svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // 生产环境配置
    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // html-webpack-plugin：简化HTML文件的创建, 提供子插件零配置集成其他配置
          // script-ext-html-webpack-plugin：添加async，defer或module属性的<script>元素，甚至他们内联
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              // `runtime` 必须与 runtimeChunk 名称相同。默认值是 " runtime "
              inline: /runtime\..*\.js$/
            }])
            .end()
          // 抽离公用模块, 放到公共模块中。不管这个模块被多少s入口引用, 都只会在最终打包结果中出现一次, 解决代码冗余
          config
            .optimization.splitChunks({
              // 显示块范围：initial(初始块)、async(按需加载块)、all(全部块)
              // 1.initial：代表负责异步模块和非异步模块加载的公共抽离
              // 2.async：代表只负责异步模块加载的公共抽离
              // 3.all：上面两者的特点都有
              chunks: 'all',
              // 缓存组：每个 cacheGroups 代表需要抽离的第三方库
              cacheGroups: {
                libs: {
                  name: 'chunk-libs', // 抽离的模块名
                  test: /[\\/]node_modules[\\/]/, // 要扫描的node_modules文件路径
                  priority: 10, // 优先级(权重需要大于app，否则将被打包到app中)
                  chunks: 'initial' // 代表负责异步模块和非异步模块加载的公共抽离
                },
                elementUI: {
                  name: 'chunk-elementUI', // 抽离的模块名(将elementUI拆分为单个包)
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // 要扫描的node_modules文件路径(为了适应cnpm)
                  priority: 20 // 优先级(权重需要大于libs和app，否则将被打包到libs或app中)
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // 可以自定义规则
                  priority: 5, // 优先级
                  minChunks: 3, // 最小引用数
                  reuseExistingChunk: true // 表示已存在的块, 已存在的块就使用存在的, 不再重新创建
                }
              }
            })
          // 优化持久化缓存 https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          // 1.runtime 指 webpack 的运行环境(具体作用就是模块解析, 加载) 和 模块信息清单
          // 2.模块信息清单在每次有模块变更(hash 变更)时都会变更, 把这部分代码单独打包出来, 配合后端缓存策略
          // 3.这样就不会因为某个模块的变更导致包含模块信息的模块(通常会被包含在最后一个 bundle 中)缓存失效
          // 4.optimization.runtimeChunk 告诉 webpack 是否要把这部分单独打包出来
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
