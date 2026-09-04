export function Metric({ label, value, detail }) { 
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div> 
  );
}