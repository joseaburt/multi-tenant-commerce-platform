# ADR-0003 · Vitest with SWC instead of Jest

## Status

Accepted · 2026-09-17

## Context

NestJS ships with Jest and `ts-jest` as its default test setup, and the majority
of NestJS documentation and community examples assume it. Choosing otherwise
means diverging from the path of least resistance and carrying the cost of
translating examples.

The constraint that makes this a decision rather than a default is decorator
metadata. NestJS resolves constructor dependencies at runtime by reading the
metadata TypeScript emits under `emitDecoratorMetadata`, and TypeORM resolves
column types the same way. Any test runner used here must preserve that
metadata, and the fast transpilers that make modern runners fast are precisely
the ones that discard it.

## Decision

Vitest as the test runner, with `unplugin-swc` replacing its default transform.

Vitest transpiles with esbuild, which does not emit decorator metadata. The
failure is silent at build time and surfaces at runtime as a dependency
injection error that never mentions decorators, so the cause is not
discoverable from the symptom. Swapping in SWC with `legacyDecorator` and
`decoratorMetadata` restores the emission and mirrors the compiler options
already set for services in `packages/tsconfig/nest.json`.

The configuration lives in a shared package (`packages/vitest-config`) with unit
and integration presets, so no service can reach a working test setup by
configuring it differently.

Suites are separated by filename suffix rather than by directory, keeping tests
adjacent to the code they cover. Integration runs without file parallelism,
because Testcontainers instances compete for ports and memory and produce
intermittent failures that are expensive to diagnose.

`@nestjs/testing` remains the mechanism for assembling the injection container
in end-to-end tests, where the full application is exercised through HTTP. It is
complementary rather than an alternative: it builds the module graph, Vitest
runs the file. Domain and use-case tests do not use it, because neither layer
depends on the container — that is the payoff of keeping the framework confined
to infrastructure.

## Alternatives considered

### Jest with ts-jest

The NestJS default. Every example in the framework's documentation applies
directly, and decorator metadata works without configuration.

Rejected on feedback speed. `ts-jest` type-checks each file as it transforms it,
which makes a suite materially slower than one transpiled without type checking
— and the type check is redundant here, since `check-types` already runs as a
separate CI step and in the editor. Test duration is paid on every run during
development, where the cost compounds.

### Jest with SWC (`@swc/jest`)

Removes the transform cost while keeping Jest's ecosystem and NestJS's defaults.

A defensible choice, and the closest alternative. Rejected for consistency
rather than capability: Vitest's configuration is shared with the Vite-based
tooling used elsewhere, its watch mode is faster, and its assertion API is
compatible enough that Jest examples translate with little friction. The gap
between this option and the decision is small, which is recorded here so the
choice is not overstated.

### Node's built-in test runner

No dependency, and adequate for the domain layer, which is plain TypeScript.

Rejected because it would require a second runner for the layers that need
decorator support, mocking and coverage. Two runners is worse than one
imperfect one.

## Consequences

### Positive

- Test runs are not gated on type checking, which happens once in its own step.
- Decorator metadata is guaranteed by configuration shared across every service.
- Coverage thresholds apply to domain and application only, where coverage
  reflects behaviour rather than restating what a library already guarantees.

### Negative

- **Divergence from NestJS documentation.** Official examples assume Jest.
  `@nestjs/testing` is runner-agnostic and works with Vitest, but setup
  problems have fewer directly applicable answers.
- **Two sources of truth for decorator settings.** The SWC options and the
  TypeScript compiler options must stay aligned. If they drift, tests and
  production builds behave differently, which is the worst failure mode
  available here.
- **Type errors are invisible during test runs.** Code that fails `tsc` can pass
  its tests, so a green suite locally is not a green pipeline.
- **`@swc/core` is a native binary.** It requires an explicit build allowance
  under pnpm and adds a platform-specific artifact to the install.

## Review

Revisit if any of the following holds:

- The SWC and TypeScript decorator configurations are found to have drifted,
  indicating the duplication needs a single generator.
- `@nestjs/testing` introduces a Jest-specific dependency that Vitest cannot
  satisfy.
- Decorators are replaced by an alternative wiring mechanism, which would remove
  the constraint this decision is built on.
