import { base } from "./base.js";

const FRAMEWORK_AND_IO = [
  "@nestjs/*",
  "typeorm",
  "@aws-sdk/*",
  "class-validator",
  "class-transformer",
  "pino",
  "pino-*",
  "express",
  "ioredis",
];

export const nest = [
  ...base,

  // El dominio no conoce framework, ni IO, ni las capas superiores.
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: FRAMEWORK_AND_IO,
              message:
                "El dominio debe permanecer puro. Define un puerto y impleméntalo en infrastructure.",
            },
            {
              group: ["**/application/**", "**/infrastructure/**"],
              message: "El dominio no puede depender de capas externas.",
            },
          ],
        },
      ],
    },
  },

  // La aplicación orquesta el dominio a través de puertos.
  {
    files: ["src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: FRAMEWORK_AND_IO.filter((p) => p !== "@nestjs/*"),
              message:
                "Los casos de uso dependen de puertos, no de implementaciones concretas.",
            },
            {
              group: ["**/infrastructure/**"],
              message:
                "Inversión de dependencias: infrastructure implementa puertos, no al revés.",
            },
          ],
        },
      ],
    },
  },
];
