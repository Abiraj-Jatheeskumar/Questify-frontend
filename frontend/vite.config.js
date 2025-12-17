import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to inject build timestamp as app version
const injectVersionPlugin = () => {
  return {
    name: 'inject-version',
    transformIndexHtml(html) {
      // Generate version from build timestamp
      const version = Date.now().toString()
      return html.replace('__APP_VERSION__', version)
    }
  }
}

export default defineConfig({
  plugins: [react(), injectVersionPlugin()],
  server: {
    port: 8000
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

