# Remaining Evidence Gates

- H1: OPEN. Write the topology first: one 10G full-duplex SFP+ endpoint plus a separate management path. The host sends both quotes and simulated feedback to distinct configured UDP ports.
- H2: OPEN. Confirm physical access and delivery. The AMD listing shows 26 weeks; check current distributor stock or borrow a lab board before setting a hardware deadline.
- H3: OPEN. Audit carrier revision, K26 pinout, GTH lane/site, refclk source/frequency/pins, polarity, SFP controls, and board XDC. This research did not close that pin-level audit.
- H4: OPEN. Resolve MAC/PCS licensing. Preferred baseline is a supported stack you can rebuild and explain; unrestricted bitstream generation is the pre-purchase proof.
- H5: OPEN. Price the whole link: board + compatible 10G peer/NIC + DAC or two optics/fiber + required accessories + licenses/tax/shipping. Only the board MSRP is quoted here; other prices need actual quotes.
- H6: OPEN. Identify a supported firmware/board-file/IP/tool combination. Run stock boot/BIST before replacing PL, then prove an independent loopback, then custom UDP.
- H7: OPEN. Map RX/TX/control clocks. Target 64-bit data at 156.25 MHz where the chosen interface supports it. Do not force this onto a different MAC clocking configuration.
- H8: OPEN. Plan measurement access: normal NIC timestamps may be too coarse or use different endpoints. ILA and local cycle counters establish internal timing; external wire latency requires a calibrated common timebase.

- V1: OPEN. Run actual RTL and simulator smoke tests.
- V2: OPEN. Review post-route and board evidence.
- R1: OPEN. Advisor-led novelty review.
- C1: No guarantee. Hiring relevance is an inference, not a placement promise.
