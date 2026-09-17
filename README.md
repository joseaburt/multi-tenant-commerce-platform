# Multi Tenant Commerce Platform

A multi-tenant commerce SaaS built as a set of NestJS microservices on AWS.
Merchants are tenants: each owns its catalogue, its orders and its data, served
from shared infrastructure.

The system is a vehicle for two things — production-grade AWS provisioning
(Terraform, EKS, CI/CD, observability, cost control) and the microservice
patterns that make independently deployable services work. Every non-obvious
choice is recorded in [`docs/adr`](docs/adr/README.md).

## Status

Built in phases. This section tracks what exists today, not what is planned.

| Phase | Scope                                   | Status      |
| ----- | --------------------------------------- | ----------- |
| F0    | Monorepo foundation, tooling, CI        | In progress |
| F1    | First service, end to end               | Not started |
| F2    | Tenant isolation                        | Not started |
| F3    | Authentication and public contract      | Not started |
| F4    | AWS base infrastructure                 | Not started |
| F5    | Cluster and continuous deployment       | Not started |
| F6    | Second service, inter-service contracts | Not started |
| F7    | Asynchronous messaging                  | Not started |
| F8    | Checkout saga                           | Not started |
| F9    | Media pipeline                          | Not started |
| F10   | Observability                           | Not started |
| F11   | Scaling and high availability           | Not started |
| F12   | Production release                      | Not started |

**Today the repository contains tooling only.** No service has been written yet.

## Getting started

Requires Node (version pinned in `.nvmrc`) and pnpm via corepack.

```bash
pnpm install
```

This also installs the git hooks. To run the full verification suite:

```bash
pnpm format:check
pnpm lint
pnpm check-types
pnpm check:arch
pnpm test:unit
```

## Repository layout

```
apps/        deployable services
packages/    shared tooling and platform code, no business logic
docs/adr/    architecture decision records
```

`packages/` holds only technical scaffolding and versioned contracts. Domain
models, ports and business rules belong to the service that owns them, and
`dependency-cruiser` enforces that boundary — see
[ADR-0001](docs/adr/0001-monorepo-with-pnpm-and-turborepo.md).

## Architecture

Each service follows Clean Architecture: `domain` holds business rules and
imports nothing, `application` orchestrates the domain through ports it declares
itself, `infrastructure` implements those ports and owns every dependency on
NestJS, TypeORM and the AWS SDK.

The layering is verified by ESLint and `dependency-cruiser` in CI rather than by
review — see [ADR-0002](docs/adr/0002-tooling-enforced-architecture-boundaries.md).

## Contributing

Branching, commit and review conventions are in
[CONTRIBUTING.md](CONTRIBUTING.md).
