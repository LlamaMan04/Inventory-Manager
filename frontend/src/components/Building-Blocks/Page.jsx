export function Page({ eyebrow, title, action, children }) { 
  return ( 
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </div> 
  );
}