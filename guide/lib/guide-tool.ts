import { phases, sources } from './guide-data';

export function lookupMilestone(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Supply a milestoneId.');
  const record = input as Record<string, unknown>;
  if (Object.keys(record).some(k => k !== 'milestoneId')) throw new Error('Unknown input property.');
  const phase = phases.find(p => p.id === record.milestoneId);
  if (!phase) throw new Error('milestoneId must be p1 through p11.');
  return { ...phase, evidenceStatus:'Planned contract; not an executed FPGA result.', references:phase.sources.map(id => { const s=sources.find(s=>s.id===id)!; return {title:s.title,url:s.url,highlight:s.highlight}; }) };
}
