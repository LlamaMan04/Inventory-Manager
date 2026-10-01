import { Page } from '../Building-Blocks/Page'
import { Metric } from '../Building-Blocks/Metric'

export function Overview({ data }) { 
  const units = data.stocks.reduce((sum, stock) => sum + stock.quantity, 0); 
  return ( 
    <Page eyebrow="Operations / Overview" title="Good morning">
      <div className="metric-grid">
        <Metric label="Units on hand" value={units.toLocaleString()} detail={`${data.stocks.length} stock positions`} />
        <Metric label="Catalog items" value={data.items.length} detail="Active item records" />
        <Metric label="Locations" value={data.locations.length} detail="Storage destinations" />
      </div>
    </Page> 
  );
}
