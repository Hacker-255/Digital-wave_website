import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:4200',
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor';
          if (id.includes('node_modules/@clerk/')) return 'clerk';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/framer-motion')) return 'ui';
          if (id.includes('node_modules/socket.io')) return 'socket';
          if (id.includes('node_modules/reactflow') || id.includes('node_modules/@reactflow')) return 'workflow';
        },
      },
    },
  },
});
