import { base } from "./base.js";

export const library = [
  ...base,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@nestjs/*"],
              message:
                "Los paquetes compartidos no dependen del framework de los servicios.",
            },
          ],
        },
      ],
    },
  },
];
