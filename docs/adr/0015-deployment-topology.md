# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode B publishes a static site only.

## Decision

Deploy only GitHub Pages from `main` `/docs`. Do not create Docker, Compose, nginx, Prometheus, or a runtime API for v1.

## Consequences

There is no server to patch or monitor. Advanced compute must fit browser limits or move to future offline artifacts.

## Alternatives Considered

Mode C Docker backend was rejected in ADR 0001.
