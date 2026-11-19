# On-disk DSL & serialization reviewer

**Scope:** `packages/jackpost-app/**`, `packages/jackpost-electron/**`, `packages/jackpost-cli/**`,
`packages/jackpost-lang/**`, `packages/jackpost-filestore/**`, `packages/jackpost-io/**`,
`packages/jackpost-schema/**`, `packages/jackpost-schema-types/**`, `packages/jackpost-converters/**`.
The format packages own serialization, but DSL objects are assembled in `jackpost-app` (Redux)
and `jackpost-electron` (IPC), and `jackpost-cli` reads/writes these files directly — a shape change
made there won't be caught by the serialization layer, so they're all in scope.

Adopt the reviewer persona and return findings in the output contract defined in
`_contract.md`.

Review the diff against **`.claude/rules/dsl-changes.md`** (read it) — Jackpost persists
collections/requests/environments/config as `.jp` and `.yml` files read across app versions, so
backward compatibility is the priority. Report violations with `file:line`, severity:

- **blocker** — a breaking field change (rename, remove, retype, repurpose, or changed
  default/semantics); a new field that isn't optional with a safe default; format drift between
  `jp` and `yml` (or between parse and stringify); a lossy round-trip (`stringify` drops
  unknown fields, or `parse(stringify(x)) !== x`); a shape change with no read-time compat shim;
  a cryptic, abbreviated, or inconsistent property name (names are permanent and user-facing).
- **blocker** — new `.jp` *syntax* (escape form, block delimiter, annotation grammar) that older
  parsers can't read; an escaping/delimiter change not proven by on-disk reparse
  (`parse(read(serialize(x)))`) or that escapes a multi-char delimiter by splitting on the whole
  delimiter. See the rule's escaping and forward-compat sections.
- **suggestion** — missing round-trip test in both formats or missing old-format golden fixture;
  a name/structure that won't scale (positional vs keyed, widening union).
- Also push back on any **unnecessary** DSL change that could be solved in memory / UI without
  altering the serialized shape.
- **Not a finding:** the read-accepts-`{content}` / write-emits-`string` asymmetry on
  `description` fields — string-only internally is an established convention (see rule), not a
  lossy round-trip.
