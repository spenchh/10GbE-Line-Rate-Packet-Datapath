# FPGA Packet Lab: Research and Build Handbook

Research edition: 2026-09-07. Audience: a beginner FPGA engineer building a substantial personal project.

## Executive Answer

Build a 10GbE FPGA packet-processing endpoint that receives synthetic quote updates, maintains bounded symbol state, evaluates an integer-scaled rule, enforces admission and outstanding-order limits, and returns simulated order intents. Own the RTL, tests, constraints, host tools, and measurements.

This is a credible, demanding engineering project when it produces verified RTL, a reproducible software toolchain, reviewed timing/CDC results and a measured hardware demonstration. Networking and hardware/software co-design make its skills transferable. This relevance is an inference from official role descriptions, not employer endorsement or a guarantee of hiring.

[Hardware Engineer Internship, Summer 2027](https://www.hudsonrivertrading.com/hrt-job/hardware-engineer-internship-summer-2027/); [FPGA Engineer](https://prod-www.optiver.com/join-us/jobs/technology/new-york/fpga-engineer/); [Hardware Engineer, Chicago](https://www.imc.com/ap/careers/jobs/4900419101); [ASIC Verification Engineer, GPU](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/ASIC-Verification-Engineer---GPU_JR2019813)

This is an architecture and learning plan, not a proven implementation or a guarantee of employment. The inspected project contains a Python generator and an unfinished decoder interface. No RTL regression, FPGA build, line-rate test, or latency result was established in this audit. Estimates assume one beginner working 8-10 hours per week; hardware access and debugging can extend the project to 12-18 months.

## Scope and Boundaries

Core: one full-duplex 10G endpoint; synthetic 31-byte quotes; bounded quote state; integer-scaled decision; hardware risk admission; simulated order feedback; C++ host/control and Python verification; scripted FPGA build and measurements. Not a complete exchange stack, SmartNIC, production trading system, or profitability experiment. Static isolated lab addressing and neighbor configuration are the initial network profile. Address filtering is not authentication. Keep personal work separate from employer IP and networks.

## First Week

### Session 1 / 90 min
20 min: write the reset and sampling-edge table. 40 min: complete the decoder. 30 min: run a known-vector test.

### Session 2 / 90 min
Read cocotb scheduling highlights. Add idle, reset, and consecutive-packet tests. Inspect one waveform and explain every flag.

### Session 3 / 90 min
Add each rejection case and field boundary. Distinguish invalid encoding from your chosen quote policy.

### Session 4 / 90 min
Test the Python encoder independently and refactor it into an importable function. Preserve exact 64-bit values.

### Weekend / 2-4 h
Finish a small seeded regression, save a bug/waveform note, and resolve the hardware/license questions. Do not force progress to the next module if the decoder still fails.

## Design Audit

### A parsed packet is not yet a validated packet
Design correction. Late FCS/checksum/length failure must suppress both state writes and order release. Baseline: buffer and validate complete frames. Optimize with tentative parsing only after proving the same commit rule.

[10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf); [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)

### One physical port changes the topology
Hardware gate. KR260 fits a single-port request/response endpoint: RX and TX share one full-duplex link. It does not supply separate 10G ingress/egress ports. PCIe/DMA host offload is outside the core.

[KR260 Robotics Starter Kit](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html)

### Free FPGA tools do not mean a free full Ethernet stack
Hardware gate. Resolve MAC versus PCS/PMA licensing and debug entitlement before buying. Candidate open implementations still need board integration, license review, and a pinned version.

[PG210: License Type](https://docs.amd.com/r/en-US/pg210-25g-ethernet/License-Type); [UG973: Feature Availability by Subscription Tier](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Feature-Availability-by-Subscription-Tier); [Taxi Transport Library](https://github.com/fpganinja/taxi)

### Snapshot quotes and ITCH need different state
Scope correction. Your 31-byte format contains a complete quote. ITCH describes order events. A parser-only ITCH extension cannot claim an accurate book without supported lifecycle messages, capacity behavior, and recovery.

[TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf); [MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf)

### Backpressure cannot stop an incoming wire instantly
Design correction. A valid/ready core still needs finite buffering and whole-frame drop behavior at a non-throttleable RX boundary. Report capacity and the supported traffic envelope; no finite queue handles unlimited overload.

[AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### Bytes per second are not enough to prove line rate
Measurement gate. Define frame sizes, packet rate, messages per packet, accepted/rejected traffic, loss, and burst envelope. Check output expansion: one large response per tiny input can exceed TX capacity even when RX is 10G.

[RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html)

### Risk must include orders still in flight
Design correction. Reserve pending exposure and a queue slot together. Handle duplicate acknowledgements, partial fills, cancel/fill races, unknown outcome, and session reset. A threshold comparator alone is not a complete risk gate.

[OUCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/TradingProducts/OUCH5.0.pdf)

### A gap counter does not repair state
Design correction. Disarm and invalidate affected state after a gap. Specify a coherent snapshot/restart flow and explicit re-arm. Check local age and epoch again at transmit admission.

[RFC 1982: Serial Number Arithmetic](https://www.rfc-editor.org/rfc/rfc1982.html); [MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf)

### Minimize CDC after understanding the clocks
Design correction. The Reddit suggestion to avoid CDC is an optimization preference. RX, TX, and control may require crossings. Equal nominal frequency does not prove synchrony; use verified crossing structures and measure their cost.

[UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### Simulator support is version-specific
Tool correction. cocotb drives a simulator; Verilator simulates portable RTL. Add a four-state lane and separate vendor-model tests. UVM support has recently expanded in Verilator but remains qualified.

[cocotb Simulator Support](https://docs.cocotb.org/en/stable/simulator_support.html); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html); [Verilator Revision History](https://verilator.org/guide/latest/changes.html); [UG900: UVM Support](https://docs.amd.com/r/en-US/ug900-vivado-logic-simulation/Universal-Verification-Methodology-UVM-Support)

### A target clock is not a latency result
Measurement gate. 156.25 MHz with 64 bits gives 10 Gb/s interface capacity. It does not prove useful payload throughput, zero loss, a 150 ns response, or timing closure. A universal 600 MHz target is unjustified for this project.

[RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow)

### Coverage and proof claims need boundaries
Verification gate. Track scenarios, structural coverage, assertions, and software coverage separately. Test the checker by inserting a known fault. Record formal assumptions, bounds, and tool outcomes; neither simulation nor formal replaces board/CDC evidence.

[SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html)

## Architecture

Wire -> SFP+/GTH/PCS/MAC -> tentative Ethernet/IPv4/UDP and payload parse -> complete-frame integrity commit -> sequence health and bounded quote table -> integer decision -> atomic risk/queue reservation -> OrderIntent-v1 encoder/TX -> simulated venue. Validated feedback returns to an order tracker. AXI-Lite shadow/commit registers form the control plane; tagged counters and ILA form the observation plane.

Integrity must precede durable state writes and orders. Tentative parsing may overlap reception; it does not authorize speculative transmission. Backpressure is local, not a guarantee that incoming wire traffic stops. Define whole-frame overload behavior and the response-expansion budget.

[10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf); [AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c); [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768); [RFC 791: Internet Protocol](https://www.rfc-editor.org/rfc/rfc791); [OUCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/TradingProducts/OUCH5.0.pdf)

### First-block packet format

| Field | Bits | Vector slice | First wire byte | Example |
|---|---:|---|---:|---|
| message_type | 8 | [247:240] | 0 | 1 |
| sequence_number | 32 | [239:208] | 1 | 42 |
| symbol_id | 16 | [207:192] | 5 | 7 |
| bid_price | 32 | [191:160] | 7 | 1743100 |
| ask_price | 32 | [159:128] | 11 | 1743300 |
| bid_size | 32 | [127:96] | 15 | 800 |
| ask_size | 32 | [95:64] | 19 | 500 |
| timestamp | 64 | [63:0] | 23 | 123456789 |

Unsigned big-endian fields, price scale 10,000. Specify timestamp units before using it beyond opaque metadata. The earliest wire byte maps to bits [7:0] on the proposed 64-bit stream; the whole payload uses message_type at [247:240]. Three full beats plus one seven-byte beat: last tkeep=0x7F. This is synthetic Payload-v1, not Nasdaq ITCH.

## Requirements

### R01: Protocol contract
Versioned byte order, field widths, price units, length, supported messages, and error policy.
Owners: D01, D02, D10, S01

### R02: Integrity before effects
Bad or incomplete frames cause no committed state change and no new order.
Owners: D03, D10, D11

### R03: Finite capacity
Declare symbol slots, frame length, buffering, outstanding orders, and supported burst envelope.
Owners: D03, D05, D07, D08

### R04: Stream correctness
No unaccounted loss, duplication, reordering, or sideband mismatch within the supported load.
Owners: D02, D03, S02

### R05: State health
A gap, stale state, unknown epoch, or incomplete recovery prevents admission.
Owners: D04, D05, D07

### R06: Arithmetic correctness
Explicit intermediate widths, signedness, decimal/binary scales, rounding and overflow policy.
Owners: D06, D07, S01, S03

### R07: Atomic admission
Reserve exposure and an output slot in the same logical transaction.
Owners: D07, D08, D09

### R08: Safe lifecycle
Duplicates, partial fills, cancel races and unknown outcome cannot corrupt reservations.
Owners: D08, S03

### R09: Coherent control
Atomic config epochs, trusted feedback, watchdog, reset/disarm, and final admission checks.
Owners: D07, D12, D13, S04

### R10: Physical timing
Correct clocks and CDC structures; post-route setup/hold/pulse-width/DRC closure.
Owners: D13, D15, S05

### R11: Reproducibility
Frozen tool/IP versions, deterministic seeds, clean build, raw evidence and explicit failures.
Owners: S02, S05, S06

### R12: Honest measurements
Define endpoints, traffic rates/sizes, sample counts, loss, instrument resolution and error bars.
Owners: D14, S03, S06

## Timeline

520 planned hours over 52 working weeks at 10 hours/week. This is an estimate, not a deadline guarantee. Hardware gates run in parallel from week one. At 8 hours/week the arithmetic is 65 working weeks; calendar breaks and debugging add time.

### Weeks 1-2: One packet, one trustworthy result
20 planned hours. A registered 248-bit decoder with an independent cocotb scoreboard.

Learn: Packed vectors, byte order, clock edges, nonblocking assignments, reset polarity, and simulator scheduling.

- Write protocol_v1.md: 31 bytes, MSB-first packed vector, unsigned integers, price scale 10,000.
- Finish market_data_decoder.sv; add decode_error and endmodule. Keep synchronous active-low rst_n for this first block.
- Refactor gen_packet.py into importable pack/unpack helpers and a CLI; add independently calculated fixtures.
- Create a cocotb runner, pinned environment, and a short README with one reproducible test command.

Exit gate: Known vector, each field boundary, idle, reset, rejected input, and consecutive packets pass. Save a waveform and record the simulator versions.

Challenge: Predict the next five output cycles on paper before simulation. Deliberately swap bid/ask slices and make the scoreboard catch it.

Dependencies: No earlier milestone. Audit board availability/licensing in parallel.

[cocotb Timing Model](https://docs.cocotb.org/en/stable/timing_model.html); [cocotb Simulator Support](https://docs.cocotb.org/en/stable/simulator_support.html); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html)

### Weeks 3-4: Turn the packet into a stream
20 planned hours. A 64-bit ready/valid interface and a bounded 31-byte assembler.

Learn: Accepted beats, TKEEP/TLAST, latency versus throughput, FIFO occupancy, basic synthesis.

- Define byte lane 0 as tdata[7:0], carrying the first wire byte. Map bytes explicitly into the MSB-first packed decoder input.
- Implement axis_quote_assembler and an elastic buffer; legal final keep is 0x7F after three full 8-byte beats.
- Add mid-packet stalls, final-beat stalls, length errors, reset, and no-loss/no-duplication scoreboards.
- Run a first small synthesis with a real clock constraint and inspect inferred registers.

Exit gate: No state advances without valid && ready. All output qualifiers remain stable under stalls. Truncated and oversized messages never become accepted quotes.

Challenge: The stall puzzle: stop the receiver on the final beat, then resume without losing or duplicating a packet.

Dependencies: p1

[AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow); [How the Internet Works](https://eater.net/inet)

### Weeks 5-8: Remember state and respect sequence
40 planned hours. A bounded quote table, stream health state, and integer-scaled decision pipeline.

Learn: BRAM timing, read-after-write hazards, modular counters, signed widths, fixed-point scaling.

- Start with 64 symbol slots; reject unmapped IDs before memory access. Use a valid bit or epoch per entry.
- Add stream sequence checking, local receive-time freshness, and explicit resynchronization.
- Implement a simple spread/size threshold, then a bounded Q-format coefficient as an optional arithmetic exercise.
- On available hardware, bring up the stock image and selected MAC loopback in parallel. Resolve the exact GT clock/pin map.

Exit gate: Same-symbol consecutive updates use the newest state; gaps invalidate the stream; arithmetic matches an exact integer model at every boundary.

Challenge: The stale-quote drill: skip a sequence number and prove that no order can escape until state is re-established.

Dependencies: p2; hardware access is a parallel dependency

[RFC 1982: Serial Number Arithmetic](https://www.rfc-editor.org/rfc/rfc1982.html); [Soft IP for Kria Notes](https://xilinx.github.io/kria-apps-docs/creating_applications/2022.1/build/html/docs/soft_ip_notes.html); [KR260 BIST device-tree source](https://github.com/Xilinx/kria-apps-firmware/blob/main/boards/kr260/bist/kr260-bist.dtsi); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow)

### Weeks 9-12: Close the simulated order loop
40 planned hours. Risk admission, outstanding-order accounting, and a C++ simulated venue.

Learn: Atomic reservations, bounded queues, order identity, acknowledgements, fill/cancel races, testing software.

- Define OrderIntent-v1 and Feedback-v1 with session epoch, unique ID, side, price, quantity, reason, and correlation ID.
- Reserve pending exposure atomically with an output queue slot; release only on validated terminal feedback.
- Build C++20 codec/replay/sink tests, Python fault cases, and one focused formal safety check.
- Include disarm, kill, timeout, rate limits, feedback reconciliation, and a command/status interface.

Exit gate: Two individually legal orders cannot jointly exceed limits. Duplicate feedback cannot free exposure twice. A timeout or ambiguous transmit result disarms the system.

Challenge: The double-order challenge: send two back-to-back orders that would exceed the combined limit and explain the arbitration.

Dependencies: p3

[AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html); [UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html)

### Weeks 13-16: Receive real Ethernet frames
40 planned hours. Ethernet/IPv4/UDP validation feeding the already-tested quote core.

Learn: MAC versus PCS, network lengths, checksum folding, frame boundaries, packet buffering.

- Support an explicit subset: untagged Ethernet, IPv4 IHL=5, no fragments, UDP, configured addresses/ports.
- Implement checksum and length checks with a complete-frame commit barrier.
- Separate malformed-frame rejection from quote eligibility. Never commit a partial packet.
- Use a known MAC model; write tests for every header offset and error path.

Exit gate: Bad FCS, bad IP/UDP checksum, inconsistent lengths, truncation, unsupported VLAN/options/fragments, and junk padding have documented outcomes.

Challenge: The last-byte trap: inject an error after an otherwise valid quote and prove zero state changes and zero new orders.

Dependencies: p4

[RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768); [RFC 791: Internet Protocol](https://www.rfc-editor.org/rfc/rfc791); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### Weeks 17-20: Make the physical link work
40 planned hours. A custom UDP request/intent exchange over the candidate 10G link.

Learn: GT lock/reset, reference clocks, CDC constraints, PS-to-PL control, ILA triggers.

- Complete board-specific wrappers and constraints; retain reusable IP versions and licenses.
- Use the onboard Arm processor for AXI-Lite control/status; keep decisions in programmable logic.
- Add a verified CDC boundary only where the selected IP clock architecture requires it.
- Capture accepted-frame, state-commit, risk-release, and TX events with matching IDs.

Exit gate: Custom packets traverse the board; link loss and reset stop admission; a clean rebuild reproduces the bitstream; ILA traces match simulation.

Challenge: Unplug and reconnect the cable. Re-arm only after link, state, session, and pending-order reconciliation are valid.

Dependencies: p5; board, peer, cable, unrestricted stack, and clock mapping required

[KR260 Robotics Starter Kit](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html); [UG973: Feature Availability by Subscription Tier](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Feature-Availability-by-Subscription-Tier); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### Weeks 21-26: Break the complete system
60 planned hours. An automated fault regression spanning host, RTL, and the board.

Learn: Cross coverage, assertions, randomized clocks/stalls, control races, reproducibility.

- Run each module matrix, then pairwise faults such as reset + full queue and kill + feedback.
- Add a second simulator for X/reset tests and vendor-model simulation where appropriate.
- Exercise AXI-Lite AW/W ordering, strobes, error responses, atomic configuration commits, and counter snapshots.
- Use watchdogs, explicit overflow counters, and persistent logs for long runs.

Exit gate: Every requirement links to a test or scoped proof and an evidence artifact. No unexplained failure, suppressed warning, or untested critical reject path remains.

Challenge: Fault tournament: a friend selects a hidden seed; you reproduce and diagnose it from the recorded artifacts.

Dependencies: p6

[AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow)

### Weeks 27-32: Measure, then optimize
60 planned hours. Timing closure, throughput sweeps, and latency distributions with defined endpoints.

Learn: Critical paths, queueing, serialization, timestamp uncertainty, coverage interpretation.

- Record WNS/TNS, hold/pulse-width results, utilization, DRC/CDC status, and constraints.
- Sweep input sizes and burst patterns; calibrate actual traffic offered by the generator.
- Collect latency min/median/p99/p99.9/max and sample count; log rejected and missing packets separately.
- Build a focused UVM risk-gate bench if ASIC/DV applications are a priority; keep it out of the core critical path.

Exit gate: No throughput claim beyond measured load. Internal cycle latency and external latency are separately labeled. Sustained tests include documented duration and loss accounting.

Challenge: Optimize one measured critical path, then show whether area, latency, and timing improved or regressed.

Dependencies: p7

[RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow); [Verilator Revision History](https://verilator.org/guide/latest/changes.html); [UG900: UVM Support](https://docs.amd.com/r/en-US/ug900-vivado-logic-simulation/Universal-Verification-Methodology-UVM-Support)

### Weeks 33-40: Turn engineering into an experiment
80 planned hours. A controlled comparison of two integrity-preserving receive architectures.

Learn: Hypotheses, baselines, controlled variables, repeated measurements, related work, limitations.

- Baseline A buffers a full frame before parsing. B parses tentatively while receiving but commits only after all checks pass.
- Keep hardware, clocks, checks, state capacity, stimulus, and measurement boundaries identical.
- Sweep frame sizes and bounded buffer depths; run identical fault regressions for both.
- Write a research note with results, raw data, traces, resource costs, and threats to validity.

Exit gate: Another person can reproduce the comparison. Improvements are measured and qualified; novelty is assessed against related work with your advisor.

Challenge: Find a workload where the apparently faster architecture loses, and explain why.

Dependencies: p8

[10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf); [RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html); [verilog-ethernet](https://github.com/alexforencich/verilog-ethernet); [Taxi Transport Library](https://github.com/fpganinja/taxi)

### Weeks 41-46: Choose one advanced extension
60 planned hours. One completed extension selected from the remaining evidence gap.

Learn: Variable-length parsing, real protocol semantics, or stronger formal/DV techniques.

- HFT option: MoldUDP64 framing plus a declared ITCH decode subset; add an order book only with lifecycle/recovery completeness.
- Networking option: support one VLAN tag and a justified burst-buffer architecture with formal invariants.
- Verification option: close one UVM environment and prove bounded FIFO/risk properties with reviewed assumptions.
- Select one option; revisit the time budget before adding another.

Exit gate: The extension has its own support matrix, reject policy, tests, and measured integration results. Core regression still passes.

Challenge: Demonstrate the exact unsupported input boundary and the safe response to it.

Dependencies: p9

[MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf); [TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [Verilator Revision History](https://verilator.org/guide/latest/changes.html)

### Weeks 47-52: Reproduce and present
60 planned hours. A clean public repository, short hardware demo, and defensible project write-up.

Learn: Technical communication, ownership, experiment reproducibility, interview explanation.

- Rebuild from a clean checkout and pinned versions; include license notices and public synthetic fixtures.
- Record a 3-minute demo: packet in, state, decision, fault rejection, measurement.
- Prepare a block diagram, five waveforms, timing/CDC reports, and a concise bug diary.
- Use six weeks as integration and schedule buffer too; preserve quality if an optional extension is unfinished.

Exit gate: Every resume claim points to a committed result. Another person can run the simulation without private files. Hardware setup and measurement limitations are explicit.

Challenge: Explain the system at 30-second, 3-minute, and 15-minute depths, including one bug you found yourself.

Dependencies: p8; optional phases may be reduced if hardware slips

[Hardware Engineer Internship, Summer 2027](https://www.hudsonrivertrading.com/hrt-job/hardware-engineer-internship-summer-2027/); [FPGA Engineer](https://prod-www.optiver.com/join-us/jobs/technology/new-york/fpga-engineer/); [Hardware Engineer, Chicago](https://www.imc.com/ap/careers/jobs/4900419101)

## Module and Software Contracts

The following cases are required planned tests, not executed results. This list is not exhaustive: integration, parameter sweeps, coverage feedback and discovered bugs must extend it.

### D01: market_data_decoder.sv
SystemVerilog; weeks 1-2. Extract the eight fields from the synthetic packed quote.

Contract: A synchronous active-low reset clears outputs and flags. At each rising edge, an input marked valid is accepted or rejected. Output data changes after that edge. The next block samples it on the next edge. Consecutive accepted inputs may keep decoded_valid high across consecutive cycles; no forced bubble.

Edge cases:
- Known 248-bit vector and leading zeros
- Every field minimum and maximum, separating encoding validity from quote policy
- Unsupported message type; zero size; crossed quote under v1 policy
- No input: flags clear and old fields hold
- Reset with packet_valid asserted; first packet after reset
- Two distinct packets on consecutive edges

Evidence: Independent scoreboard, exact-cycle assertions, waveform, reset test on a four-state simulator.

[cocotb Timing Model](https://docs.cocotb.org/en/stable/timing_model.html)

### D02: axis_quote_assembler.sv
SystemVerilog; weeks 3-4. Assemble exactly 31 payload bytes from a 64-bit stream.

Contract: Byte lane 0 is first on the stream. Three beats have keep=0xFF, the fourth keep=0x7F. Advance on handshake only. An invalid length/qualifier enters discard-to-TLAST; a watchdog handles a missing end marker.

Edge cases:
- End on every byte offset
- 30, 31, and 32-byte payloads
- Final beat stalled; stalls on every beat
- Sparse keep or non-final partial keep
- Missing TLAST and reset mid-frame
- Back-to-back messages and downstream queue full

Evidence: Byte-by-byte software reference, timeout tests, stable-under-stall property.

[AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c)

### D03: axis_elastic_buffer.sv / frame_buffer.sv
SystemVerilog; weeks 3-4 / 13-16. Bound storage and decouple producer/consumer timing.

Contract: Store data and all sideband information together. Occupancy stays in [0, depth]. Complete-frame admission reserves enough capacity or drops the whole frame. An unthrottleable MAC cannot wait indefinitely for TREADY.

Edge cases:
- Empty/full transitions; simultaneous push/pop
- Pointer wrap at several parameter depths
- Reset with queued and partially written frames
- Overflow at the first, middle, and last beat
- Abort cannot expose a partial frame
- Recovery after consecutive rejected frames

Evidence: FIFO ordering scoreboard, occupancy proof, whole-frame loss accounting.

[AMBA AXI-Stream Protocol Specification](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### D04: sequence_health.sv
SystemVerilog; weeks 5-8. Track a single v1 stream and gate stale or unsynchronized state.

Contract: The 32-bit v1 sequence is global to the stream, not per symbol. Track an explicit session epoch. A gap invalidates the stream and disarms decisions. Recovery is an explicit coherent snapshot/restart protocol, never automatic on the next good packet.

Edge cases:
- Expected sequence; duplicate; older/reordered packet
- 0xFFFFFFFF to 0 wrap
- Half-range ambiguity
- Session change while messages are queued
- Fresh packet after gap does not silently re-arm
- Snapshot/configuration commit during recovery

Evidence: Model comparison around wrap, state-transition coverage, no-order-while-unsynced assertion.

[RFC 1982: Serial Number Arithmetic](https://www.rfc-editor.org/rfc/rfc1982.html); [MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf)

### D05: quote_state.sv
SystemVerilog; weeks 5-8. Store bounded best-bid/ask snapshots and local freshness metadata.

Contract: Start with 64 explicit symbol slots and validate IDs before indexing. Record local receive time plus epoch. Updates commit atomically. Resolve same-address read/write with forwarding or a documented stall. This is a quote table, not an ITCH order book.

Edge cases:
- First update to invalid slot
- Minimum/maximum/unmapped symbol
- Consecutive same-symbol updates
- Interleaved symbols and BRAM collision behavior
- Reset/epoch rollover without leaking old state
- Stale quote and locked/crossed/empty eligibility policies

Evidence: Independent dictionary model, memory-hazard stress, epoch reset test.

[TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

### D06: decision_core.sv
SystemVerilog; weeks 5-8. Produce a candidate intent from eligible quote state.

Contract: Begin with spread and size thresholds in integer price units (1/10,000). Specify signedness, intermediate widths, rounding and saturation before optional Q-format multiplication. The rule is an engineering workload, not a profitability claim.

Edge cases:
- Threshold below/equal/above
- Bid greater than ask before unsigned subtraction
- Maximum 32-bit prices and quantities
- Negative intermediate and sign extension
- Multiplication overflow, saturation, rounding ties
- Valid/data misalignment under pipeline bubbles

Evidence: Exact integer reference, boundary sweep, bit-growth table, pipeline latency checks.

[TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf); [UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)

### D07: risk_gate.sv
SystemVerilog; weeks 9-12. Admit only bounded, eligible intents and reserve exposure.

Contract: Require armed, healthy session, eligible fresh state, legal price/size, notional/position/rate capacity, and a free TX queue slot. Admit and reserve atomically. Include pending orders in exposure; use wide products and accumulators. Revalidate epoch/kill at final transmit admission.

Edge cases:
- Every limit at -1/equal/+1 relative to boundary
- Two same-symbol orders exceed combined limit
- Buy/sell pending exposure and both directional limits
- Kill or config update while a candidate is stalled
- No TX capacity; rate tokens exhausted
- Quantity zero; maximum price*size; stale local age

Evidence: Admission scoreboard, invariant proofs within declared bounds, all reject reasons covered.

[SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)

### D08: order_tracker.sv / feedback_decoder.sv
SystemVerilog; weeks 9-12. Track simulated pending, filled, rejected, and cancelled orders.

Contract: Use session epoch plus monotonically allocated ID. Unknown outcome holds reservation and disarms. A cancel request does not release exposure until confirmed. Deduplicate feedback. Only a trusted simulated-venue session may change execution state.

Edge cases:
- Duplicate ack/fill/cancel/reject
- Partial fill followed by cancel acknowledgement
- Fill racing cancel or kill
- Unknown ID or old session feedback
- Feedback quantity exceeds remaining quantity
- Timeout, link loss, ID wrap and reset with outstanding orders

Evidence: Lifecycle model and race tests; reconciliation trace; no double-release assertion.

[OUCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/TradingProducts/OUCH5.0.pdf); [SoupBinTCP 3.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/soupbintcp.pdf)

### D09: order_encoder.sv / tx_scheduler.sv
SystemVerilog; weeks 9-12 / 17-20. Serialize OrderIntent-v1 and provide complete frames to the MAC.

Contract: Define every field, byte order, length, checksum, padding, and response port. Packetize before transmit if the MAC requires a continuous frame. Bound priority and queue depth. Kill suppresses queued unsent new orders; bytes already sent cannot be recalled.

Edge cases:
- Golden encoded packet and leading-zero fields
- Final beat keep and minimum Ethernet padding
- TX underflow and late backpressure
- Kill before frame start versus after frame start
- Queue overflow; feedback/control priority starvation
- Reservation release only on known local failure, never ambiguous delivery

Evidence: Independent C++ sink decode, egress byte comparison, transmit-admission properties.

[10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf); [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)

### D10: eth_ipv4_udp_rx.sv
SystemVerilog; weeks 13-16. Filter and validate the declared Ethernet/IPv4/UDP subset.

Contract: Untagged Ethernet; IPv4 IHL=5; protocol 17; no fragmentation; configured addresses/ports; bounded total length. Verify IP and nonzero UDP checksums. Default project policy rejects omitted UDP checksum with a distinct counter. Ethernet padding is not UDP payload.

Edge cases:
- Bad FCS versus bad IPv4 header checksum versus bad UDP checksum
- Zero UDP checksum and computed-zero checksum encoded 0xFFFF
- Odd payload lengths and carry folding
- IHL below 5/options; MF or nonzero fragment offset
- Wrong destination/port/EtherType/version/protocol
- UDP length <8, inconsistent IP length, truncation/oversize

Evidence: Independently crafted packets, per-reason counters, every header field across beat boundaries.

[RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768); [RFC 791: Internet Protocol](https://www.rfc-editor.org/rfc/rfc791); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### D11: frame_commit.sv
SystemVerilog; weeks 13-16. Prevent late integrity errors from changing durable state.

Contract: A frame ID tags tentative data. Only complete, validated frames reach state/risk. For future multi-message datagrams, validate framing and all lengths before publishing any message; reserve descriptor capacity atomically. Aborts discard all tentative data.

Edge cases:
- Bad last byte/FCS after plausible first fields
- Malformed later message in a datagram
- Frame ID wrap and stale completion token
- Abort followed immediately by a valid frame
- Reset while integrity result is pending
- Buffer exhaustion during tentative parse

Evidence: No-state-write/no-order property before commit; rollback/abort regression.

[10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf); [MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html)

### D12: csr_axi_lite.sv / config_commit.sv
SystemVerilog; weeks 9-12 / 21-26. Expose versioned registers and atomic configuration.

Contract: 32-bit data bus; define register addresses, byte strobes, reset values, read-only/error behavior, and one outstanding transaction initially. AW and W are independent. Write shadow limits, validate them, then commit a new epoch between admitted transactions.

Edge cases:
- AW before W, W before AW, together
- BREADY/RREADY stalls and response stability
- Partial WSTRB writes; misaligned/unmapped/read-only accesses
- Reset between address, data, and response
- Readback during atomic commit
- Counter snapshot versus clear-on-write race

Evidence: AXI-Lite protocol checker, host mock tests, coherent epoch readback.

[UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

### D13: clock_reset_wrapper.sv / cdc_mailbox.sv
SystemVerilog + XDC; weeks 17-20. Manage actual clock boundaries and safe restart.

Contract: Use the selected MAC/GT clock topology. Equal nominal frequency does not imply related clocks. Use recognized CDC primitives or verified async FIFOs; synchronize reset release in each domain and wait for link/clock readiness. Keep control bundles coherent.

Edge cases:
- Different clock ratios and phases
- Reset asserted in either domain mid-transfer
- Stopped/restarted RX recovered clock
- Mailbox update during previous acknowledgement
- FIFO full at link loss
- No output until all required readiness and epoch conditions hold

Evidence: CDC structural review, clocks report, simulation stress, hardware reset traces. RTL tests do not prove analog metastability safety.

[UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing); [10G/25G High Speed Ethernet Subsystem](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

### D14: latency_stats.sv / trace_buffer.sv
SystemVerilog; weeks 17-32. Correlate events and collect measurements without changing admission behavior.

Contract: Record SOP, end-of-frame/commit, decision, and transmit admission with packet ID and local timestamp. Counter snapshots cross domains coherently. Never subtract unrelated clock counters. Trace overflow drops debug records and increments a counter.

Edge cases:
- Timestamp wrap and long idle gaps
- Counter snapshot while incrementing
- Trace buffer full under burst
- Rejected packet and no-decision paths
- Multiple outstanding IDs
- Instrumentation enabled/disabled timing comparison

Evidence: Timestamp unit tests, trace-loss counters, calibrated boundary definitions.

[RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

### D15: kr260_top.sv / mac_phy_wrapper
SystemVerilog + vendor IP; weeks 5-20. Connect the portable core to actual GT, MAC, clocks, and board pins.

Contract: Reuse a selected MAC/PCS implementation and understand its interface. Freeze part, carrier revision, clocks, XDC, reset sequence, license, and tool versions. First demonstrate a single-port endpoint; do not infer a PCIe host interface from the SoC name.

Edge cases:
- Cold boot versus warm reset
- Loss/recovery of block lock
- Missing/incompatible cable or optics
- MAC error indications and RX overrun
- Continuous TX without underflow
- Instrumentation and non-instrumented bitstream comparison

Evidence: Baseline link/BIST logs, build manifest, ILA captures, peer counters.

[KR260 Robotics Starter Kit](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html); [Soft IP for Kria Notes](https://xilinx.github.io/kria-apps-docs/creating_applications/2022.1/build/html/docs/soft_ip_notes.html); [KR260 BIST device-tree source](https://github.com/Xilinx/kria-apps-firmware/blob/main/boards/kr260/bist/kr260-bist.dtsi); [PG210: License Type](https://docs.amd.com/r/en-US/pg210-25g-ethernet/License-Type)

### S01: gen_packet.py / protocol.py / reference_model.py
Python; weeks 1 onward. Create exact bytes, model state, and generate expected outcomes.

Contract: Use bytes and structured packing with explicit network endianness. Reject invalid types including bool if integers are required. Preserve 64-bit values as integers or decimal strings in JSON consumers. Build at least one expected vector independently of the encoder.

Edge cases:
- 0/max/-1/max+1 per field
- Float/string/bool/None inputs
- Exactly 31 bytes and 62 hex digits; leading zeros
- Endian reversal and asymmetric test fields
- Known hand-checked vector versus round-trip-only testing
- Price scaling/rounding and sequence wrap

Evidence: pytest boundary tests and deterministic fixture files; Python coverage reported separately.

[TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf); [RFC 1982: Serial Number Arithmetic](https://www.rfc-editor.org/rfc/rfc1982.html)

### S02: test_*.py / regression.py
Python + cocotb; weeks 1 onward. Drive DUT interfaces and score every accepted transaction.

Contract: Separate driver, monitor, model, scoreboard, and scenario coverage. Seed Python and simulator randomness; use timeouts and archive minimal failing input. Sample after settling. Every required test must execute; skip/xfail is not a pass.

Edge cases:
- All module cases plus pairwise fault combinations
- Random valid traffic mixed with malicious lengths
- Reset and stalls at each state transition
- Repeated seeds reproduce failures
- Missing output, duplicate output, wrong order
- Mutated bug triggers the intended assertion/check

Evidence: JUnit results, seed list, coverage ledger, regression manifest and failure waveforms.

[cocotb Simulator Support](https://docs.cocotb.org/en/stable/simulator_support.html); [cocotb Timing Model](https://docs.cocotb.org/en/stable/timing_model.html); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html)

### S03: codec.cpp / replay.cpp / venue_sim.cpp
C++20; weeks 9 onward. Replay market data and validate returned intents/feedback.

Contract: Use explicit byte reads or memcpy plus endian conversion; do not cast wire bytes into padded structs. Keep queues bounded and timeouts monotonic. Treat UDP sends as datagrams; TCP extensions must handle partial I/O. Host replay speed is measured, not assumed 10G.

Edge cases:
- Empty/truncated/oversized files and packets
- Unaligned input; wrong endian; integer conversion
- EINTR/EAGAIN, full socket queues and datagram errors
- Malformed feedback/unknown IDs/duplicate fills
- Shutdown with queued packets or incomplete logs
- Bad PCAP link type/snaplen/timestamps and huge records

Evidence: Golden vectors, CTest/unit tests, ASan/UBSan with failing exit status, fuzz corpus, measured offered load.

[AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html); [UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html); [SoupBinTCP 3.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/soupbintcp.pdf)

### S04: control.cpp / register_io.cpp
C++20 (or a small C HAL); weeks 17 onward. Configure the onboard processor-to-PL control path.

Contract: Use a supported UIO/driver-backed mapping or platform API. volatile alone is not a memory-ordering strategy. Version the register map; validate input and read back the applied epoch. Keep control off the decision path; a host crash must disarm via watchdog.

Edge cases:
- Unsupported device ID or register version
- Invalid address/alignment/range
- Partially written shadow config and rejected commit
- Readback mismatch; timeout; driver failure
- Process crash and watchdog expiry
- Counter snapshot and multiword value consistency

Evidence: Mock register transport tests, hardware readback log, watchdog test.

[Hardware Engineer, Chicago](https://www.imc.com/ap/careers/jobs/4900419101); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

### S05: build.tcl / reports.tcl / check_reports.py
Tcl + Python; weeks 3 onward. Reproduce the FPGA build and enforce evidence gates.

Contract: Resolve paths relative to the script, validate part/IP versions, read XDC, synthesize, implement, and collect structured timing/DRC/CDC/utilization data. A missing report or incomplete run fails. Clock constraints and timing exceptions require written justification.

Edge cases:
- Missing RTL/XDC/IP license
- Wrong part and unmatched constraint object
- Negative setup/hold slack; pulse-width violation
- Unconstrained endpoints and unsafe CDC
- Build failure cannot be hidden by a stale report
- Paths with spaces and clean-checkout rebuild

Evidence: Nonzero failure status, versioned manifest, post-route DCP and reports; no manual claims from source inspection.

[UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow); [UG973: Feature Availability by Subscription Tier](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Feature-Availability-by-Subscription-Tier); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

### S06: analyze_latency.py / evidence_manifest.py
Python; weeks 27 onward. Convert raw measurements into reproducible results.

Contract: Record units, endpoints, frequency, bitstream hash, traffic pattern, seed, sample count, warmup rule, instrument resolution, and loss. Treat missing events as missing data, not low latency. Keep integer timestamps until deliberate unit conversion.

Edge cases:
- Empty file and missing columns
- Duplicate/missing/out-of-order packet IDs
- Counter wrap and clock-domain mismatch
- Outlier retained rather than silently trimmed
- Invalid units and insufficient samples for tails
- Trace overflow and generator shortfall

Evidence: Small hand-calculated datasets, stable summaries, raw CSV + plots + assumptions.

[RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html)

### X01: moldudp64_rx.sv / itch_decoder.sv
SystemVerilog (optional); weeks 41-46. Explore a real transport and a documented ITCH message subset.

Contract: Validate all message lengths/counts and session semantics. Unsupported messages are counted; messages needed to maintain selected state cannot be silently ignored. Complete order book work is a separate capacity, lifecycle, and recovery commitment.

Edge cases:
- Multiple messages per datagram across every byte lane
- Count 0 heartbeat and 0xFFFF end-of-session
- Truncated header/length field and inconsistent count
- Per-message sequence increment; duplicates/gaps
- Unknown types versus required book-changing types
- Order table full/collision, missing delete target and replace lifecycle

Evidence: Official-format synthetic fixtures plus licensed replay only where available; exact support matrix.

[MoldUDP64 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf); [TotalView-ITCH 5.0 Specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf)

## Acceptance and Evidence

- All directed requirement cases execute and pass; skipped required tests are failures. Aim for at least 10,000 seeded transactions per small-block regression as an initial project budget, then increase from measured coverage gaps.
- Run combinations that isolated tests miss: same-symbol burst + full queue; reset + frame end; kill + feedback; config commit + pending intent; gap + apparently fresh packet.
- Track functional scenario bins separately from RTL line/toggle/branch coverage, assertion outcomes, and Python/C++ coverage. Every unreachable or excluded bin has a written reason.
- At least one seeded bug per critical checker must be detected: swapped field, stale state, lost final beat, double release, and accepted bad frame. Negative tests use disposable changes.
- Prove small safety properties where practical. State bounds, environment assumptions, and whether the outcome is bounded PASS, proven, failed, or unknown. Avoid assumptions that eliminate the fault under test.
- Run second-simulator reset/unknown tests and vendor-model integration separately. Random initialization in a two-state simulator is not four-state X propagation.
- After synthesis/implementation: verify clock coverage, setup/hold/pulse-width timing, unconstrained endpoints, DRC, and CDC. Review false/multicycle exceptions; do not add them just to make reports green.
- On hardware, record accepted/rejected/overrun/TX/error counters and compare to the peer. Use repeated final trials of at least 60 seconds and a proposed 30-minute soak; these are project gates adapted from methodology, not certification.
- Traffic sweeps include 64/128/256/512/1024/1280/1518-byte ingress handling, the actual 77-byte minimum synthetic quote frame, size mixtures, minimum gaps, stalls where supported, and same-symbol bursts. Smaller unrelated frames test filtering/drop paths, not accepted quotes.
- Line-rate acceptance applies to a declared traffic envelope. Full receive bandwidth does not promise an unlimited number of decisions or responses. Bound output amplification and report overload rejection explicitly.

## Hardware Gates

- Write the topology first: one 10G full-duplex SFP+ endpoint plus a separate management path. The host sends both quotes and simulated feedback to distinct configured UDP ports.
- Confirm physical access and delivery. The AMD listing shows 26 weeks; check current distributor stock or borrow a lab board before setting a hardware deadline.
- Audit carrier revision, K26 pinout, GTH lane/site, refclk source/frequency/pins, polarity, SFP controls, and board XDC. This research did not close that pin-level audit.
- Resolve MAC/PCS licensing. Preferred baseline is a supported stack you can rebuild and explain; unrestricted bitstream generation is the pre-purchase proof.
- Price the whole link: board + compatible 10G peer/NIC + DAC or two optics/fiber + required accessories + licenses/tax/shipping. Only the board MSRP is quoted here; other prices need actual quotes.
- Identify a supported firmware/board-file/IP/tool combination. Run stock boot/BIST before replacing PL, then prove an independent loopback, then custom UDP.
- Map RX/TX/control clocks. Target 64-bit data at 156.25 MHz where the chosen interface supports it. Do not force this onto a different MAC clocking configuration.
- Plan measurement access: normal NIC timestamps may be too coarse or use different endpoints. ILA and local cycle counters establish internal timing; external wire latency requires a calibrated common timebase.

[KR260 Robotics Starter Kit](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html); [Soft IP for Kria Notes](https://xilinx.github.io/kria-apps-docs/creating_applications/2022.1/build/html/docs/soft_ip_notes.html); [KR260 BIST device-tree source](https://github.com/Xilinx/kria-apps-firmware/blob/main/boards/kr260/bist/kr260-bist.dtsi); [PG210: License Type](https://docs.amd.com/r/en-US/pg210-25g-ethernet/License-Type); [UG973: Feature Availability by Subscription Tier](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Feature-Availability-by-Subscription-Tier)

## Tools

### SystemVerilog / Now
Synthesizable modules, explicit widths, registered interfaces, and selected assertions.

Evidence: Lint clean or individually justified warnings; reviewed reset/cycle contract; unit simulation.

### Python + pytest / Now
Binary codecs, exact-integer reference model, directed fixtures, randomized cases, report analysis.

Evidence: Independent known vectors, bounds/type tests, deterministic seeds, nonzero failure exit.

### cocotb + Verilator / Now
Python drives and observes a real RTL simulator. Candidate versions: cocotb 2.1.0 and Verilator 5.052; smoke-test before freezing.

Evidence: A passing and deliberately failing test; version log; waveform; test-count/JUnit check. Upstream docs require Verilator 5.036+.

### Linux / WSL2, Git, make, C++ compiler / Now
A consistent simulation environment. Candidate Python 3.12 and C++20-capable GCC/Clang; record exact versions. Keep Windows Vivado integration paths explicit.

Evidence: A clean checkout reproduces the smoke test; paths with spaces and missing dependencies fail clearly.

### Vivado + XDC + Tcl / Early
Synthesis, timing constraints, placement/routing, reports, IP generation, bitstreams, and board debug.

Evidence: Version-pinned scripted run with checked setup/hold/pulse-width/DRC/CDC results and no unexplained unconstrained endpoints.

### Four-state simulator / vendor simulation / Before integration
Use available Questa/Xcelium for a second cocotb lane; Icarus for a tested subset. XSim is a separate SV/vendor-model lane, not assumed upstream cocotb support.

Evidence: Reset/unknown-value tests and compatible vendor models. Simulation disagreements are investigated rather than waived.

### C++20 + CMake/CTest / Order-loop milestone
Host replay, intent codec, simulated venue, and onboard control. A small C HAL is optional; duplicating everything in C and C++ adds little.

Evidence: Unit tests, ASan/UBSan, bounded queues, malformed input tests, actual offered-load measurements.

### SVA + Yosys/SBY / After first FIFO/risk block
Assert local invariants and prove selected small properties under documented assumptions.

Evidence: Assertion negative test; reachable cover points; proof/bounded/unknown outcomes reported honestly.

### UVM / Focused later milestone
One driver/monitor/sequence/scoreboard/coverage environment around the risk block. Useful for ASIC/DV fluency and employer relevance.

Evidence: Tested simulator/library pair, reject-reason coverage, negative tests, and regression. It is not required to write a decoder.

### ILA + peer traffic tools / Hardware available
Observe actual internal events and send/capture frames at a known rate. Borrow calibrated timestamp hardware for external latency if needed.

Evidence: Trace IDs align with packets; record trigger placement, sample depth, instrumentation impact, traffic generator limits, and uncertainty.

[cocotb Release Notes](https://docs.cocotb.org/en/stable/release_notes.html); [cocotb Simulator Support](https://docs.cocotb.org/en/stable/simulator_support.html); [Verilator Input Languages](https://verilator.org/guide/latest/languages.html); [Verilator Revision History](https://verilator.org/guide/latest/changes.html); [UG900: UVM Support](https://docs.amd.com/r/en-US/ug900-vivado-logic-simulation/Universal-Verification-Methodology-UVM-Support); [SBY: Formal Extensions to Verilog](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html); [UG894: Non-Project Tcl Flow](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow); [UG949: Clock Domain Crossing](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

## Research Experiment

How much latency and buffer cost can tentative streaming parsing save while preserving the same integrity-before-commit guarantee under bursty 10GbE traffic?

Hypothesis: Tentative parsing may overlap work with frame reception and reduce post-frame processing delay. It may also increase buffering, routing pressure, and abort complexity. The direction and magnitude are to be measured.

- A: receive and validate a complete frame, then parse and evaluate it.
- B: parse into tentative descriptors as bytes arrive; release descriptors only after all checks pass. No speculative order is transmitted.

### Controls

- Same FPGA, MAC/PCS version, clocks, compiler settings, pipeline semantics, checksums, and state limits.
- Same fixture corpus, offered load, seeds, reset/fault tests, timestamp boundaries, and instrument.
- Sweep frame sizes, burst length, and buffer depth. Repeat builds/runs and retain raw traces.

### Measures

- Latency distributions from defined SOP/EOF/commit/TX events, plus external measurements only when calibrated.
- Sustained accepted rate, drop/error rate, queue high-water marks, and response expansion.
- LUT/FF/BRAM/DSP use, setup/hold slack, and debug-enabled versus debug-disabled implementation.

This audit establishes a useful experiment, not publication novelty. Related work includes the 2009 HoTI market-data processor, Corundum, streaming-parser research, and verilog-ethernet/Taxi. Do a targeted paper review with your advisor before making novelty claims. No profit backtest is required. A well-explained negative result is still valuable engineering evidence.

[FPGA Accelerated Low-Latency Market Data Feed Processing](https://www.doc.ic.ac.uk/~wl/papers/09/hoti09dt.pdf); [Corundum: An Open-Source 100-Gbps NIC](https://cseweb.ucsd.edu/~snoeren/papers/corundum-fccm20.pdf); [P4-compatible High-level Synthesis of Low Latency 100 Gb/s Streaming Packet Parsers in FPGAs](https://arxiv.org/abs/1711.06613); [RFC 2544: Benchmarking Methodology](https://www.rfc-editor.org/rfc/rfc2544.html)

## Learning Challenges

Run a fault tournament: predict counts and state for healthy traffic, same-symbol bursts, bad final bytes, sequence gaps, full queues, kill, duplicate feedback, delayed fills and link restart. Score only when the independent model agrees. Keep a short bug notebook. Ask AI for hints and adversarial review; write expectations and reproduce results yourself.

### Why is packet_valid=0 different from reset?
An idle cycle carries no new transaction. Hold stored fields and lower result flags. Reset initializes the state and overrides input acceptance.

### Must decoded_valid go low between packets?
No. It describes each cycle. Consecutive valid outputs can keep it high, with a new transaction each cycle.

### When can the next sequential module see a decoded value?
The decoder updates after the accepting edge. A downstream register samples that value at the next rising edge. The testbench can observe it after the first edge settles.

### Why is field concatenation different from wire byte lanes?
The whole 248-bit vector puts message_type at [247:240]. A typical 64-bit stream puts its earliest wire byte at [7:0]. The assembler explicitly maps between these conventions.

### Can a bad FCS packet already have caused an order?
It can in a careless cut-through design. Prevent durable effects until validation completes. Tentative parsing alone is allowed; external transmission is irreversible.

### Why not just increase the clock to reduce latency?
A higher target may fail timing, add stages or crossings, and increase area. Optimize from measured critical paths and compare complete latency boundaries.

### Does a Python/RTL round trip prove the format?
No. Matching bugs in both can cancel out. Use independently calculated fixtures and a separate reference interpretation.

## Glossary

- **RTL:** Register-transfer level: describes registers and the logic that transforms data between clock edges.
- **MAC:** Ethernet framing logic: frame boundaries, addressing, FCS, and the client data interface.
- **PCS/PMA:** Physical coding and attachment functions that turn parallel Ethernet data into the encoded high-speed link.
- **GT / GTH:** The FPGA high-speed serial transceiver hardware. It needs board-specific clocks and reset sequencing.
- **AXI-Stream:** A stream of data beats with valid, optional ready, byte qualifiers, and packet boundary metadata.
- **Backpressure:** A downstream block says it cannot accept more data yet. This requires a defined place for already-arriving data.
- **CDC:** Clock-domain crossing: transferring data between clocks whose timing relationship requires special handling.
- **Latency / throughput:** Latency is time for one item to traverse a path; throughput is the sustained processing rate. They are different.
- **Initiation interval:** How often a pipeline can accept a new item. A four-cycle pipeline can still accept one item every cycle.
- **Scoreboard:** Testbench logic that compares observed outputs and ordering with an independent expected model.
- **SVA / formal:** Assertions specify properties. Formal tools search possible behaviors under declared assumptions; results have scope and bounds.
- **WNS / TNS:** Worst negative slack and total negative slack summarize setup timing shortfalls. Also inspect hold, pulse width, and unconstrained paths.
- **ILA:** Integrated Logic Analyzer: captures selected internal FPGA signals on hardware.
- **Epoch:** A generation/session identifier that distinguishes current configuration and state from stale data.
- **Tick-to-trade:** A domain name for the response path from a market-data event to an order. Its timing endpoints must be stated.
- **Q format:** A binary fixed-point format with an explicitly defined number of fractional bits. It is different from decimal price scaling.

## Research Method and Remaining Gaps

The audit combined direct source inspection and targeted internet research on employer skills, board/IP integration, protocol edge cases, simulator/tool limits, prior implementations and measurement methodology. Official standards, specifications, maintainer documentation, author-hosted papers and official job descriptions were prioritized. Informal conversations and forum opinions informed questions but were not treated as universal requirements. Three related papers establish context, not an exhaustive novelty review.

Research stopped after major architecture and tooling claims had primary references and unresolved items could be turned into explicit implementation gates. Remaining gaps: exact carrier pin/refclk audit, available hardware, license entitlement, tested simulator pairing, delivered costs, research novelty and all actual implementation/measurement outcomes. Indexed NVIDIA text supports skill extraction only; current application availability was not established. Changing sources are dated, and old IP documentation must match the actual generated instance.

## Annotated Source Desk

Highlights below are paraphrases, except text explicitly marked as a direct quote. Use the named section and apply the relevant contract; do not read every document before writing the first block.

### FPGA Accelerated Low-Latency Market Data Feed Processing
Morris, Thomas and Luk / IEEE HoTI. 2009.

[Primary source](https://www.doc.ic.ac.uk/~wl/papers/09/hoti09dt.pdf)

Section: III. Approach; Figures 3-4; evaluation

Highlight: A layered FPGA feed processor parses and filters network traffic before delivering messages to host memory. It also handles redundant feeds. This establishes that the broad idea predates this project.

Project application: Sketch the layer boundaries and compare its measurement endpoints to yours. Its gigabit, FAST and PCIe system is related work, not a directly comparable 10G tick-to-trade baseline.

Evidence boundary: Author-hosted published paper

### Corundum: An Open-Source 100-Gbps NIC
Forencich et al. / FCCM. 2020.

[Primary source](https://cseweb.ucsd.edu/~snoeren/papers/corundum-fccm20.pdf)

Section: Architecture and implementation; evaluation

Highlight: Corundum combines FPGA networking with queues, DMA and a host driver. Its system-level evaluation is useful beyond trading applications.

Project application: Study module boundaries, ownership and evaluation structure. Your Ethernet endpoint does not become a SmartNIC merely by resembling its parser; PCIe/DMA/driver integration is outside the core scope.

Evidence boundary: Author-hosted published paper

### P4-compatible High-level Synthesis of Low Latency 100 Gb/s Streaming Packet Parsers in FPGAs
Research preprint / arXiv. 2017.

[Primary source](https://arxiv.org/abs/1711.06613)

Section: Abstract; parser architecture and evaluation

Highlight: The work explores generated streaming-parser architectures and evaluates latency and resource tradeoffs on a different FPGA and link speed.

Project application: Use it to develop questions about parser structure, not to copy latency numbers. Your experiment compares two hand-written RTL architectures at equal semantics; publication novelty still needs a broader review.

Evidence boundary: Primary research preprint; not a validated baseline for this board

### Userspace I/O HOWTO
Linux kernel documentation. Rolling documentation; retrieved 7 Sep 2026.

[Primary source](https://docs.kernel.org/driver-api/uio-howto.html)

Section: How UIO works; mappings and interrupts

Highlight: UIO can expose memory-mapped device regions and interrupts through a small kernel component and userspace control. It is not a replacement for every kernel subsystem.

Project application: Use it as a candidate for custom PL control registers on the onboard processor, with driver/device-tree setup and validated register ordering.

Evidence boundary: Official Linux documentation

### Hardware Engineer Internship, Summer 2027
Hudson River Trading. Retrieved 7 Sep 2026.

[Primary source](https://www.hudsonrivertrading.com/hrt-job/hardware-engineer-internship-summer-2027/)

Section: What you will do / Qualifications

Highlight: The role connects SystemVerilog design with Python modeling and testing; HDL, programming, and Linux matter. UVM or cocotb experience is a bonus.

Project application: Produce a verified block, an independent model, and a reproducible Linux regression you can explain. Do not wait for the year-long project to finish before applying.

Evidence boundary: Official internship posting

### FPGA Engineer
Optiver. Undated; retrieved 7 Sep 2026.

[Primary source](https://prod-www.optiver.com/join-us/jobs/technology/new-york/fpga-engineer/)

Section: Requirements

Highlight: The experienced role names HDL, C/C++, verification, synthesis, and timing/area constraints. Hardware bring-up is relevant.

Project application: Keep a critical-path explanation and post-route evidence beside your RTL. These are direction-setting skills, not a claim that an internship requires experienced-engineer mastery.

Evidence boundary: Official experienced-role posting

### Hardware Engineer, Chicago
IMC. Retrieved 7 Sep 2026.

[Primary source](https://www.imc.com/ap/careers/jobs/4900419101)

Section: Skills and experience

Highlight: This ASIC-focused listing asks for SystemVerilog, verification, C++, CDC, Ethernet, and Python/Bash automation.

Project application: Make the hardware/software boundary explicit. This source supports transferable skills; it is not evidence that this particular job is an FPGA internship.

Evidence boundary: Official ASIC-role posting

### ASIC Verification Engineer, GPU
NVIDIA. Indexed posting retrieved 7 Sep 2026.

[Primary source](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/ASIC-Verification-Engineer---GPU_JR2019813)

Section: Verification responsibilities

Highlight: The indexed official description names golden models, randomized stimulus, UVM, functional coverage, assertions, and C++.

Project application: For ASIC verification applications, add one focused UVM environment and explain coverage closure. FPGA project relevance is an inference, not employer endorsement.

Evidence boundary: Official indexed text; live application availability unverified

### KR260 Robotics Starter Kit
AMD. Retrieved 7 Sep 2026.

[Primary source](https://www.amd.com/en/products/system-on-modules/kria/k26/kr260-robotics-starter-kit.html)

Section: Specifications / Product features

Highlight: One SFP+ cage supports a 10G path. The four RJ45 interfaces are 1G. AMD lists $349 MSRP and a 26-week lead time; distributor stock and delivered price are unverified.

Project application: Use a single full-duplex port: the host sends market data and receives intents over the same cable. Obtain current board, NIC, cable, and licensing quotes before purchase.

Evidence boundary: Official listing; not a stock guarantee

### Soft IP for Kria Notes
AMD / Xilinx. Site label 2022.1; text references 2023.2.

[Primary source](https://xilinx.github.io/kria-apps-docs/creating_applications/2022.1/build/html/docs/soft_ip_notes.html)

Section: Ethernet

Highlight: The KR260 SFP+ can be used from programmable logic through GTH transceivers. The listed serial-IP options do not include a turnkey example design.

Project application: Audit the exact carrier schematic, GT site, reference clock, SFP controls, and XDC. A board feature does not supply the integration automatically.

Evidence boundary: Official documentation; release-specific

### KR260 BIST device-tree source
AMD / Xilinx. main inspected 7 Sep 2026.

[Primary source](https://github.com/Xilinx/kria-apps-firmware/blob/main/boards/kr260/bist/kr260-bist.dtsi)

Section: SFP+ clock and Ethernet nodes

Highlight: The source contains an xxv-ethernet node, BASE-R configuration, DMA, and an SFP-associated clk_156 reference.

Project application: Use BIST as a hardware baseline. This file alone does not establish a working custom bitstream, exact oscillator routing, or MAC entitlement. Pin a known release and rebuild it.

Evidence boundary: Source contents verified; hardware operation unverified

### PG210: License Type
AMD. v5.1 / 8 Jul 2026.

[Primary source](https://docs.amd.com/r/en-US/pg210-25g-ethernet/License-Type)

Section: BASE-R PCS/PMA versus MAC variants

Highlight: BASE-R PCS/PMA is included without an additional IP fee. The MAC and MAC+PCS features require separate fee-based licensing.

Project application: Choose a licensed AMD stack or a compatible open implementation. Verify unrestricted bitstream generation; a time-limited evaluation cannot establish a permanent lab setup.

Evidence boundary: Official IP licensing documentation

Short direct quote: "require separate fee-based licensing"

### UG973: Feature Availability by Subscription Tier
AMD. Vivado 2026.1 / 23 Jun 2026.

[Primary source](https://docs.amd.com/r/en-US/ug973-vivado-release-notes-install-license/Feature-Availability-by-Subscription-Tier)

Section: Simulation / Debug

Highlight: Basic limits XSIM size and ILA probes, and excludes IBERT and some debug flows. Device support and IP licensing are separate questions.

Project application: Confirm the actual university or kit entitlement before choosing a debug workflow. Older Vivado licenses may follow different rules; pin the board-supported release.

Evidence boundary: Official 2026.1 feature matrix

### 10G/25G High Speed Ethernet Subsystem
AMD. PG210 v4.1 / 19 Oct 2022.

[Primary source](https://www.amd.com/content/dam/xilinx/support/documents/ip_documentation/xxv_ethernet/v4_1/pg210-25g-ethernet.pdf)

Section: RX AXI4-Stream; Frame reception with errors; Clocking

Highlight: The documented RX interface signals a bad frame at its final transfer. RX/TX clocking and flow-control capabilities depend on configuration.

Project application: Keep tentative parsing separate from committed state. Read the guide matching the generated IP version. Budget any real RX-to-core or core-to-TX clock crossing.

Evidence boundary: Official versioned IP guide; match your instance

### AMBA AXI-Stream Protocol Specification
Arm. IHI 0051B / 2021.

[Primary source](https://documentation-service.arm.com/static/64819f1516f0f201aa6b963c)

Section: 2.2 Handshake signaling; byte qualifiers

Highlight: Transfers happen when TVALID and TREADY are both asserted at a clock edge. The producer retains valid data while stalled and cannot wait for ready before asserting valid.

Project application: Advance counters only on accepted beats. Hold data, keep, last, and user metadata during a stall. Test the final beat under backpressure.

Evidence boundary: Primary protocol specification

Short direct quote: "For a transfer to occur, both TVALID and TREADY must be asserted."

### RFC 768: User Datagram Protocol
IETF / RFC Editor. August 1980.

[Primary source](https://www.rfc-editor.org/rfc/rfc768)

Section: Fields / Checksum

Highlight: UDP length includes the eight-byte header. The checksum covers a pseudoheader and payload with odd-byte padding. For IPv4, transmitted zero means no checksum; computed zero is encoded as all ones.

Project application: Document whether checksum omission is accepted or rejected by project policy. Test both cases separately from a genuinely bad checksum.

Evidence boundary: Primary protocol specification

### RFC 791: Internet Protocol
IETF / RFC Editor. September 1981.

[Primary source](https://www.rfc-editor.org/rfc/rfc791)

Section: 3.1 Internet Header Format

Highlight: Header length, total length, fragmentation flags, and fragment offset affect packet interpretation. The header checksum is distinct from the UDP checksum.

Project application: First support only IPv4 IHL=5 and unfragmented UDP. Drop and count options, fragments, unsupported protocols, and inconsistent lengths. This is a declared subset, not a complete IP stack.

Evidence boundary: Primary specification; limited project profile

### MoldUDP64 Specification
Nasdaq. Version served 7 Sep 2026.

[Primary source](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/moldudp64.pdf)

Section: Downstream packet header; Message block; Heartbeat

Highlight: Packets have a 10-byte session, 64-bit sequence, message count, and length-prefixed messages. A packet can contain multiple messages; count 0 and 0xFFFF have special meanings.

Project application: Build transport framing before ITCH decoding. Sequence accounting follows messages, not packets. Test a later malformed message, duplicates, gaps, and session changes.

Evidence boundary: Primary exchange transport specification

### TotalView-ITCH 5.0 Specification
Nasdaq. Version served 7 Sep 2026.

[Primary source](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf)

Section: Data Types; Add / Execute / Cancel / Delete / Replace; Trading Action

Highlight: ITCH is an order-event feed. Price(4) uses four implied decimal places; timestamps use six bytes. Directory, order lifecycle, and trading status affect usable state.

Project application: Your 31-byte bid/ask snapshot is a synthetic protocol. An ITCH book needs order-ID state and lifecycle support, bounded capacity, and recovery. Start with a declared decode-only subset before claiming a reconstructed book.

Evidence boundary: Primary exchange payload specification

### SoupBinTCP 3.0 Specification
Nasdaq. Revision log through 22 Feb 2017.

[Primary source](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/soupbintcp.pdf)

Section: 1.1 Packet format; 1.2 Flow; 1.3 Heartbeats

Highlight: Logical messages can be split or combined by TCP. Login, sequencing, heartbeat, and reconnection belong to the session layer.

Project application: Do not label a custom UDP order intent as exchange connectivity. If you later implement a host session, test partial reads, coalesced messages, reconnects, and unknown order outcome.

Evidence boundary: Primary exchange session specification

### OUCH 5.0 Specification
Nasdaq. Version served 7 Sep 2026.

[Primary source](https://www.nasdaqtrader.com/content/technicalsupport/specifications/TradingProducts/OUCH5.0.pdf)

Section: Architecture; Enter / Cancel; Accepted / Executed / Rejected

Highlight: OUCH describes order entry and order lifecycle responses. An encoded message is only one part of a session and execution system.

Project application: Call core output OrderIntent-v1. Add an OUCH encoder only as a later compatibility exercise with a simulated venue and documented transport. No live trading is needed.

Evidence boundary: Primary exchange order-entry specification

### RFC 1982: Serial Number Arithmetic
IETF / RFC Editor. August 1996.

[Primary source](https://www.rfc-editor.org/rfc/rfc1982.html)

Section: 3.1 Addition / 3.2 Comparison

Highlight: Modulo sequence comparisons have an ambiguous half-range case. Ordinary integer comparison is insufficient across wrap.

Project application: Use these arithmetic principles for the custom 32-bit sequence scheme and declare its half-range policy. Do not assume this RFC defines Nasdaq session semantics.

Evidence boundary: Primary arithmetic reference; project adaptation

### cocotb Simulator Support
cocotb maintainers. Stable documentation retrieved 7 Sep 2026.

[Primary source](https://docs.cocotb.org/en/stable/simulator_support.html)

Section: Verilator; Icarus; Questa; Xcelium

Highlight: The documented minimum is Verilator 5.036 or Icarus 11.0. Coverage and waveform options are simulator-specific. XSim is not listed as an upstream integration.

Project application: Use cocotb to drive your portable RTL. Keep vendor-IP/XSim tests as a separate SV flow unless you deliberately validate another integration.

Evidence boundary: Official support matrix

### cocotb Timing Model
cocotb maintainers. Stable documentation retrieved 7 Sep 2026.

[Primary source](https://docs.cocotb.org/en/stable/timing_model.html)

Section: Values Change / Values Settle / End of Time Step

Highlight: An edge trigger can resume a test before all dependent HDL values settle. ReadOnly marks the stable observation phase.

Project application: Drive away from the sampling edge; await RisingEdge and then ReadOnly before checking registered outputs. Add timeouts so a missing response fails instead of hanging.

Evidence boundary: Official simulator scheduling documentation

### cocotb Release Notes
cocotb maintainers. 2.1.0 / 30 Aug 2026.

[Primary source](https://docs.cocotb.org/en/stable/release_notes.html)

Section: cocotb 2.1.0

Highlight: The release notes list 2.1.0; its new pytest regression plugin is experimental. The retrieved documentation banner still contains a development suffix.

Project application: Candidate: released cocotb 2.1.0, Python 3.12, and Verilator 5.052. Pin exact packages after a smoke test. The audit did not execute this pairing.

Evidence boundary: Release notes checked; pairing untested

### Verilator Input Languages
Verilator maintainers. 5.052 documentation.

[Primary source](https://verilator.org/guide/latest/languages.html)

Section: Two-state; Assertions; Coverage; Encrypted Verilog

Highlight: Verilator is mostly two-state; assertion and covergroup support is partial. It cannot simulate encrypted vendor RTL.

Project application: Separate portable core tests from vendor models. Run reset/X tests on a four-state simulator. Use selected assertions and verify they actually fire.

Evidence boundary: Official limitations documentation

### Verilator Revision History
Verilator maintainers. 5.052 / 5 Sep 2026.

[Primary source](https://verilator.org/guide/latest/changes.html)

Section: 5.052 Important; issue 1538 limitations

Highlight: 5.052 announces UVM 2020-3.2 support with limitations. Earlier advice that Verilator cannot run any UVM is now too broad.

Project application: UVM remains a later focused lane. Test its exact library and simulator combination; do not equate this release announcement with full commercial VIP compatibility.

Evidence boundary: Official release announcement; limitations remain

### UG900: UVM Support
AMD. Vivado 2026.1.

[Primary source](https://docs.amd.com/r/en-US/ug900-vivado-logic-simulation/Universal-Verification-Methodology-UVM-Support)

Section: Using the precompiled UVM library

Highlight: XSim documents a precompiled UVM 1.2 library. This differs from the UVM 2020-3.2 version in the Verilator announcement.

Project application: A small UVM risk-gate bench can use an available supported simulator. Keep the cocotb baseline portable and record library versions separately.

Evidence boundary: Official simulator documentation

### SBY: Formal Extensions to Verilog
YosysHQ. Rolling documentation; 7 Sep 2026.

[Primary source](https://yosyshq.readthedocs.io/projects/sby/en/latest/verilog.html)

Section: Immediate assertions; $past; cover

Highlight: assert, assume, and cover serve different roles. $past is undefined at the first sample; a bounded check is not an unbounded proof.

Project application: Start with FIFO occupancy and no-order-while-disarmed properties. Guard initial history, review assumptions, and reach cover points. Advanced SVA support depends on the frontend.

Evidence boundary: Official formal-tool documentation

### UG894: Non-Project Tcl Flow
AMD. 2026.1 / 19 Aug 2026.

[Primary source](https://docs.amd.com/r/en-US/ug894-vivado-tcl-scripting/Compilation-with-a-Non-Project-Flow)

Section: Compilation and reporting example

Highlight: A scripted flow reads HDL and XDC, synthesizes, places, routes, and emits reports/checkpoints.

Project application: Write scripts/build.tcl plus a report checker. Fail on missing constraints, unacceptable timing, DRCs, or absent artifacts; generating a report does not mean it passed.

Evidence boundary: Official implementation workflow

### UG949: Clock Domain Crossing
AMD. 2026.1 / 23 Jun 2026.

[Primary source](https://docs.amd.com/r/en-US/ug949-vivado-design-methodology/Clock-Domain-Crossing)

Section: Single-bit CDC / Multi-bit CDC / Constraints

Highlight: Crossing clocks requires an appropriate structure and constraints. A multi-bit payload cannot be made coherent by synchronizing each bit independently.

Project application: Use vendor CDC primitives or a verified async FIFO where clocks differ. Keep an explicit clock map, reset-release policy, and reviewed CDC reports.

Evidence boundary: Official design methodology

### RFC 2544: Benchmarking Methodology
IETF / RFC Editor. March 1999.

[Primary source](https://www.rfc-editor.org/rfc/rfc2544.html)

Section: 9.1 Frame sizes / 24 Trial duration / 26 Throughput and latency

Highlight: The methodology varies Ethernet frame size and distinguishes throughput and latency measurements. It includes longer final trials.

Project application: Adapt its traffic sweep, not a claim of RFC compliance. Test 64 through 1518-byte ingress handling, plus 77-byte valid synthetic quotes, bursts, drops, and long runs.

Evidence boundary: Primary benchmark methodology; adapted experiment

### verilog-ethernet
Alex Forencich. Repository inspected 7 Sep 2026.

[Primary source](https://github.com/alexforencich/verilog-ethernet)

Section: Deprecation notice / README

Highlight: The repository is superseded by Taxi. It remains a useful version-pinned reference for Ethernet implementation and test structure.

Project application: Reuse an understood MAC/PHY boundary and retain its attribution. Your contribution is the parser, state, fault handling, integration, and evidence.

Evidence boundary: Primary project repository

### Taxi Transport Library
FPGA Ninja. Repository inspected 7 Sep 2026.

[Primary source](https://github.com/fpganinja/taxi)

Section: Ethernet MAC and PHY / License

Highlight: Taxi provides SystemVerilog transport components and cocotb/Verilator tests. Its license choices differ from the old MIT-licensed repositories.

Project application: Check compatibility, board support, and redistribution requirements before selecting it. A newer library is not automatically a drop-in KR260 design.

Evidence boundary: Primary project repository; integration untested

### AddressSanitizer
LLVM. Rolling Clang documentation; 7 Sep 2026.

[Primary source](https://clang.llvm.org/docs/AddressSanitizer.html)

Section: Usage / Limitations

Highlight: Instrumentation detects memory access and lifetime faults, including out-of-bounds reads and writes.

Project application: Run the C++ codec/replay tests with sanitizer instrumentation. Also compare protocol semantics against independent vectors, which memory checking cannot validate.

Evidence boundary: Official tool documentation

### UndefinedBehaviorSanitizer
LLVM. Rolling Clang documentation; 7 Sep 2026.

[Primary source](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)

Section: Available checks

Highlight: The undefined group covers signed overflow and invalid shifts, but excludes unsigned overflow and implicit conversions.

Project application: Widen before arithmetic and use explicit bounds checks. Make sanitizer findings fail tests; intentional sequence wrap needs a documented exception, not globally disabled checks.

Evidence boundary: Official tool documentation

### How the Internet Works
Ben Eater. Undated; retrieved 7 Sep 2026.

[Primary source](https://eater.net/inet)

Section: Networking series

Highlight: The series builds intuition for Ethernet and the layers above it.

Project application: Watch the Ethernet/IP introduction, then annotate a real packet capture and write a one-page byte layout. Keep the exercise attached to the parser milestone.

Evidence boundary: Author-created educational material

## Images

KR260 board and annotated interface photos: AMD product imagery, linked and attributed in the guide. They are reference photographs, not evidence of personally owned or tested hardware.
