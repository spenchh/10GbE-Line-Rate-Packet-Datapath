# 10GbE Line-Rate Packet Processing Datapath

An FPGA networking project using market-data processing as its workload.
The intended system receives UDP quote updates, maintains bounded symbol state,
evaluates an integer-scaled rule, enforces hardware risk limits, and returns
simulated order intents. The long-term target is a measured 10GbE implementation.

## Current Status

- `tools/gen_packet.py` packs a synthetic 31-byte quote and checks unsigned field bounds.
- `rtl/market_data_decoder.sv` currently contains the decoder interface; RTL behavior and simulation are the next milestone.
- `guide/` contains the interactive learning roadmap, annotated research and verification plan.

No FPGA line-rate, latency, synthesis or hardware-validation result is claimed.
See [the progress checkpoint](docs/PROJECT_STATUS.md) for current evidence and
the next task.

## Explore the Guide on Your Computer

Install Node.js 24, then from the repository root:

```powershell
cd guide
npm ci
npm run dev
```

Open the localhost address printed in the terminal. The website runs in your own
browser; no ChatGPT account is required. Keep the terminal open while using it.

The [guide README](guide/README.md) contains production-start and check commands.
You can also read the [project handbook](guide/public/project-handbook.md) directly
on GitHub without running the website.

## Planned Data Path

```text
10GbE Ethernet / IPv4 / UDP
  -> tentative packet parsing
  -> complete-frame integrity validation
  -> sequence health and bounded quote state
  -> integer-scaled decision logic
  -> atomic risk and output-queue reservation
  -> simulated order intent / venue feedback
```

Python/cocotb reference models and tests, C++ replay/control software, and
Tcl/XDC build and timing checks support the RTL. The first packet format is
synthetic; Nasdaq ITCH/OUCH compatibility is a possible later extension.

## First Implementation Milestone

Write and test the registered 248-bit decoder. Define its reset, idle, accept and
reject behavior first; then check known vectors, field boundaries, rejected
quotes and consecutive valid packets using cocotb and a compatible simulator.

## Repository Layout

```text
rtl/       FPGA RTL
tools/     Python packet generator and future host-side utilities
sim/       Planned RTL simulation and verification
docs/      Project checkpoint and design documents
guide/     Local website, handbook, sources and learning timeline
```

Guide tests validate the teaching tools and source references. They are separate
from the FPGA regression that still needs to be implemented.
