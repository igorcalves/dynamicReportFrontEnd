import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Escuta em todos os endereços de rede disponíveis
    port: 5173,      // Porta padrão do Vite
    open: false,     // Não abre automaticamente o navegador
    strictPort: false, // Permite tentar a próxima porta disponível se a padrão estiver em uso
  },
})
