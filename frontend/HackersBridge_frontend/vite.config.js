import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   hmr: {
  //     protocol: 'wss', // Force WebSocket Secure
  //     host: '5788-183-83-157-194.ngrok-free.app', // Your ngrok URL
  //     clientPort: 443, // Default HTTPS port
  //   },
  //   proxy: {
  //     '/api': {
  //       target: 'https://6188-183-83-157-194.ngrok-free.app', // Backend ngrok URL
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
  server :{
    allowedHosts: ["5788-183-83-157-194.ngrok-free.app"], // Add your ngrok host here
    host : '0.0.0.0', 
    port : 8080
  },
  build: {
    outDir: '../static/', // Moves the built files into Django's static folder
    assetsDir: 'assets', // Ensures files go into static/assets
  },
  // server: {
  //   historyApiFallback: true, // Ensures React handles frontend routes
  // },
})
