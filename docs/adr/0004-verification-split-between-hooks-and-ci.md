# ADR-0004 · Verification split between git hooks and CI

## Status

Accepted · 2026-09-17

## Context

The project defines several classes of verification: formatting, linting, type
checking, architecture rules, unit tests, and later integration and end-to-end
suites. Their execution costs differ by orders of magnitude — a formatting check
on staged files takes under a second, a full type-checked lint pass takes tens
of seconds, and an integration suite starts real containers.

Two constraints shape where each one runs. Git hooks are local and bypassable:
`--no-verify` skips them entirely, and no hook can therefore be a guarantee. And
a slow hook is a hook that gets bypassed, at which point it stops providing even
the fast feedback it was added for.

## Decision

Verification is split by cost, with CI as the only enforcement point.

Git hooks (Lefthook) run only what completes in seconds:

- `pre-commit`: formatting and linting, restricted to staged files.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: unit tests, filtered by Turborepo to packages affected relative to
  the target branch.

CI runs everything, against the whole repository rather than against a diff:
formatting, linting, type checking, architecture rules and unit tests, with
integration and end-to-end suites added once services exist.

The overlap is deliberate. A hook validates what is being committed; CI
validates what the branch actually contains. Since hooks are bypassable and CI
checks are required on protected branches, every rule that matters is checked in
CI regardless of whether a hook also checks it.

Prettier runs in check mode rather than write mode. A hook that rewrites files
during a commit produces a commit whose content was never reviewed.

## Alternatives considered

### Everything in hooks

Would catch every problem before it leaves the machine.

Rejected on both grounds above: a hook running type checking and integration
suites takes long enough that it will be bypassed, and even unbypassed it
guarantees nothing, because the next contributor can skip it. Local verification
that is treated as enforcement is the weakest possible arrangement — slow and
still unreliable.

### Everything in CI, no hooks

Simpler, with a single source of truth and no local configuration to install.

Rejected on feedback latency. A formatting error caught by a hook costs seconds;
the same error caught in CI costs a push, a pipeline run and a fixup commit that
pollutes the history the project is trying to keep clean.

### Hooks in write mode

Auto-formatting on commit removes the failure entirely rather than reporting it.

Rejected because it decouples what was reviewed from what was committed, and it
hides formatting drift instead of correcting its source. Reporting the failure
keeps the author's local state and the repository in agreement.

## Consequences

### Positive

- Fast feedback locally without treating local checks as a guarantee.
- Every rule is enforced at a point that cannot be bypassed.
- The most expensive suites run once per push rather than once per commit.

### Negative

- **Work is duplicated by design.** The same checks run twice, and a reader who
  does not know the reasoning will see redundancy.
- **Local and CI results can diverge.** Hooks see staged files, CI sees the
  whole repository, so a file altered outside the commit can pass locally and
  fail in CI.
- **Hooks require installation.** Lefthook is wired through a `prepare` script;
  a clone that skips install has no hooks at all, and nothing signals this.
- **Pre-push filtering depends on the target branch existing locally.** A stale
  or missing `origin/dev` reference silently changes which packages are tested.

## Review

Revisit if any of the following holds:

- Pre-push duration grows enough that it is routinely bypassed, in which case
  the unit test step moves to CI only.
- The project gains contributors, making hook installation unreliable enough
  that local checks should be abandoned in favour of CI alone.
- CI duration on an average pull request makes latency, rather than
  enforcement, the binding constraint.
