import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pxtorem from 'postcss-pxtorem'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
