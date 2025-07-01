import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),  // <-- alias @ trỏ đến src
      // '@mui/system': '@mui/system/esm'
    },
  },
})
