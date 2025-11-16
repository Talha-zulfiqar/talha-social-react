import { defineConfig } from 'vite'

// Vite config tuned for local development on Windows/OneDrive paths.
// - binds explicitly to 127.0.0.1 and port 5173
// - strictPort: true so it fails fast if port is occupied
// - logLevel + clearScreen:false to surface errors when running under wrappers
// - optional polling for file watch if OneDrive/fsnotify is flaky (set USE_POLLING=1 to enable)
export default defineConfig({
  logLevel: 'info',
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      // enable polling when explicitly requested via env var
      usePolling: Boolean(process.env.USE_POLLING && process.env.USE_POLLING !== '0'),
      interval: 100
    }
  }
})
