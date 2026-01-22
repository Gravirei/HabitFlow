# Git Hooks

This directory contains git hooks to improve code quality and prevent security issues.

## Installation

To enable these hooks, run:

```bash
git config core.hooksPath .git-hooks
```

Or manually copy them to `.git/hooks/`:

```bash
cp .git-hooks/* .git/hooks/
chmod +x .git/hooks/*
```

## Available Hooks

### pre-commit

Prevents committing sensitive files:
- Blocks `.env` and `.env.local` files
- Warns about hardcoded credentials
- Checks for suspicious patterns

**To bypass** (not recommended):
```bash
git commit --no-verify
```

## Testing Hooks

Test the pre-commit hook:

```bash
# This should be blocked
git add .env
git commit -m "test"

# This should pass
git add README.md
git commit -m "test"
```
