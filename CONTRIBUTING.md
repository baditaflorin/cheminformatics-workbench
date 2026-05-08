# Contributing

Thanks for improving Cheminformatics Workbench.

## Local Setup

```bash
npm install
make install-hooks
make data
make dev
```

Use Conventional Commits:

```text
feat: add descriptor panel
fix: handle empty SDF upload
data: regenerate v1 artifacts
```

## Checks

Run these before pushing:

```bash
make lint
make test
make build
make smoke
```

Do not commit secrets, `.env` files, private keys, generated credentials, or private hostnames.
