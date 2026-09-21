'use client';
// Device-local preferences are restored after SSR, not derived from render data.
/* oxlint-disable react/react-compiler */
import Image from 'next/image';
import { useGuideTools } from '@/lib/use-guide-tools';
import { useEffect, useState } from 'react';
import { Activity, ArrowRight, BookOpen, ChevronDown, Clock3, Cpu, Download, FileCode2, FlaskConical, Network, Route, ShieldCheck, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading, Refs } from '@/components/guide/common';
import { PacketLab } from '@/components/guide/packet-lab';
import { Architecture, Hardware, Readings, Research, Verification } from '@/components/guide/technical-views';
import { audit, limitations, modules, phases, premise, researchDate, sources } from '@/lib/guide-data';
import { firstWeek } from '@/lib/guide-extra';

const sections = [['start','Start here',Cpu],['roadmap','Roadmap',Route],['architecture','Architecture',Network],['verification','Verification',ShieldCheck],['readings','Reading desk',BookOpen],['lab','Packet lab',Activity],['hardware','Hardware & tools',Terminal],['research','Research',FlaskConical]] as const;
const totalHours=phases.reduce((n,p)=>n+p.hours,0);
const storageKey='fpga-packet-lab-progress-v1';
export default function Guide() {
  useGuideTools();
  const [tab,setTab]=useState('start');
  const [effort,setEffort]=useState(10);
  const [completed,setCompleted]=useState<string[]>([]);
  const [persist,setPersist]=useState(false);
  const [storageError,setStorageError]=useState(false);
  useEffect(()=>{
    const restore=()=>{const v=location.hash.slice(1);if(sections.some(s=>s[0]===v))setTab(v);};
    restore();window.addEventListener('hashchange',restore);
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))setCompleted(Array.from(new Set(saved.filter(id=>phases.some(p=>p.id===id)))));}catch{setStorageError(true);}
    setPersist(true);return()=>window.removeEventListener('hashchange',restore);
  },[]);
  useEffect(()=>{if(persist){try{localStorage.setItem(storageKey,JSON.stringify(completed));}catch{setStorageError(true);}}},[completed,persist]);
  function navigate(v:string){setTab(v);history.replaceState(null,'',`#${v}`);}
  const progressHours=phases.filter(p=>completed.includes(p.id)).reduce((n,p)=>n+p.hours,0);
  return <div className="guide-shell">
    <a className="skip-link" href="#guide-content">Skip to content</a>
    <header className="masthead"><a className="brand" href="#start" onClick={()=>navigate('start')}><Cpu aria-hidden="true"/><span>FPGA Packet Lab</span></a><div className="edition">RESEARCH & BUILD GUIDE<br/>07 SEP 2026 / V1.0</div></header>
    <div className="opening"><div className="eyebrow">10GbE / SYSTEMVERILOG / HARDWARE-SOFTWARE CO-DESIGN</div><h1>10GbE Line-Rate Packet<br className="desktop-break"/> Processing Datapath</h1><p className="lead">A market-data application. A networking-hardware skill set.<br/>An evidence-first path from your first decoder to a measured FPGA system.</p><div className="opening-meta"><span><Clock3 size={15}/>{totalHours} planned hours</span><span><FileCode2 size={15}/>{modules.length} work packages</span><span><BookOpen size={15}/>{sources.length} annotated sources</span><span className="target-label">10G is a target, not a result</span></div></div>
    <Tabs value={tab} onValueChange={v=>navigate(String(v))} className="workspace-tabs"><div className="navigation"><TabsList className="nav-list" aria-label="Guide sections">{sections.map(([id,label,Icon])=><TabsTrigger key={id} value={id} className="nav-trigger"><Icon size={16} aria-hidden="true"/>{label}</TabsTrigger>)}</TabsList></div><main id="guide-content">
      <TabsContent value="start"><div className="start-layout"><div><Heading eyebrow="YOUR NEXT MOVE" title="One packet. One clock edge. One passing test."/><p>You have a Python packet generator. The inspected decoder has an interface, but no RTL behavior yet. Your first milestone is a small registered decoder, not a complete Ethernet stack.</p><div className="next-task"><span className="stage-number">01</span><div><h3>Finish the 248-bit market-data decoder</h3><p>Capture eight fields, align valid, reset deterministically, and reject the explicitly unsupported quote cases. Then prove it in cocotb.</p><Button onClick={()=>navigate('architecture')}>Open the first-block contract<ArrowRight size={16}/></Button></div></div><p><strong>Read for 20 minutes, then implement.</strong> Begin with clock-edge behavior and cocotb scheduling. Save the full Ethernet/exchange specifications for the milestone that needs them.</p><Refs ids={['timingmodel','cocotb']}/></div><figure className="board-overview"><Image unoptimized src="/kr260-board.jpg" alt="AMD Kria KR260 starter kit and network connectors" width="1200" height="1200"/><figcaption>Candidate board. Access, pin mapping and IP licenses remain gates. Image: <a href={sources.find(s=>s.id==='kr260')!.url} target="_blank" rel="noreferrer">AMD</a>.</figcaption></figure></div>
        <section className="band"><Heading eyebrow="THE SYSTEM YOU ARE BUILDING" title="A complete response path, in a controlled lab"/><p>{premise}</p><div className="flow-line"><span>Quote packet</span><ArrowRight/><span>Validated state</span><ArrowRight/><span>Decision + risk</span><ArrowRight/><span>Simulated order</span></div><p className="small">One full-duplex SFP+ port receives quotes and returns intents. A host supplies simulated acknowledgements and fills. No exchange account, real orders or profitable strategy is required.</p><Refs ids={['kr260','ouch']}/></section>
        <section className="band"><Heading eyebrow="THIS WEEK / ABOUT 8-10 HOURS" title="Keep the first finish line close"/><div className="week-list">{firstWeek.map(([day,time,task])=><div key={day}><span className="day">{day}</span><span className="small muted">{time}</span><p>{task}</p></div>)}</div></section>
        <section className="band two-col"><div><Heading eyebrow="CAREER RELEVANCE" title="Make the evidence transferable"/><p>For HFT hardware, the relevant combination is RTL, networking, bounded latency, verification and host software. For broader digital-design roles, timing, CDC, reset, arithmetic, debugging and reproducible tests remain useful.</p><p>This is an inference from role requirements, not an interview promise. A smaller system you can explain and demonstrate is stronger evidence than an unfinished feature list.</p><Refs ids={['hrt','optiver','imc','nvidia']}/></div><div><Heading eyebrow="CURRENT EVIDENCE BOUNDARY" title="Planned is not verified"/><p>{limitations}</p><a className="download-link" href="/project-handbook.md" download><Download size={17}/>Download the project handbook</a></div></section>
        <section className="band"><Heading eyebrow="DESIGN AUDIT" title="The gaps this plan closes"/><div className="audit-grid">{audit.map(a=><article key={a.title}><span className="evidence-label">{a.severity}</span><h3>{a.title}</h3><p>{a.detail}</p><Refs ids={a.refs}/></article>)}</div></section>
      </TabsContent>
      <TabsContent value="roadmap"><Heading eyebrow="11 GATED MILESTONES" title="A year of work, not a year of reading"><p>Week labels assume 10 focused hours per week. Access and learning may stretch the calendar. Repair a failing gate before adding its dependent feature.</p></Heading><div className="roadmap-controls"><div><label className="slider-label" htmlFor="effort">Weekly project time<strong>{effort} hours</strong></label><Slider id="effort" aria-label="Weekly project hours" value={[effort]} min={5} max={15} step={1} onValueChange={v=>setEffort(Array.isArray(v)?v[0]:v)}/><p className="small">{totalHours} / {effort} hours = about {Math.ceil(totalHours/effort)} working weeks, before unexpected delays.</p></div><div className="progress-summary"><strong>{completed.length} / {phases.length}</strong><span>milestone gates marked complete</span><progress value={progressHours} max={totalHours}/><small>Personal checklist only. Not independently verified.</small>{storageError&&<output>Storage is unavailable; changes may not persist.</output>}</div></div>
        <div className="timeline">{phases.map((p,i)=><article className={`phase ${completed.includes(p.id)?'complete':''}`} key={p.id}><div className="phase-rail"><span>{String(i+1).padStart(2,'0')}</span></div><div className="phase-body"><div className="source-meta"><span>WEEKS {p.weeks}</span><span>{p.hours} planned hours</span></div><h3>{p.title}</h3><p className="phase-deliverable">{p.deliverable}</p><details open={i===0}><summary>Build, test, and collect evidence<ChevronDown size={16}/></summary><p><strong>Learn:</strong> {p.learn}</p><ul>{p.build.map(b=><li key={b}>{b}</li>)}</ul><p className="gate"><ShieldCheck size={19}/><span><strong>Exit gate.</strong> {p.gate}</span></p><p><strong>Design challenge.</strong> {p.challenge}</p><p className="small muted"><strong>Dependency:</strong> {p.depends}</p><Refs ids={p.sources}/></details><label className="check-row" htmlFor={`gate-${p.id}`}><Checkbox id={`gate-${p.id}`} checked={completed.includes(p.id)} onCheckedChange={checked=>setCompleted(prev=>checked?Array.from(new Set([...prev,p.id])):prev.filter(id=>id!==p.id))} aria-label={`Evidence collected for ${p.title}`}/><span>Evidence collected and gate reviewed</span></label></div></article>)}</div><div className="status warning"><strong>Scope brake:</strong> correctness, board bring-up and measurements come before ITCH, PCIe, TCP or another protocol.</div>
      </TabsContent>
      <TabsContent value="architecture"><Architecture/></TabsContent><TabsContent value="verification"><Verification/></TabsContent><TabsContent value="readings"><Readings/></TabsContent><TabsContent value="lab"><PacketLab/></TabsContent><TabsContent value="hardware"><Hardware/></TabsContent><TabsContent value="research"><Research/></TabsContent>
    </main></Tabs><footer><span><Cpu size={17}/>FPGA Packet Lab</span><p>Research snapshot: {researchDate}. Targets are not achieved results. Learning guide; no live-trading connection.</p><a href="/project-handbook.md" download><Download size={15}/>Handbook</a></footer>
  </div>;
}
