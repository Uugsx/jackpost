---
paths:
  - "packages/**/*"
---

# Dependency Boundaries

Internal `@jackpost/*` dependencies (from each `package.json`) form a strict DAG. **New code must
respect it** — a cyclic or upward dependency is an architectural bug, not a convenience.

The full monorepo map (build tools, request pipeline, sandbox, file formats, core data-model
types, dependency versions) is the on-demand reference `.claude/reference/architecture.md` — read
it before non-trivial cross-package or architectural work.

## Dependency direction & ownership boundaries

- **Leaf libs — zero internal `@jackpost/*` deps:** jackpost-common, jackpost-lang, jackpost-query,
  jackpost-requests, jackpost-graphql-docs, jackpost-schema, jackpost-schema-types, jackpost-toml, jackpost-sqlite
  (a leaf, but *not* platform-neutral — see guardrail 6).
- **Mid consumers:** jackpost-js → (common, query); jackpost-converters → (common, schema; schema-types
  as devDep); jackpost-filestore → (common, lang; schema-types as devDep); jackpost-io → (filestore,
  common; schema-types as devDep).
- **Top consumers (things flow *into* them, never out):** jackpost-cli → (common, converters,
  filestore, io, js, lang, requests); jackpost-electron → (common, converters, filestore, js, lang,
  requests, schema, sqlite); jackpost-app → (common, converters, graphql-docs, schema).

Guardrails this enforces:

1. **jackpost-common is the browser-safe base leaf.** It runs in the web renderer (`jackpost-app`), not
   just Node, so it must stay platform-neutral: no Node built-ins (`fs`, `path`, `os`, `crypto`,
   `child_process`, `node:*`) and no dependency that itself pulls in Node. It currently ships with
   zero runtime dependencies — keep it that way. It also depends on no other `@jackpost/*` package;
   a util that needs Node or another jackpost package belongs in a different package.
2. **No shared/library package may import jackpost-app or jackpost-electron.** Renderer- or
   Electron-specific code must not be pushed down into a lib to make it importable upward.
3. **jackpost-js must stay Electron-free.** It runs in both the Electron main process *and* the CLI
   (jackpost-cli → js). Adding an `electron`/IPC import to jackpost-js breaks the CLI. Sandbox logic
   belongs in jackpost-js; host wiring belongs in jackpost-electron.
4. **jackpost-schema-types is types-only** (a *devDependency* of converters/filestore/io, built with
   plain `tsc`). Import types from it; never add runtime code or a runtime import of it.
5. **jackpost-schema (Yup) and jackpost-schema-types (TS types) are distinct and both live.** app +
   converters use `@jackpost/schema` for runtime validation; filestore + converters use
   `@jackpost/schema-types` for compile-time types. A data-model change usually touches both.
6. **jackpost-sqlite is main-process only.** `@jackpost/sqlite` (= `/node`) imports `node:sqlite`,
   `node:fs` and `node:crypto`; importing it from the renderer breaks the bundle. The renderer
   reaches statements only through the per-statement IPC handlers in jackpost-electron. See
   `.claude/rules/sqlite.md`.

## Declared dependencies must match real imports

A package's `package.json` is the contract; workspace hoisting hides breaches of it. Declare every
import in the manifest of the package that imports it — one resolving only because a sibling or the
root happens to pull it in is a latent break. Test- and build-only packages belong in
`devDependencies`; anything in `dependencies` ships to users with its transitive tree. Drop a
declaration when the change removes its last consumer.
