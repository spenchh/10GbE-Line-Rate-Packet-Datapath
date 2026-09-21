'use client';
import { useState } from 'react';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Heading, Refs } from './common';
import { budget, encodeQuote, fieldRange, fields, initialValues } from '@/lib/lab';

export function PacketLab() {
  const [values, setValues] = useState(initialValues);
  const [selected, setSelected] = useState(0);
  const [frame, setFrame] = useState(77);
  const [cycles, setCycles] = useState(4);
  let result: ReturnType<typeof encodeQuote> | undefined;
  let error = '';
  try { result = encodeQuote(values); } catch (e) { error = (e as Error).message; }
  const range = fieldRange(selected);
  const calc = budget(frame, 156.25, cycles);
  return <>
    <Heading eyebrow="LEARNING MODEL / NOT AN RTL SIMULATOR" title="Follow one quote through its bytes"><p>Your Python generator packs a synthetic 31-byte payload. This explorer uses the declared format, with exact integer bounds. It does not execute the FPGA design.</p></Heading>
    <div className="lab-layout"><div className="field-form">
      {fields.map((f, i) => <label key={f.name} htmlFor={`field-${f.name}`} className={selected === i ? 'field selected' : 'field'}><span><code>{f.name}</code><small>{f.bits} bits</small></span><Input id={`field-${f.name}`} aria-label={f.name} inputMode="numeric" value={values[i]} onFocus={() => setSelected(i)} onChange={e => setValues(values.map((v, j) => i === j ? e.target.value : v))} /></label>)}
      <div className="actions"><Button variant="outline" onClick={() => { setValues(initialValues); setSelected(0); }}><RotateCcw size={15} />Reset values</Button><Button variant="outline" onClick={() => setValues(initialValues.map((v, i) => i === 3 ? '1743500' : v))}><FlaskConical size={15} />Inject crossed quote</Button></div>
    </div><div className="packet-inspector">
      <div className="source-meta"><strong>Payload, first wire byte first</strong><span>31 bytes / 248 bits</span></div>
      <div className="byte-grid" aria-label="Packet bytes in transmission order">{Array.from({ length: 31 }, (_, byte) => {
        const fi = fields.findIndex((_, i) => { const r = fieldRange(i); return byte >= r.byte && byte < r.byte + r.length; });
        return <button type="button" key={byte} className={`byte ${fi === selected ? 'active' : ''}`} onClick={() => setSelected(fi)} title={`Byte ${byte}: ${fields[fi].name}`} aria-label={`Byte ${byte}, ${fields[fi].name}, ${result?.bytes[byte] ?? 'invalid'}`} aria-pressed={fi === selected}><small>{byte.toString().padStart(2, '0')}</small><span>{result?.bytes[byte] ?? '--'}</span></button>;
      })}</div>
      <div className="field-note"><code>{fields[selected].name}</code><strong>packet_in[{range.high}:{range.low}]</strong><p>{fields[selected].note}</p></div>
      <output aria-live="polite" className={`status ${error || !result?.accepted ? 'warning' : 'success'}`}>{error || (result?.accepted ? 'Encodable and accepted by the proposed v1 quote policy.' : `Encodable, but rejected by v1 policy: ${result?.reasons.join(', ')}.`)}</output>
      <h3>Complete hexadecimal payload</h3><code className="hex-output">{result?.hex ?? 'Fix the input to see the encoded payload.'}</code>
      <p className="small">A 64-bit stream carries 8 + 8 + 8 + 7 bytes. Last beat: <code>tkeep=0x7F</code>, <code>tlast=1</code>. The first wire byte occupies bits [7:0] of the stream beat, unlike the MSB-first whole-packet vector.</p><Refs ids={['axis', 'itch']} />
    </div></div>
    <section className="band"><Heading eyebrow="BUDGET, THEN MEASURE" title="What can 10 Gb/s actually carry?" /><div className="two-col"><div>
      <label className="slider-label" htmlFor="frame-slider">Ethernet frame size<strong>{frame} bytes</strong></label><Slider id="frame-slider" aria-label="Ethernet frame size in bytes" value={[frame]} min={64} max={1518} step={1} onValueChange={v => setFrame(Array.isArray(v) ? v[0] : v)} />
      <p className="small muted">Destination MAC through FCS, excluding preamble and interpacket gap. A frame below 77 bytes cannot contain this complete quote over untagged IPv4/UDP.</p>
      <label className="slider-label" htmlFor="cycles-slider">Internal processing budget<strong>{cycles} cycles</strong></label><Slider id="cycles-slider" aria-label="Internal processing cycles" value={[cycles]} min={0} max={32} step={1} onValueChange={v => setCycles(Array.isArray(v) ? v[0] : v)} />
      <p className="small muted">At 156.25 MHz a clock period is 6.4 ns. Theoretical numbers, not achieved performance.</p>
    </div><div className="metrics metrics-grid"><div><strong>{calc.maxMpps.toFixed(3)}</strong><span>maximum Mframes/s including 20 bytes of wire overhead</span></div><div><strong>{calc.serializationNs.toFixed(1)} ns</strong><span>frame serialization at 10 Gb/s</span></div><div><strong>{calc.logicNs.toFixed(1)} ns</strong><span>internal cycle budget only</span></div><div><strong>{calc.interfaceGbps.toFixed(1)} Gb/s</strong><span>64-bit interface capacity, not measured throughput</span></div></div></div>
      <p className="small">Do not turn these into an advertised tick-to-trade result: MAC/PCS latency, alignment, queues, CDC, validation and output serialization need explicit measurement endpoints. Larger responses can saturate TX before RX.</p><Refs ids={['benchmark', 'pg210']} />
    </section>
  </>;
}
