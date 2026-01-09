import { defineConfig } from 'vite'

export default defineConfig({
  // O nome do repositório DEVE ser exato (Maiúsculas/Minúsculas importam)
  base: '/Projeto-Ergo/', 
  build: {
    outDir: 'docs', // <--- ISSO É O SEGREDO
  }
})