export const fields = [
  { name:'message_type', bits:8, initial:'1', note:'1 identifies the synthetic quote type.' },
  { name:'sequence_number', bits:32, initial:'42', note:'Global stream sequence in v1; this is not a Nasdaq packet header.' },
  { name:'symbol_id', bits:16, initial:'7', note:'Map explicitly to a bounded symbol table before indexing memory.' },
  { name:'bid_price', bits:32, initial:'1743100', note:'With scale 10,000 this represents 174.3100 price units.' },
  { name:'ask_price', bits:32, initial:'1743300', note:'With scale 10,000 this represents 174.3300 price units.' },
  { name:'bid_size', bits:32, initial:'800', note:'Zero size is rejected by the chosen v1 quote policy.' },
  { name:'ask_size', bits:32, initial:'500', note:'This snapshot protocol does not use zero size as a delete instruction.' },
  { name:'timestamp', bits:64, initial:'123456789', note:'Source-provided metadata. Measure freshness with a trusted local receive counter.' },
];
export const initialValues = fields.map(f => f.initial);
export function encodeQuote(values: string[]) {
  if (values.length !== fields.length) throw new Error('Eight fields are required.');
  const parsed = values.map((s, i) => {
    if (!/^\d+$/.test(s)) throw new Error(`${fields[i].name}: enter an unsigned decimal integer.`);
    const n = BigInt(s);
    if (n >= (1n << BigInt(fields[i].bits))) throw new Error(`${fields[i].name}: value exceeds ${fields[i].bits} bits.`);
    return n;
  });
  const hex = parsed.map((v,i) => v.toString(16).padStart(fields[i].bits/4,'0')).join('');
  const reasons = [];
  if (parsed[0] !== 1n) reasons.push('unsupported message type');
  if (parsed[3] > parsed[4]) reasons.push('crossed quote');
  if (parsed[5] === 0n || parsed[6] === 0n) reasons.push('zero size');
  return { hex, bytes:hex.match(/.{2}/g)!, reasons, accepted:reasons.length === 0 };
}
export function fieldRange(index:number) {
  const start = fields.slice(0,index).reduce((s,f)=>s+f.bits,0);
  return { high:247-start, low:248-start-fields[index].bits, byte:start/8, length:fields[index].bits/8 };
}
export function budget(frameBytes:number, clockMHz:number, cycles:number) {
  if (!Number.isFinite(frameBytes) || frameBytes<64 || frameBytes>1518 || !Number.isInteger(frameBytes)) throw new Error('Frame size must be 64-1518 bytes.');
  if (!Number.isFinite(clockMHz)||clockMHz<=0||!Number.isInteger(cycles)||cycles<0) throw new Error('Invalid clock or cycle count.');
  return {serializationNs:frameBytes*8/10, logicNs:cycles*1000/clockMHz, maxMpps:10000/((frameBytes+20)*8), interfaceGbps:64*clockMHz/1000};
}
