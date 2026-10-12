import { build } from "esbuild";
import { transformSync } from "@babel/core";
import { mkdirSync, writeFileSync, readFileSync, realpathSync } from "node:fs";

const archivoOrigen = "src/data/mockDb.js";
const carpetaGenerados = "tests/.generados";
const archivoInstrumentado = `${carpetaGenerados}/mockDb.instrumentado.js`;
const archivoEntrada = `${carpetaGenerados}/entrada-pruebas.js`;
const archivoSalida = `${carpetaGenerados}/pruebas.bundle.js`;

// Crear la carpeta para los archivos generados
mkdirSync(carpetaGenerados, { recursive: true });

// Instrumentar mockDb.js para medir cobertura
const codigo = readFileSync(archivoOrigen, "utf8");

const resultado = transformSync(codigo, {
  filename: archivoOrigen,
  babelrc: false,
  configFile: false,
  plugins: ["babel-plugin-istanbul"],
});

writeFileSync(archivoInstrumentado, resultado.code);

// Unir las 13 pruebas de datos y las 4 de React
writeFileSync(
  archivoEntrada,
  `
  import "../../spec/mockDb.spec.js";
  import "../../spec/ProductCard.spec.jsx";
`,
);

// Preparar las pruebas para Chrome
await build({
  entryPoints: [archivoEntrada],
  bundle: true,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  outfile: archivoSalida,

  plugins: [
    {
      name: "usar-codigo-instrumentado",
      setup(build) {
        build.onResolve({ filter: /mockDb\.js$/ }, () => ({
          path: realpathSync(archivoInstrumentado),
          namespace: "file",
        }));
      },
    },
  ],
});

console.log("Pruebas Jasmine y React preparadas correctamente.");
