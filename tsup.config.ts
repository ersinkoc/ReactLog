import { defineConfig } from 'tsup'

export default defineConfig([
  // Main entry
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    minify: false,
    splitting: false,
  },
  // Plugins entry
  {
    entry: ['src/plugins/index.ts'],
    outDir: 'dist/plugins',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    minify: false,
    splitting: false,
  },
])
