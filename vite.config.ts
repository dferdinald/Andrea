import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.JPEG', '**/*.jpeg', '**/*.PNG', '**/*.png', '**/*.GIF', '**/*.gif', '**/*.WEBP', '**/*.webp', '**/*.MP3', '**/*.mp3']
})
