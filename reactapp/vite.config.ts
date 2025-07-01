import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),  // <-- alias @ trỏ đến src
      // '@mui/system': '@mui/system/esm'
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'], // THÊM MỚI: Ngăn nhiều bản sao React
  },
});