# Guide Validation

Latest integration checks: 2026-09-21. Research-source snapshot: 2026-09-07.

| Check | Outcome | Boundary |
|---|---|---|
| Node tests | 8 passed, 0 failed/skipped | Encoder, bounds, 64-bit precision, bit ownership, traffic math, references |
| TypeScript | Passed | Guide source, not RTL |
| Authored-source lint | Passed | Generated UI library excluded; baseline findings documented in README |
| Production build | Passed | Vinext route classification reports unknown, not an error |
| npm dependency audit | Zero known vulnerabilities | Registry snapshot after compatible updates |
| Board reference images | Both inspected | AMD photos, not user's hardware evidence |
| Browser smoke check | Passed, Edge 153 | Eight tabs; module/source search; exact 64-bit input; overflow/crossed-quote/reset behavior; roadmap reload persistence |
| Mobile layout | Passed at 390 x 844 | All eight views have no page-level horizontal overflow after a grid sizing fix |
| Asset delivery | Passed | Handbook, both reference images and favicon return HTTP 200 |
| Browser errors | None observed | Limited to the recorded smoke journey, not exhaustive UI testing |
| WebMCP runtime registration | Unverified | No supported validation context used; optional read-only tool |
| FPGA simulator/tool pairing | Not executed | Requires first-module smoke test |
| Synthesis, CDC/timing, hardware | Not executed | Required later milestone gates |

The 132 scenario entries are planned edge-case categories across 22 work packages,
not 132 executed FPGA tests. The 520 hours are a planning estimate.

The GitHub copy now runs locally with standalone Vite/Vinext configuration. No
Sites registration or cloud bindings are required. Development and production
servers bind to loopback. The final production build and local production server
were exercised during the smoke check. Recorded results are in
`browser-smoke-2026-09-21.json`; desktop/mobile screenshots are saved locally under
ignored `guide/work/browser-smoke/`.

The initial mobile check failed because a grid column expanded to a wide table's
intrinsic minimum. Changing that mobile track to `minmax(0, 1fr)` kept scrolling
inside the table's own container. The full eight-view smoke check then passed.
