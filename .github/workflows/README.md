# GitHub Workflows

## Autofix.ci Setup

The `autofix.yml` workflow has been temporarily removed because the [autofix.ci GitHub App](https://github.com/apps/autofix-ci/) has not been installed on this repository.

### To re-enable autofix.ci:

1. Install the [autofix.ci GitHub App](https://github.com/apps/autofix-ci/) on this repository
2. Restore the `autofix.yml` workflow file with the following content:

```yaml
name: autofix.ci

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:
  autofix:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - name: Use Node.js lts/*
        uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: pnpm

      - name: Install
        run: pnpm install

      - name: Lint
        run: pnpm run lint --fix

      - uses: autofix-ci/action@v1
```

3. Commit and push the restored workflow file

The autofix.ci action will automatically fix linting issues and push them back to your branches.
