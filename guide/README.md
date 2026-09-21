# FPGA Packet Lab

A local learning guide for the 10GbE FPGA packet-processing project, with a
timeline, annotated sources, module contracts, edge cases and an interactive
packet explorer.

## Run Locally

Use Node.js 24. From the repository root:

```powershell
cd guide
npm ci
npm run dev
```

Open the localhost address printed in the terminal in Chrome, Edge or Firefox.
Leave that terminal running; Ctrl+C stops the server. If port 3000 is already
occupied, use the alternate URL printed by the server. No ChatGPT login,
Sites registration, FPGA board or simulator is needed to read the guide.

After the first install, only `npm run dev` is needed. For a production build:

```text
npm run build
npm start
```

## Checks and Content Updates

```text
npm test
npm run typecheck
npm run lint
npm run handbook
npm run build
```

- `lib/guide-data.ts`: source annotations, module contracts, milestones and audit.
- `lib/guide-extra.ts`: requirements, tools, hardware gates and acceptance criteria.
- `research/report-source.md`: full research handbook.
- `research/source-ledger.json`: source links, dates and evidence boundaries.
- `public/project-handbook.md`: downloadable handbook.
- `tests/guide.test.mjs`: packet arithmetic and guide consistency tests.

Run `npm run handbook` after changing structured content. Its generated Markdown
and ledger should be committed alongside the source changes.

Lint checks authored application code, guide components, data, scripts and tests.
The generated UI component library is outside that lint scope; it remains within
TypeScript checking.

## Status and Attribution

The evidence record is [research/VALIDATION.md](research/VALIDATION.md).
FPGA implementation progress is tracked in
[../docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md).

Guide checks do not establish RTL simulation, synthesis, timing closure, hardware
operation or measured line rate. Research sources are dated 2026-09-07; prices,
licenses, tool versions and job postings should be checked again when needed.
The optional read-only WebMCP tool remains unverified in a supported browser.

KR260 reference photographs are AMD product images and are attributed in the
guide. They do not document personally owned or tested hardware. Third-party
UI components retain their upstream implementation.
