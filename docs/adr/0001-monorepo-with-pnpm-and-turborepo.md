# ADR-0001 · Monorepo with pnpm workspaces and Turborepo

## Status
Accepted · 2026-09-17

## Context

The system consists of several independently deployable services. They share no
business logic: each owns its domain model, its ports and its data. What they do
share is technical scaffolding — logging, configuration validation, correlation
propagation, AWS client adapters, test utilities — and versioned contracts for
the events and RPC calls that cross service boundaries.

The decision is where that source code lives. It is a source-organisation
decision, deliberately kept separate from deployment topology and runtime
coupling, which are decided elsewhere.

## Decision

A single repository, using pnpm workspaces for dependency resolution and
Turborepo for task orchestration.

A monorepo does not couple services; shared mutable domain code does. The two
are routinely conflated, so the boundary is enforced rather than assumed. Only
two categories of code may live in `packages/`:

- **Platform code** with no business semantics. Sharing it is equivalent to
  sharing a framework: no service changes because another service changed.
- **Versioned contracts** — event schemas and protobuf definitions. This is the
  only legitimate coupling point between services, and it is explicit. Contracts
  evolve under backward-compatibility rules, never by lockstep update.

Domain models, ports, business rules and another service's entities are never
shared. Ports belong to the application layer of the service that declares them,
which is where Clean Architecture places them. `dependency-cruiser` enforces
this: a rule forbids any `apps/*/src/domain` or `apps/*/src/application` module
from importing another service's code, and forbids `packages/*` from importing
anything under `apps/`.

Given that boundary, the monorepo is chosen for the properties it does provide:
a single source of truth for tooling, one dependency resolution, and the ability
to change a contract and both sides of it in one reviewable commit — without
implying that both sides must deploy together.

Build and deployment scope is determined by the pipeline, not by the repository
layout. Turborepo filters tasks to the packages a diff affects, and each service
is deployed by image digest, so an unchanged service produces an unchanged
digest and Kubernetes performs no rollout.

## Alternatives considered

### One repository per service (polyrepo)

Best reflects independent deployability and matches how teams organised around
services expect to work.

Rejected because it places a publish cycle on the critical path of every shared
change. With a single developer, the coordination cost a polyrepo solves does
not exist, while the cost it imposes — versioning and publishing platform
packages and contracts on every iteration — is paid from day one. It also tends
to leave consumers on stale versions: a contract published today may not reach
every service for weeks.

This becomes the correct choice once multiple teams with different release
cadences share the code.

### npm or yarn workspaces

Cover the same use case and are part of the default ecosystem.

Rejected over resolution strategy: both flatten `node_modules`, so a package can
import a dependency it never declared. Those phantom dependencies resolve
locally and fail when building the container image, where only declared
dependencies are installed. pnpm's isolated linking turns that failure into a
`pnpm install` error, which is the cheap moment to catch it.

### Nx

Offers a richer task graph, code generators and framework-specific executors.

Rejected on cost/benefit in this context. Its generators and plugins pay off
when they standardise work across teams; here they would add a layer of
abstraction over configuration this project needs to keep explicit and
readable. Turborepo does task orchestration and caching only, which is exactly
the required scope.

### A single monolithic service

Would remove the question entirely.

Rejected because the project's stated goal is to exercise inter-service
communication patterns. It remains, however, the right choice for most systems
of this size.

## Consequences

### Positive
- A contract and both sides of it change in one reviewable, revertible commit.
- Two services cannot drift onto different versions of a platform dependency.
- Tooling is defined once and inherited.

### Negative
- **Proximity invites coupling.** Physical access to another service's source
  makes an illegitimate import a one-line mistake. This is the monorepo's real
  risk and the reason the boundary is enforced by tooling in CI rather than by
  convention.
- **History and tags are shared.** Per-service releases require an independent
  versioning tool (Changesets) rather than the natural versioning a
  repository-per-artifact gives for free.
- **Blast radius of the root tooling.** A broken shared ESLint or TypeScript
  config blocks every service at once. Mitigated by the tooling living under
  the same CI gate as application code.
- **Container builds are more involved.** A Dockerfile cannot copy a single
  service directory; it needs the workspace manifests and the shared packages,
  which complicates layer caching and enlarges the build context.
- **CI cost grows with the repository, not with the change.** Addressed by
  Turborepo's `--filter`, but the mechanism has to be maintained deliberately;
  the naive setup runs everything on every change.

## Review

Revisit if any of the following holds:
- More than one team owns services in this repository and their release
  cadences diverge.
- A service requires a language or runtime outside the Node toolchain.
- CI duration on an average pull request exceeds ten minutes despite filtering.
- Anything with business semantics appears under `packages/`, which would mean
  the boundary this decision rests on has failed.
