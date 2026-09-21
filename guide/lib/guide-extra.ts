export const stack = [
 {name:'SystemVerilog',when:'Now',purpose:'Synthesizable modules, explicit widths, registered interfaces, and selected assertions.',proof:'Lint clean or individually justified warnings; reviewed reset/cycle contract; unit simulation.'},
 {name:'Python + pytest',when:'Now',purpose:'Binary codecs, exact-integer reference model, directed fixtures, randomized cases, report analysis.',proof:'Independent known vectors, bounds/type tests, deterministic seeds, nonzero failure exit.'},
 {name:'cocotb + Verilator',when:'Now',purpose:'Python drives and observes a real RTL simulator. Candidate versions: cocotb 2.1.0 and Verilator 5.052; smoke-test before freezing.',proof:'A passing and deliberately failing test; version log; waveform; test-count/JUnit check. Upstream docs require Verilator 5.036+.'},
 {name:'Linux / WSL2, Git, make, C++ compiler',when:'Now',purpose:'A consistent simulation environment. Candidate Python 3.12 and C++20-capable GCC/Clang; record exact versions. Keep Windows Vivado integration paths explicit.',proof:'A clean checkout reproduces the smoke test; paths with spaces and missing dependencies fail clearly.'},
 {name:'Vivado + XDC + Tcl',when:'Early',purpose:'Synthesis, timing constraints, placement/routing, reports, IP generation, bitstreams, and board debug.',proof:'Version-pinned scripted run with checked setup/hold/pulse-width/DRC/CDC results and no unexplained unconstrained endpoints.'},
 {name:'Four-state simulator / vendor simulation',when:'Before integration',purpose:'Use available Questa/Xcelium for a second cocotb lane; Icarus for a tested subset. XSim is a separate SV/vendor-model lane, not assumed upstream cocotb support.',proof:'Reset/unknown-value tests and compatible vendor models. Simulation disagreements are investigated rather than waived.'},
 {name:'C++20 + CMake/CTest',when:'Order-loop milestone',purpose:'Host replay, intent codec, simulated venue, and onboard control. A small C HAL is optional; duplicating everything in C and C++ adds little.',proof:'Unit tests, ASan/UBSan, bounded queues, malformed input tests, actual offered-load measurements.'},
 {name:'SVA + Yosys/SBY',when:'After first FIFO/risk block',purpose:'Assert local invariants and prove selected small properties under documented assumptions.',proof:'Assertion negative test; reachable cover points; proof/bounded/unknown outcomes reported honestly.'},
 {name:'UVM',when:'Focused later milestone',purpose:'One driver/monitor/sequence/scoreboard/coverage environment around the risk block. Useful for ASIC/DV fluency and employer relevance.',proof:'Tested simulator/library pair, reject-reason coverage, negative tests, and regression. It is not required to write a decoder.'},
 {name:'ILA + peer traffic tools',when:'Hardware available',purpose:'Observe actual internal events and send/capture frames at a known rate. Borrow calibrated timestamp hardware for external latency if needed.',proof:'Trace IDs align with packets; record trigger placement, sample depth, instrumentation impact, traffic generator limits, and uncertainty.'},
];
export const requirements = [
 ['R01','Protocol contract','Versioned byte order, field widths, price units, length, supported messages, and error policy.','D01, D02, D10, S01'],
 ['R02','Integrity before effects','Bad or incomplete frames cause no committed state change and no new order.','D03, D10, D11'],
 ['R03','Finite capacity','Declare symbol slots, frame length, buffering, outstanding orders, and supported burst envelope.','D03, D05, D07, D08'],
 ['R04','Stream correctness','No unaccounted loss, duplication, reordering, or sideband mismatch within the supported load.','D02, D03, S02'],
 ['R05','State health','A gap, stale state, unknown epoch, or incomplete recovery prevents admission.','D04, D05, D07'],
 ['R06','Arithmetic correctness','Explicit intermediate widths, signedness, decimal/binary scales, rounding and overflow policy.','D06, D07, S01, S03'],
 ['R07','Atomic admission','Reserve exposure and an output slot in the same logical transaction.','D07, D08, D09'],
 ['R08','Safe lifecycle','Duplicates, partial fills, cancel races and unknown outcome cannot corrupt reservations.','D08, S03'],
 ['R09','Coherent control','Atomic config epochs, trusted feedback, watchdog, reset/disarm, and final admission checks.','D07, D12, D13, S04'],
 ['R10','Physical timing','Correct clocks and CDC structures; post-route setup/hold/pulse-width/DRC closure.','D13, D15, S05'],
 ['R11','Reproducibility','Frozen tool/IP versions, deterministic seeds, clean build, raw evidence and explicit failures.','S02, S05, S06'],
 ['R12','Honest measurements','Define endpoints, traffic rates/sizes, sample counts, loss, instrument resolution and error bars.','D14, S03, S06'],
];
export const hardwareGates = [
 'Write the topology first: one 10G full-duplex SFP+ endpoint plus a separate management path. The host sends both quotes and simulated feedback to distinct configured UDP ports.',
 'Confirm physical access and delivery. The AMD listing shows 26 weeks; check current distributor stock or borrow a lab board before setting a hardware deadline.',
 'Audit carrier revision, K26 pinout, GTH lane/site, refclk source/frequency/pins, polarity, SFP controls, and board XDC. This research did not close that pin-level audit.',
 'Resolve MAC/PCS licensing. Preferred baseline is a supported stack you can rebuild and explain; unrestricted bitstream generation is the pre-purchase proof.',
 'Price the whole link: board + compatible 10G peer/NIC + DAC or two optics/fiber + required accessories + licenses/tax/shipping. Only the board MSRP is quoted here; other prices need actual quotes.',
 'Identify a supported firmware/board-file/IP/tool combination. Run stock boot/BIST before replacing PL, then prove an independent loopback, then custom UDP.',
 'Map RX/TX/control clocks. Target 64-bit data at 156.25 MHz where the chosen interface supports it. Do not force this onto a different MAC clocking configuration.',
 'Plan measurement access: normal NIC timestamps may be too coarse or use different endpoints. ILA and local cycle counters establish internal timing; external wire latency requires a calibrated common timebase.',
];
export const acceptance = [
 'All directed requirement cases execute and pass; skipped required tests are failures. Aim for at least 10,000 seeded transactions per small-block regression as an initial project budget, then increase from measured coverage gaps.',
 'Run combinations that isolated tests miss: same-symbol burst + full queue; reset + frame end; kill + feedback; config commit + pending intent; gap + apparently fresh packet.',
 'Track functional scenario bins separately from RTL line/toggle/branch coverage, assertion outcomes, and Python/C++ coverage. Every unreachable or excluded bin has a written reason.',
 'At least one seeded bug per critical checker must be detected: swapped field, stale state, lost final beat, double release, and accepted bad frame. Negative tests use disposable changes.',
 'Prove small safety properties where practical. State bounds, environment assumptions, and whether the outcome is bounded PASS, proven, failed, or unknown. Avoid assumptions that eliminate the fault under test.',
 'Run second-simulator reset/unknown tests and vendor-model integration separately. Random initialization in a two-state simulator is not four-state X propagation.',
 'After synthesis/implementation: verify clock coverage, setup/hold/pulse-width timing, unconstrained endpoints, DRC, and CDC. Review false/multicycle exceptions; do not add them just to make reports green.',
 'On hardware, record accepted/rejected/overrun/TX/error counters and compare to the peer. Use repeated final trials of at least 60 seconds and a proposed 30-minute soak; these are project gates adapted from methodology, not certification.',
 'Traffic sweeps include 64/128/256/512/1024/1280/1518-byte ingress handling, the actual 77-byte minimum synthetic quote frame, size mixtures, minimum gaps, stalls where supported, and same-symbol bursts. Smaller unrelated frames test filtering/drop paths, not accepted quotes.',
 'Line-rate acceptance applies to a declared traffic envelope. Full receive bandwidth does not promise an unlimited number of decisions or responses. Bound output amplification and report overload rejection explicitly.',
];
export const researchPlan = {
 question:'How much latency and buffer cost can tentative streaming parsing save while preserving the same integrity-before-commit guarantee under bursty 10GbE traffic?',
 hypothesis:'Tentative parsing may overlap work with frame reception and reduce post-frame processing delay. It may also increase buffering, routing pressure, and abort complexity. The direction and magnitude are to be measured.',
 variants:['A: receive and validate a complete frame, then parse and evaluate it.','B: parse into tentative descriptors as bytes arrive; release descriptors only after all checks pass. No speculative order is transmitted.'],
 controls:['Same FPGA, MAC/PCS version, clocks, compiler settings, pipeline semantics, checksums, and state limits.','Same fixture corpus, offered load, seeds, reset/fault tests, timestamp boundaries, and instrument.','Sweep frame sizes, burst length, and buffer depth. Repeat builds/runs and retain raw traces.'],
 measures:['Latency distributions from defined SOP/EOF/commit/TX events, plus external measurements only when calibrated.','Sustained accepted rate, drop/error rate, queue high-water marks, and response expansion.','LUT/FF/BRAM/DSP use, setup/hold slack, and debug-enabled versus debug-disabled implementation.'],
 limitations:'This audit establishes a useful experiment, not publication novelty. Related work includes the 2009 HoTI market-data processor, Corundum, streaming-parser research, and verilog-ethernet/Taxi. Do a targeted paper review with your advisor before making novelty claims. No profit backtest is required. A well-explained negative result is still valuable engineering evidence.',
};
export const firstWeek = [
 ['Session 1','90 min','20 min: write the reset and sampling-edge table. 40 min: complete the decoder. 30 min: run a known-vector test.'],
 ['Session 2','90 min','Read cocotb scheduling highlights. Add idle, reset, and consecutive-packet tests. Inspect one waveform and explain every flag.'],
 ['Session 3','90 min','Add each rejection case and field boundary. Distinguish invalid encoding from your chosen quote policy.'],
 ['Session 4','90 min','Test the Python encoder independently and refactor it into an importable function. Preserve exact 64-bit values.'],
 ['Weekend','2-4 h','Finish a small seeded regression, save a bug/waveform note, and resolve the hardware/license questions. Do not force progress to the next module if the decoder still fails.'],
];
export const questions = [
 ['Why is packet_valid=0 different from reset?','An idle cycle carries no new transaction. Hold stored fields and lower result flags. Reset initializes the state and overrides input acceptance.'],
 ['Must decoded_valid go low between packets?','No. It describes each cycle. Consecutive valid outputs can keep it high, with a new transaction each cycle.'],
 ['When can the next sequential module see a decoded value?','The decoder updates after the accepting edge. A downstream register samples that value at the next rising edge. The testbench can observe it after the first edge settles.'],
 ['Why is field concatenation different from wire byte lanes?','The whole 248-bit vector puts message_type at [247:240]. A typical 64-bit stream puts its earliest wire byte at [7:0]. The assembler explicitly maps between these conventions.'],
 ['Can a bad FCS packet already have caused an order?','It can in a careless cut-through design. Prevent durable effects until validation completes. Tentative parsing alone is allowed; external transmission is irreversible.'],
 ['Why not just increase the clock to reduce latency?','A higher target may fail timing, add stages or crossings, and increase area. Optimize from measured critical paths and compare complete latency boundaries.'],
 ['Does a Python/RTL round trip prove the format?','No. Matching bugs in both can cancel out. Use independently calculated fixtures and a separate reference interpretation.'],
];
