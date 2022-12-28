const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: () => {
    if (process.env.NODE_ENV === 'production') {
      return {
        plugins: [
          AutoImport({
            resolvers: [ElementPlusResolver()],
          }),
          Components({
            resolvers: [ElementPlusResolver()],
          }),
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/,
            threshold: 10240,
            deleteOriginalAssets: false
          })
        ]
      }
    } else {
      return {
        plugins: [
          AutoImport({
            resolvers: [ElementPlusResolver()],
          }),
          Components({
            resolvers: [ElementPlusResolver()],
          })
        ],
      }
    }
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://abs.anosu.top',
        ws: true,
        changeOrigin: true,
      }
    },
    allowedHosts: "all"
  },
  css: { extract: false, sourceMap: false }
})
