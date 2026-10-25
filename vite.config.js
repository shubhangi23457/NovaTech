import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
base: '/NovaTech/',
plugins: [react()],
build: {
rollupOptions: {
output: {
manualChunks: {
react: ['react', 'react-dom', 'react-router-dom'],
},
},
},
},
test: {
environment: 'jsdom',
globals: true,
setupFiles: './src/test/setup.js',
css: false,
},
});
