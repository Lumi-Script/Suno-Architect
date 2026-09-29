import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    return {
      plugins: [
          react(),
          tailwindcss(),
      ],
      server: {
          proxy: {
              '/api': {
                  target: 'https://studio-api.prod.suno.com',
                  changeOrigin: true,
                  headers: {
                      'Origin': 'https://suno.com',
                      'Referer': 'https://suno.com/'
                  }
              }
          }
      }
    };
});
