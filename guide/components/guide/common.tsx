import { ExternalLink } from 'lucide-react';
import { sources, type Source } from '@/lib/guide-data';

export function Refs({ ids }: { ids: string[] }) {
  return <div className="refs">{ids.map(id => {
    const s = sources.find(s => s.id === id);
    return s ? <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title}<ExternalLink size={12} aria-hidden="true" /></a> : null;
  })}</div>;
}
export function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-heading"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{children}</div>;
}
export function Reading({ source: s }: { source: Source }) {
  return <article className="source-item" id={`source-${s.id}`}>
    <div className="source-meta"><span>{s.publisher}</span><span>{s.phase}</span></div>
    <h3><a href={s.url} target="_blank" rel="noreferrer">{s.title}<ExternalLink size={15} aria-hidden="true" /></a></h3>
    <p className="small muted">{s.date} / {s.section}</p>
    <p><mark>{s.highlight}</mark></p>
    {s.quote && <blockquote>&ldquo;{s.quote}&rdquo;<cite>{s.publisher}</cite></blockquote>}
    <p><strong>Project application.</strong> {s.apply}</p>
    <div className="evidence-label">{s.confidence}</div>
  </article>;
}
