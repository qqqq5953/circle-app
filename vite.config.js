import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default ({ mode }) => {
  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: mode === 'development' ? 8080 : 4173,
      proxy: {
        '/api': {
          target: 'http://localhost:3002/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  })
}

// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, 'src')
//     }
//   },
//   server: {
//     port: import.meta.env.DEV ? 8080 : 4173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3002/',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// })
