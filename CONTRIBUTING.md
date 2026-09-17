# Contributing

## Branches

| Branch | Role                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| `main` | Production. Protected. Receives pull requests from `dev` only. Tagged `vX.Y.Z`. |
| `dev`  | Staging. Protected. Receives pull requests from working branches.               |

Working branches are short-lived and named `<type>/f<NN>-<slug>`, where `<type>`
is a Conventional Commit type and `<NN>` is the phase number, so the log reads
in the order the system was built:

```
feat/f01-catalog-walking-skeleton
infra/f04-network-and-data-layers
```

Branches are merged with `--no-ff`. Squashing is avoided deliberately: commits
here are shaped to be atomic, and squashing discards exactly the history this
repository is meant to show. Rebase onto the target branch before opening a pull
request, and clean the history first — no `wip`, no `fix typo`. Use
`git commit --fixup` with `rebase --autosquash` where needed.

## Commits

Conventional Commits, enforced by commitlint. Scope is mandatory: in a monorepo,
a subject line without a package name makes the log unreadable.

```
feat(catalog): enforce tenant scope in product repository

Row Level Security is the real guarantee, but relying on the database
alone means a missing SET LOCAL fails open until the query runs.
Scoping in the repository makes the violation impossible to express
and keeps the domain unaware of tenancy.
```

Rules:

- One commit, one reason to revert. If it cannot be reverted alone, it is
  wrongly scoped.
- The subject says what changed; the body says why. The diff already shows the
  what.
- Every commit leaves CI green, so `git bisect` stays usable.
- Tests ship in the same commit as the code they cover.

Commits are signed. Set up SSH signing before your first commit:

```bash
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
git config commit.gpgsign true
```

Upload the same key to GitHub as a **signing key**, which is a separate entry
from an authentication key.

## Decisions

Any choice with a real alternative gets a record in `docs/adr/`, committed in
the same pull request as the change it justifies. See `docs/adr/README.md`.

## Verification

```bash
pnpm install          # installs hooks via the prepare script
pnpm format:check
pnpm lint
pnpm check-types
pnpm check:arch
pnpm test:unit
```

Hooks run a fast subset locally; CI runs all of it against the whole
repository. The overlap is intentional — see ADR-0004.
