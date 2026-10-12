module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],

    // Archivo que contiene las pruebas de datos y React
    files: ["tests/.generados/pruebas.bundle.js"],

    // Mostrar resultados y cobertura
    reporters: ["progress", "coverage"],

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "lcovonly", subdir: ".", file: "lcov.info" },
      ],
    },

    // Desactivar el orden aleatorio temporalmente
    client: {
      jasmine: {
        random: true,
      },
    },

    // Ejecutar las pruebas automáticamente en Chrome
    browsers: ["ChromeHeadless"],
    singleRun: true,

    plugins: ["karma-jasmine", "karma-chrome-launcher", "karma-coverage"],
  });
};
