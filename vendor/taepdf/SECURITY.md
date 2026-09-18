# Security Policy

## Supported Versions

taepdf is a young, actively-maintained package. Only the latest published version on npm receives security fixes.

## Reporting a Vulnerability

Please report security vulnerabilities privately through GitHub's
[private vulnerability reporting](https://github.com/silly-tae/taepdf/security/advisories/new)
(Security tab → "Report a vulnerability") rather than opening a public issue.

This is a solo-maintained project. I'll acknowledge reports as quickly as I can,
generally within a few days, and aim to have a fix out within a reasonable window
depending on severity. There's no bug bounty, but real, responsibly-disclosed
reports are genuinely appreciated.

## Scope

Things that count as a security issue here:

- **Sanitization bypass** – taepdf parses your HTML through the browser's own
  `DOMParser` and strips `<script>` tags, `on*` event handlers, and
  `javascript:`/`data:`/`vbscript:` URLs before rendering. A way to get script
  execution past that (in either the live preview or the exported PDF) is a
  real vulnerability, not just a bug.
- **Parser crashes or memory-safety issues** in the Rust/WASM engine – font
  (TTF/OTF/WOFF2/TTC) parsing that crashes, hangs, or exhibits undefined
  behavior on malformed/adversarial input.
- **Parser crashes** in the TypeScript renderer – image (JPEG/PNG) or SVG
  parsing that crashes or hangs on malformed/adversarial input. These run
  outside WASM, so the concern is a thrown exception or hang, not memory
  corruption.
- **Encryption flaws** – the AES-256/R6 standard security handler is a
  hand-rolled implementation (SHA-256/384/512, AES-CBC), not the browser's
  native WebCrypto. A flaw that weakens or bypasses PDF encryption/permissions
  is in scope.
- **Supply chain** – anything suggesting the published npm package doesn't
  match this repository's source.

## Out of scope

- Issues that only reproduce with a template author's own unescaped
  interpolation of user input (see the README's
  [Escaping HTML](https://github.com/silly-tae/taepdf#escaping-html)
  section) – that's the caller's responsibility, not taepdf's.
- Missing security headers/hardening on unrelated infrastructure (npm's own
  registry, GitHub itself, etc.) – report those upstream instead.
