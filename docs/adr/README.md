# Architecture Decision Records

Each record captures a decision that had a real alternative, the reasoning
behind it, and what it costs. Records are immutable: a decision that no longer
holds is marked `Superseded by ADR-NNNN` rather than edited or removed.

| #                                                        | Title                                       | Status   | Date       |
| -------------------------------------------------------- | ------------------------------------------- | -------- | ---------- |
| [0001](0001-monorepo-with-pnpm-and-turborepo.md)         | Monorepo with pnpm workspaces and Turborepo | Accepted | 2026-09-17 |
| [0002](0002-tooling-enforced-architecture-boundaries.md) | Architecture boundaries enforced by tooling | Accepted | 2026-09-17 |
| [0003](0003-vitest-with-swc-over-jest.md)                | Vitest with SWC instead of Jest             | Accepted | 2026-09-17 |
| [0004](0004-verification-split-between-hooks-and-ci.md)  | Verification split between git hooks and CI | Accepted | 2026-09-17 |

## Adding a record

Copy the section headings from any existing record: Status, Context, Decision,
Alternatives considered, Consequences, Review.

Two sections carry most of the value. **Alternatives considered** must explain
why each option was rejected _in this context_, not why it is worse in general.
**Consequences** must name at least one real cost — a record listing only
benefits is advocacy, not a decision.
