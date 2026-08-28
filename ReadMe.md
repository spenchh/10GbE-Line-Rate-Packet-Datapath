10GbE / UDP packet input
-> market-data decode
-> book/top-of-book state
-> fixed-point decision logic
-> hardware risk gate
-> latency counters
-> Python/cocotb verification
-> C++ replay/control tools
-> hardware validation later


Project: 10GbE Line Rate Packet Processing Datapath

Goal:
Build an FPGA packet-processing datapath that parses market-data-style UDP packets, updates simple market state, applies fixed-point decision/risk logic, and measures latency

First milestone:
Decode one synthetic market-data packet correctly in a simulation
