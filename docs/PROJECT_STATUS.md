# Project Checkpoint

Updated: 2026-09-21. This is the durable entry point for resumed work.

## Implementation Status

- `tools/gen_packet.py`: existing synthetic quote generator, unchanged by the guide integration.
- `rtl/market_data_decoder.sv`: existing interface only; no behavior or simulation result yet.
- `guide/`: interactive roadmap, 37 source annotations, 22 RTL/software work packages,
  132 planned edge-case entries and 11 milestones totaling about 520 planned hours.
- The FPGA design, post-route timing and hardware performance remain unverified.

## Current Session

The guide was integrated into this repository on 2026-09-21. It uses standalone
local development and production commands. Private hosting registration,
dependencies and generated build output are excluded from Git.

Guide tests (8), type checks, authored-source lint and the standalone production
build passed on 2026-09-21. Dependency audit reports zero known vulnerabilities.
Browser smoke checks passed for all eight tabs, module/source search, packet
bounds, reset behavior, saved progress and assets. All eight views fit the tested
390px mobile viewport after fixing a table/grid overflow. No browser page errors
were observed. The compact result is committed in
`guide/research/browser-smoke-2026-09-21.json`; local screenshots are under ignored
`guide/work/browser-smoke/`. Full evidence boundaries are in
`guide/research/VALIDATION.md`.

## Resume Here

1. Read `guide/research/VALIDATION.md`, inspect Git status and use this repository
   as the canonical project. Preserve newer work if this note is stale.
2. Confirm the expected branch/remote before committing or pushing further changes.
3. Start the first FPGA block: write `docs/protocol_v1.md`, then implement
   `rtl/market_data_decoder.sv` and a cocotb known-vector test.

For the first decoder: inputs are `clk`, synchronous active-low `rst_n`,
`packet_valid`, and `packet_in[247:0]`. Outputs are the eight fields,
`decoded_valid` and a proposed `decode_error` flag. Define reset/idle/accept/reject
behavior explicitly. Type=1, bid<=ask and nonzero sizes are the proposed synthetic
snapshot policy. Consecutive accepted packets may keep valid high. Sample the
registered result after the accepting edge settles in simulation.

## Major Design Gates

- A complete frame must pass integrity checks before durable state or order effects.
- One KR260 SFP+ port is the candidate full-duplex 10G link. Exact pins, clocks,
  board availability and MAC/PCS licensing still need verification.
- The 31-byte payload is synthetic, not Nasdaq ITCH.
- Finite buffers, sequence gaps, state freshness, pending-order exposure and
  feedback races need explicit behavior and tests.
- Portable cocotb/Verilator tests and four-state/vendor-model tests are separate lanes.
- Research source dates remain 2026-09-07. Recheck changing facts when acting on them.

## Run the Guide

From the repository root: `cd guide`, `npm ci`, `npm run dev`. Open the printed
localhost URL in a browser and keep the terminal running. Full commands are in
`guide/README.md`. Browser checklist progress is device-local; use this checkpoint
for durable project status that belongs in Git.
