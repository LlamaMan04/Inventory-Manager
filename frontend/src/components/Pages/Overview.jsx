import { Link } from 'react-router'
import { Page } from './Page'
import { Metric } from './Metric'

export function Overview({ data }) { 
  const units = data.stocks.reduce((sum, stock) => sum + stock.quantity, 0); 
  return ( 
    <Page eyebrow="Operations / Overview" title="Good morning">
      <div className="metric-grid">
        <Metric label="Units on hand" value={units.toLocaleString()} detail={`${data.stocks.length} stock positions`} />
        <Metric label="Catalog items" value={data.items.length} detail="Active item records" />
        <Metric label="Locations" value={data.locations.length} detail="Storage destinations" />
      </div>
      <section className="feature-band">
        <div>
          <p className="eyebrow">Today’s focus</p>
          <h2>Inventory, without<br /><em>the guesswork.</em></h2>
          <p>Inspect every position, or move stock when the floor changes.</p>
        </div>
        <Link className="primary inline" to="/move">Move stock <span>→</span></Link>
      </section>
    </Page> 
  );
}