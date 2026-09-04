import { Link } from 'react-router'
import { Page } from './Page'
import { Empty } from './Empty'

export function StockView({ data }) { 
  return ( 
    <Page eyebrow="Operations / stock ledger" title="Stock ledger" action=
      {<Link className="primary inline" to="/move">Move stock <span>→</span></Link>}
    >
      <p className="section-copy">Every item, grouped by its current location.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Barcode</th>
              <th>Location</th>
              <th className="numeric">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.stocks.map((stock) => 
              <tr key={stock.id}>
                <td>
                  <b>{stock.item?.name || `Item #${stock.itemId}`}</b>
                  <small>{stock.item?.description || 'No description'}</small>
                </td>
                <td>{stock.item?.barcode || '—'}</td>
                <td>{stock.location?.name}</td>
                <td className="numeric quantity">{stock.quantity}</td>
              </tr>
            )}
          </tbody>
        </table>
        {!data.stocks.length && <Empty text="No stock positions yet." />}
      </div>
    </Page> 
  );
}