import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [svelte()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, 'src/renderer/src/lib'),
        '$lib/*': path.resolve(__dirname, 'src/renderer/src/lib/*')
      }
    }
  }
})
