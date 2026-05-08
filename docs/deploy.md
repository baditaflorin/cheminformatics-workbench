# Deploy

GitHub Pages serves the `docs/` folder from the `main` branch.

Live URL:

```text
https://baditaflorin.github.io/cheminformatics-workbench/
```

Manual publish:

```bash
make build
git add docs public src cmd internal package.json package-lock.json
git commit -m "chore: publish pages build"
git push origin main
```

Rollback:

```bash
git revert <publishing-commit>
git push origin main
```

Custom domain:

Add `docs/CNAME` with the domain, configure DNS CNAME or ALIAS records to GitHub Pages, then verify in repository Pages settings.
