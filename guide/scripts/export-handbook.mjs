import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { audit, glossary, limitations, modules, phases, premise, researchDate, sources } from '../lib/guide-data.ts';
import { acceptance, firstWeek, hardwareGates, questions, requirements, researchPlan, stack } from '../lib/guide-extra.ts';
import { fields, fieldRange } from '../lib/lab.ts';

const root=new URL('../',import.meta.url);
const refs=ids=>ids.map(id=>{const s=sources.find(s=>s.id===id);if(!s)throw new Error(`Missing source ${id}`);return `[${s.title}](${s.url})`;}).join('; ');
const list=items=>items.map(s=>`- ${s}`).join('\n');
const parts=[
  '# FPGA Packet Lab: Research and Build Handbook',
  `Research edition: ${researchDate}. Audience: a beginner FPGA engineer building a substantial personal project.`,
  '## Executive Answer',
  premise,
  'This is a credible, demanding engineering project when it produces verified RTL, a reproducible software toolchain, reviewed timing/CDC results and a measured hardware demonstration. Networking and hardware/software co-design make its skills transferable. This relevance is an inference from official role descriptions, not employer endorsement or a guarantee of hiring.',
  refs(['hrt','optiver','imc','nvidia']),
  limitations,
  '## Scope and Boundaries',
  'Core: one full-duplex 10G endpoint; synthetic 31-byte quotes; bounded quote state; integer-scaled decision; hardware risk admission; simulated order feedback; C++ host/control and Python verification; scripted FPGA build and measurements. Not a complete exchange stack, SmartNIC, production trading system, or profitability experiment. Static isolated lab addressing and neighbor configuration are the initial network profile. Address filtering is not authentication. Keep personal work separate from employer IP and networks.',
  '## First Week',
  firstWeek.map(([s,t,a])=>`### ${s} / ${t}\n${a}`).join('\n\n'),
  '## Design Audit',
  audit.map(a=>`### ${a.title}\n${a.severity}. ${a.detail}\n\n${refs(a.refs)}`).join('\n\n'),
  '## Architecture',
  'Wire -> SFP+/GTH/PCS/MAC -> tentative Ethernet/IPv4/UDP and payload parse -> complete-frame integrity commit -> sequence health and bounded quote table -> integer decision -> atomic risk/queue reservation -> OrderIntent-v1 encoder/TX -> simulated venue. Validated feedback returns to an order tracker. AXI-Lite shadow/commit registers form the control plane; tagged counters and ILA form the observation plane.',
  'Integrity must precede durable state writes and orders. Tentative parsing may overlap reception; it does not authorize speculative transmission. Backpressure is local, not a guarantee that incoming wire traffic stops. Define whole-frame overload behavior and the response-expansion budget.',
  refs(['pg210','axis','udp','ipv4','ouch']),
  '### First-block packet format',
  '| Field | Bits | Vector slice | First wire byte | Example |\n|---|---:|---|---:|---|\n'+fields.map((f,i)=>{const r=fieldRange(i);return `| ${f.name} | ${f.bits} | [${r.high}:${r.low}] | ${r.byte} | ${f.initial} |`;}).join('\n'),
  'Unsigned big-endian fields, price scale 10,000. Specify timestamp units before using it beyond opaque metadata. The earliest wire byte maps to bits [7:0] on the proposed 64-bit stream; the whole payload uses message_type at [247:240]. Three full beats plus one seven-byte beat: last tkeep=0x7F. This is synthetic Payload-v1, not Nasdaq ITCH.',
  '## Requirements',
  requirements.map(([id,title,statement,owners])=>`### ${id}: ${title}\n${statement}\nOwners: ${owners}`).join('\n\n'),
  '## Timeline',
  '520 planned hours over 52 working weeks at 10 hours/week. This is an estimate, not a deadline guarantee. Hardware gates run in parallel from week one. At 8 hours/week the arithmetic is 65 working weeks; calendar breaks and debugging add time.',
  phases.map(p=>`### Weeks ${p.weeks}: ${p.title}\n${p.hours} planned hours. ${p.deliverable}\n\nLearn: ${p.learn}\n\n${list(p.build)}\n\nExit gate: ${p.gate}\n\nChallenge: ${p.challenge}\n\nDependencies: ${p.depends}\n\n${refs(p.sources)}`).join('\n\n'),
  '## Module and Software Contracts',
  'The following cases are required planned tests, not executed results. This list is not exhaustive: integration, parameter sweeps, coverage feedback and discovered bugs must extend it.',
  modules.map(m=>`### ${m.id}: ${m.name}\n${m.language}; weeks ${m.phase}. ${m.role}\n\nContract: ${m.contract}\n\nEdge cases:\n${list(m.cases)}\n\nEvidence: ${m.evidence}\n\n${refs(m.refs)}`).join('\n\n'),
  '## Acceptance and Evidence',list(acceptance),
  '## Hardware Gates',list(hardwareGates),refs(['kr260','kriaip','bist','license','features']),
  '## Tools',stack.map(s=>`### ${s.name} / ${s.when}\n${s.purpose}\n\nEvidence: ${s.proof}`).join('\n\n'),refs(['versions','cocotb','verilator','uvm','xsim','formal','tcl','cdc']),
  '## Research Experiment',researchPlan.question,`Hypothesis: ${researchPlan.hypothesis}`,list(researchPlan.variants),'### Controls',list(researchPlan.controls),'### Measures',list(researchPlan.measures),researchPlan.limitations,refs(['feedpaper','corundum','parserpaper','benchmark']),
  '## Learning Challenges',
  'Run a fault tournament: predict counts and state for healthy traffic, same-symbol bursts, bad final bytes, sequence gaps, full queues, kill, duplicate feedback, delayed fills and link restart. Score only when the independent model agrees. Keep a short bug notebook. Ask AI for hints and adversarial review; write expectations and reproduce results yourself.',
  questions.map(([q,a])=>`### ${q}\n${a}`).join('\n\n'),
  '## Glossary',glossary.map(([t,d])=>`- **${t}:** ${d}`).join('\n'),
  '## Research Method and Remaining Gaps',
  'The audit combined direct source inspection and targeted internet research on employer skills, board/IP integration, protocol edge cases, simulator/tool limits, prior implementations and measurement methodology. Official standards, specifications, maintainer documentation, author-hosted papers and official job descriptions were prioritized. Informal conversations and forum opinions informed questions but were not treated as universal requirements. Three related papers establish context, not an exhaustive novelty review.',
  'Research stopped after major architecture and tooling claims had primary references and unresolved items could be turned into explicit implementation gates. Remaining gaps: exact carrier pin/refclk audit, available hardware, license entitlement, tested simulator pairing, delivered costs, research novelty and all actual implementation/measurement outcomes. Indexed NVIDIA text supports skill extraction only; current application availability was not established. Changing sources are dated, and old IP documentation must match the actual generated instance.',
  '## Annotated Source Desk',
  'Highlights below are paraphrases, except text explicitly marked as a direct quote. Use the named section and apply the relevant contract; do not read every document before writing the first block.',
  sources.map(s=>`### ${s.title}\n${s.publisher}. ${s.date}.\n\n[Primary source](${s.url})\n\nSection: ${s.section}\n\nHighlight: ${s.highlight}\n\nProject application: ${s.apply}\n\nEvidence boundary: ${s.confidence}${s.quote?`\n\nShort direct quote: "${s.quote}"`:''}`).join('\n\n'),
  '## Images',
  'KR260 board and annotated interface photos: AMD product imagery, linked and attributed in the guide. They are reference photographs, not evidence of personally owned or tested hardware.',
];
const report=parts.join('\n\n')+'\n';
mkdirSync(new URL('research/',root),{recursive:true});
writeFileSync(new URL('research/report-source.md',root),report);
writeFileSync(new URL('public/project-handbook.md',root),report);
writeFileSync(new URL('research/source-ledger.json',root),JSON.stringify({researchDate,method:'Primary-source web audit; scope and access boundaries in each entry.',sources},null,2)+'\n');
writeFileSync(new URL('research/gap-matrix.md',root),'# Remaining Evidence Gates\n\n'+hardwareGates.map((g,i)=>`- H${i+1}: OPEN. ${g}`).join('\n')+'\n\n- V1: OPEN. Run actual RTL and simulator smoke tests.\n- V2: OPEN. Review post-route and board evidence.\n- R1: OPEN. Advisor-led novelty review.\n- C1: No guarantee. Hiring relevance is an inference, not a placement promise.\n');
console.log(JSON.stringify({canonical:fileURLToPath(new URL('research/report-source.md',root)),sources:sources.length,modules:modules.length,plannedCases:modules.reduce((n,m)=>n+m.cases.length,0),hours:phases.reduce((n,p)=>n+p.hours,0),words:report.split(/\s+/).length},null,2));
