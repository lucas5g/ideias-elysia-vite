import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from "vite-tsconfig-paths"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // base:'./',
  // server: {
  //   allowedHosts:[
  //     "hatty-towns-tell.loca.lt", "chatty-towns-tell.loca.lt"
  //   ]
  // },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          chakra: ['@chakra-ui/react']
        }
      }
    }

  }
})
