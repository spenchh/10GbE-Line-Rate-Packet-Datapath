import test from 'node:test';
import assert from 'node:assert/strict';
import { budget, encodeQuote, fieldRange, fields, initialValues } from '../lib/lab.ts';
import { modules, phases, sources } from '../lib/guide-data.ts';
import { requirements } from '../lib/guide-extra.ts';

test('independent known vector: exact widths, leading zeros, byte order', () => {
  const expected = ['01','0000002a','0007','001a98fc','001a99c4','00000320','000001f4','00000000075bcd15'].join('');
  const actual = encodeQuote(initialValues);
  assert.equal(actual.hex, expected);
  assert.equal(actual.hex.length, 62);
  assert.equal(actual.bytes.length, 31);
  assert.equal(actual.accepted, true);
});
test('every field accepts its maximum and rejects overflow without wrapping', () => {
  fields.forEach((f,i) => {
    const v = [...initialValues];
    v[i] = ((1n << BigInt(f.bits))-1n).toString();
    assert.doesNotThrow(() => encodeQuote(v));
    v[i] = (1n << BigInt(f.bits)).toString();
    assert.throws(() => encodeQuote(v), /exceeds/);
  });
});
test('64-bit timestamp retains precision beyond JavaScript Number', () => {
  const v = [...initialValues]; v[7]='18446744073709551615';
  assert.ok(encodeQuote(v).hex.endsWith('ffffffffffffffff'));
  v[7]='9007199254740993';
  assert.ok(encodeQuote(v).hex.endsWith('0020000000000001'));
});
test('invalid decimal encodings and wrong field count fail', () => {
  for (const invalid of ['-1','1.5','NaN','Infinity','',' 1','1e3','0x10']) {
    const v=[...initialValues];v[0]=invalid;assert.throws(()=>encodeQuote(v));
  }
  assert.throws(()=>encodeQuote(initialValues.slice(1)));
});
test('encoding validity is distinct from chosen quote policy', () => {
  let v=[...initialValues];v[0]='2';assert.deepEqual(encodeQuote(v).reasons,['unsupported message type']);
  v=[...initialValues];v[3]='1743500';assert.deepEqual(encodeQuote(v).reasons,['crossed quote']);
  v=[...initialValues];v[5]='0';assert.deepEqual(encodeQuote(v).reasons,['zero size']);
  v=[...initialValues];v[3]=v[4];assert.equal(encodeQuote(v).accepted,true);
});
test('all 248 bits and 31 bytes have exactly one owner', () => {
  assert.equal(fields.reduce((n,f)=>n+f.bits,0),248);
  assert.deepEqual(fieldRange(0),{high:247,low:240,byte:0,length:1});
  assert.deepEqual(fieldRange(7),{high:63,low:0,byte:23,length:8});
  const bits=fields.flatMap((_,i)=>{const r=fieldRange(i);return Array.from({length:r.high-r.low+1},(_,j)=>r.low+j);});
  assert.equal(new Set(bits).size,248);
  for(let i=1;i<fields.length;i++)assert.equal(fieldRange(i-1).low-1,fieldRange(i).high);
});
test('wire budget includes preamble and gap and does not claim measured latency', () => {
  const b=budget(64,156.25,4);
  assert.ok(Math.abs(b.maxMpps-14.880952380952381)<1e-10);
  assert.equal(b.serializationNs,51.2);assert.equal(b.logicNs,25.6);assert.equal(b.interfaceGbps,10);
  assert.equal(budget(77,156.25,0).serializationNs,61.6);
  for(const size of [0,63,1519,64.5,NaN])assert.throws(()=>budget(size,156.25,4));
  for(const count of [-1,0.1,NaN])assert.throws(()=>budget(77,156.25,count));
  assert.throws(()=>budget(77,0,4));
});
test('roadmap effort, identifiers, source URLs and references are consistent', () => {
  assert.equal(phases.reduce((n,p)=>n+p.hours,0),520);
  for(const items of [phases,modules,sources])assert.equal(new Set(items.map(x=>x.id)).size,items.length);
  const ids=new Set(sources.map(s=>s.id));
  sources.forEach(s=>{assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.section&&s.highlight&&s.apply&&s.confidence);});
  modules.forEach(m=>{assert.ok(m.cases.length>=6&&m.contract&&m.evidence);m.refs.forEach(r=>assert.ok(ids.has(r),r));});
  phases.forEach(p=>p.sources.forEach(r=>assert.ok(ids.has(r),r)));
  const mids=new Set(modules.map(m=>m.id));
  requirements.forEach(r=>r[3].split(', ').forEach(id=>assert.ok(mids.has(id),id)));
});
