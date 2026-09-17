# ADR-0002 · Architecture boundaries enforced by tooling

## Status

Accepted · 2026-09-17

## Context

This project applies Clean Architecture: the domain layer holds business rules
and knows nothing of frameworks or infrastructure, the application layer
orchestrates the domain through ports it declares itself, and the infrastructure
layer implements those ports and owns every dependency on NestJS, TypeORM and
the AWS SDK.

Layered architectures degrade in a predictable way. Nothing prevents an import
that points the wrong way, so the first violation is introduced under time
pressure, survives review, and becomes the precedent for the next one. Within a
few months the directory names still describe the intended architecture while
the import graph describes something else. The failure is not that developers
disagree with the layering; it is that the layering is an intention rather than
a constraint.

## Decision

The layering is expressed as machine-checked rules that run in CI and fail the
build on violation.

Two tools are used, with distinct responsibilities:

- **ESLint** (`no-restricted-imports`, scoped by file path) enforces layering
  within a package. It reports violations in the editor as the code is written,
  which is where the feedback is cheapest.
- **dependency-cruiser** enforces properties of the dependency graph that are
  invisible file by file: circular dependencies, imports between services,
  shared packages importing services, and development dependencies reaching
  production source.

The rules are introduced before the first source file exists. Adding them to a
populated repository surfaces pre-existing violations, which are then downgraded
to warnings and never fixed.

Type-only imports are excluded from the domain rule. An `import type` is erased
at compile time and creates no runtime dependency.

No exceptions are granted for convenience. The application layer may not import
NestJS even to annotate a use case as injectable; use cases are plain classes,
wired through explicit factory providers in the infrastructure layer. A boundary
with a carve-out is a convention, not a boundary.

## Alternatives considered

### Code review

The conventional answer, and the one that requires no tooling.

Rejected because it does not scale with attention. An import statement is one
line among a hundred in a diff, and the reviewer here is the author. More
fundamentally, review catches violations at the point where reverting them is
already expensive; a lint rule catches them before they are written.

Review remains essential for everything these rules cannot express: whether a
port is the right abstraction, whether an invariant belongs in the domain.

### A separate package per layer

Each layer as its own workspace package, with the boundary enforced by the
dependency graph rather than by path-based rules.

Rejected as disproportionate. It would produce four packages per service with
their own manifests, build steps and version references, and the dependency
graph is already checked by dependency-cruiser without that overhead. It is the
right approach when layers are genuinely reusable across services, which is not
the case here — each service owns its own domain.

### dependency-cruiser only

Would avoid maintaining two overlapping configurations.

Rejected because its feedback arrives in CI rather than in the editor. The cost
of a violation rises sharply with the delay in reporting it: rewriting an import
while writing it is free, and after a push it is a new commit.

### ESLint only

Simpler, and covers the majority of cases.

Rejected because ESLint evaluates one file at a time and therefore cannot detect
circular dependencies, which are the class of problem most likely to force a
structural rewrite.

## Consequences

### Positive

- Architectural violations fail the build rather than depending on vigilance.
- The claim "the domain has no framework dependencies" is verifiable by running
  a command, not by reading the code.
- New rules can be added as the architecture gains constraints, and each
  addition is a reviewable commit with a rationale.

### Negative

- **Two overlapping configurations to maintain.** A new layer or package must be
  reflected in both tools, and it is possible for them to disagree.
- **Type-aware linting is slow.** `strictTypeChecked` with `projectService`
  makes a full pass materially slower than a syntactic one, on every pull
  request.
- **Rules encode structure, not intent.** They prove the domain imports nothing
  forbidden; they cannot prove the domain contains the right logic. A service
  can satisfy every rule and still be poorly designed.
- **Path-based rules are brittle under restructuring.** Renaming a layer
  directory silently disables the rules that target it, since a rule that
  matches nothing reports no violations.

## Review

Revisit if any of the following holds:

- A violation is found that both tools failed to detect, indicating the rules
  encode the wrong invariant.
- Lint duration becomes the dominant cost of a pull request.
- A service is added whose structure does not fit the domain / application /
  infrastructure split, making the path-based rules inapplicable.
