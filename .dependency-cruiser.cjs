/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Un ciclo entre módulos hace imposible razonar sobre el orden de inicialización y suele indicar que falta una abstracción.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-stays-pure',
      severity: 'error',
      comment: 'El dominio no conoce framework, persistencia ni proveedores. Define un puerto e impleméntalo en infrastructure.',
      from: { path: '^apps/[^/]+/src/domain' },
      to: {
        pathNot: '^(apps/[^/]+/src/domain|packages/core/src)',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'application-depends-on-ports',
      severity: 'error',
      comment: 'Inversión de dependencias: infrastructure implementa puertos, la aplicación nunca los conoce al revés.',
      from: { path: '^apps/[^/]+/src/application' },
      to: { path: '^apps/[^/]+/src/infrastructure' },
    },
    {
      name: 'ports-declare-only',
      severity: 'error',
      comment: 'packages/ports contiene únicamente interfaces. Cualquier dependencia de runtime lo convierte en implementación.',
      from: { path: '^packages/ports/src' },
      to: {
        pathNot: '^packages/(ports|core)/src',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'core-is-standalone',
      severity: 'error',
      comment: 'packages/core es el vocabulario compartido. Si depende de otro paquete interno, deja de ser la base.',
      from: { path: '^packages/core/src' },
      to: { pathNot: '^packages/core/src' },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Módulo que nadie importa. Suele ser residuo de un refactor.',
      from: {
        orphan: true,
        pathNot: ['\\.d\\.ts$', '(^|/)(index|main)\\.ts$', '\\.config\\.(ts|js|mjs|cjs)$'],
      },
      to: {},
    },
    {
      name: 'no-dev-deps-in-src',
      severity: 'error',
      comment: 'Una devDependency importada desde src falla en el contenedor de producción.',
      from: { path: '^(apps|packages)/[^/]+/src', pathNot: '\\.spec\\.ts$' },
      to: { dependencyTypes: ['npm-dev'] },
    },
    {
      name: 'no-cross-service-imports',
      severity: 'error',
      comment: 'Un servicio nunca importa código de otro. Comunícate por contrato: evento, RPC o API.',
      from: { path: '^apps/([^/]+)/src' },
      to: { path: '^apps/(?!$1)[^/]+/src' },
    },
    {
      name: 'packages-never-import-apps',
      severity: 'error',
      comment: 'Las dependencias apuntan hacia dentro. Un paquete compartido que importa un servicio invierte la relación y acopla a todos los demás.',
      from: { path: '^packages/[^/]+/src' },
      to: { path: '^apps/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|coverage|\\.turbo)/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require'] },
    reporterOptions: {
      dot: { collapsePattern: '^(apps|packages)/[^/]+/src/[^/]+' },
    },
  },
};
