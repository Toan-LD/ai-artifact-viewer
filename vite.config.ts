import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' để bản build là file tĩnh thuần, chạy được trong Capacitor WebView / mở từ thư mục bất kỳ.
export default defineConfig({
  base: './',
  plugins: [react()],
})
