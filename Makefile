SHELL := /bin/bash
VERSION := $(shell node -p "require('./package.json').version")
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
GO_PACKAGES := $(shell go list ./... | grep -v '/node_modules/')

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge

help:
	@printf "%s\n" \
		"make install-hooks     wire .githooks" \
		"make dev               run frontend dev server" \
		"make build             build Pages-ready docs/" \
		"make data              regenerate static data artifacts" \
		"make test              run unit tests" \
		"make test-integration  run Playwright e2e" \
		"make smoke             build and smoke test" \
		"make lint              run linters" \
		"make fmt               autoformat" \
		"make pages-preview     serve docs/ like Pages" \
		"make release           tag v$(VERSION)" \
		"make clean             remove build artifacts"

install-hooks:
	git config core.hooksPath .githooks

dev:
	npm run dev

build: data
	rm -rf docs/assets
	VITE_APP_COMMIT=$(COMMIT) npm run build
	go run ./cmd/build-artifacts --source_commit=$(COMMIT) --output=docs/data/v1
	test -f docs/index.html
	test -f docs/404.html

data:
	go run ./cmd/build-artifacts --source_commit=$(COMMIT) --output=public/data/v1

test:
	go test $(GO_PACKAGES)
	npm run test

test-integration:
	npx playwright test --config playwright.config.ts

smoke:
	./scripts/smoke.sh

lint:
	go vet $(GO_PACKAGES)
	npm run lint
	npm run typecheck
	npm run format:check

fmt:
	gofmt -w cmd internal
	npm run format

pages-preview: build
	npm run preview

release: build
	git tag v$(VERSION)

clean:
	rm -rf docs coverage dist-data tmp

hooks-pre-commit:
	gofmt -w cmd internal
	go vet $(GO_PACKAGES)
	npm run lint
	npm run typecheck
	npm run format:check
	if command -v gitleaks >/dev/null 2>&1; then gitleaks protect --staged --redact; else echo "gitleaks not installed; skipping secret scan"; fi

hooks-commit-msg:
	@scripts/validate-conventional-commit.sh "$${COMMIT_EDITMSG:-.git/COMMIT_EDITMSG}"

hooks-pre-push:
	make test
	make build
	make smoke

hooks-post-merge:
	make data

hooks-post-checkout:
	make data
