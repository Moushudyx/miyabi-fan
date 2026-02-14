import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  base: '/miyabi-fan/',
  plugins: [vue()],
  server: {
    port: 17170,
    strictPort: true,
  },
});
