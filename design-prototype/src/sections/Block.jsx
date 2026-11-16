import { PROPOSAL_MAP } from "../data/proposals.js";
import { usePrototype } from "../prototype/PrototypeContext.jsx";

function Meta({ id }) {
  const item = PROPOSAL_MAP[id];
  return (
    <footer className="meta">
      <span>{item.three ? "3D" : "No 3D"}</span>
      <span>Cost {item.cost}</span>
      <span>{item.original ? "Original" : "Technique reference"}</span>
      <span>{item.technique}</span>
      {item.referenceUrl ? (
        <a href={item.referenceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      ) : (
        <span>No source link</span>
      )}
    </footer>
  );
}

export function Block({ id, children, className = "" }) {
  const { isActive, solo } = usePrototype();
  if (!isActive(id)) return null;
  const item = PROPOSAL_MAP[id];
  const headingId = solo === id ? "solo-title" : `${id}-title`;
  return (
    <section id={id} className={`block ${className}`} aria-labelledby={headingId}>
      <div className="block-copy">
        <p className="eyebrow">{item.three ? "3D proposal" : "Lightweight proposal"}</p>
        {solo === id ? null : <h2 id={`${id}-title`}>{item.name}</h2>}
        <p>{item.purpose}</p>
        <p className="fit">{item.fit}</p>
        <p className="fallback">
          <strong>Fallback. </strong>
          {item.fallback}
        </p>
      </div>
      <div className="block-stage">{children}</div>
      <Meta id={id} />
    </section>
  );
}
