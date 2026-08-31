# Git Hooks (DEPRECATED — use Husky)

This directory is **deprecated**. Pre-commit hooks are now managed by
[Husky](https://typicode.github.io/husky/) under `.husky/` and are wired
automatically by the `prepare` npm script (no manual install needed).

If you are a new contributor, run `npm install` and the pre-commit hook
will be active on every `git commit`.

## What the hook does

The current pre-commit hook (`.husky/pre-commit`):

- **Blocks** `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `*.p12`, `*.pfx` from being committed.
- **Warns** about hardcoded credential patterns in staged diffs (e.g. `password = "abcd…"`, `apiKey = "..."`).
- **Allows** the commit to proceed if you confirm `y` at the prompt.

## Why this directory still exists

It is kept as historical reference (the original hand-rolled hook lived
here). It is safe to delete once all contributors are on the husky flow.

To remove it:

```bash
rm -rf .git-hooks
```

The husky hook at `.husky/pre-commit` is the new source of truth.
