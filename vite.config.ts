import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

delete pkg.devDependencies;

// Creating regexes of the packages to make sure subpaths of the
// packages are also treated as external
const external = [
  ...externalPackages.map(
    (packageName) => new RegExp(`^${packageName}(\/.*)?`),
  ),
  'react/jsx-runtime', // add explicitly for the JSX runtime
];

export default defineConfig({
  plugins: [
    react(),
    // Generates independent .d.ts files corresponding to your entry points
    dts({
      tsconfigPath: './tsconfig.prod.json',
    }),
  ],
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    lib: {
      // Define multiple inputs as a key-value object
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        models: resolve(__dirname, 'src/models.ts'),
      },
      // Output as modern ES Modules
      formats: ['es'],
      // Name files matching the keys above (e.g., components.js, types.js)
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      // Always exclude peer dependencies so they aren't bundled into your build
      external,
      output: {
        // Enforces clean asset naming without a random content hash
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'index.css';
          return '[name].[ext]';
        },
      },
    },
  },
});
