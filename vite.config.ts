import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pxtorem from 'postcss-pxtorem'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 监听所有地址，包括局域网地址
    port: 5173, // 可以指定端口，默认是 5173
    open: true, // 自动打开浏览器（可选）
  },
  css: {
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 37.5, // 设计稿宽度375px时，1rem = 37.5px；如果是750px设计稿，则设为75
          propList: ['*'], // 所有属性都转换
          selectorBlackList: ['.ignore'], // 忽略的类名，如 .ignore-rem
          replace: true,
          mediaQuery: false,
          minPixelValue: 10, // 小于1px的不转换
        }),
      ],
    },
  },
})
