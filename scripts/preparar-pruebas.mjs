import { build } from 'esbuild';
import { transformSync } from '@babel/core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const directory = 'tests/.generados';
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/entrada-pruebas.js`, [
  'mockDb.spec.js', 'ProductCard.spec.jsx', 'api.spec.js', 'access.spec.jsx'
].map(name => `import '../../spec/${name}';`).join('\n'));

await build({
  entryPoints: [`${directory}/entrada-pruebas.js`],
  bundle: true, format: 'iife', platform: 'browser', jsx: 'automatic',
  define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: 'http://localhost:8080/api/v1', DEV: false }) },
  outfile: `${directory}/pruebas.bundle.js`,
  plugins: [{
    name: 'coverage-production-code',
    setup(build) {
      build.onLoad({ filter: /[\\/]src[\\/].*\.[jt]sx?$/ }, ({ path }) => {
        const result = transformSync(readFileSync(path, 'utf8'), {
          filename: path, babelrc: false, configFile: false,
          parserOpts: { plugins: ['jsx'] }, plugins: ['babel-plugin-istanbul']
        });
        return { contents: result.code, loader: 'jsx' };
      });
    }
  }]
});
console.log('Pruebas preparadas con cobertura de los servicios y componentes reales.');
