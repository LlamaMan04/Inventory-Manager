import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Page } from '../Building-Blocks/Page'
import { Empty } from '../Building-Blocks/Empty'

export function StockView({ data }) { 
  const [sortBy, setSortBy] = useState({ field: 'item', direction: 'asc' })

  const sortValue = (stock, field) => {
    if (field === 'quantity') return stock.quantity
    if (field === 'location') return stock.location?.name || ''
    if (field === 'barcode') return stock.item?.barcode || ''
    return stock.item?.name || `Item #${stock.itemId}`
  }

  const handleSort = (field) => {
    setSortBy((current) => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortIndicator = (field) => sortBy.field === field ? (sortBy.direction === 'asc' ? '↑' : '↓') : ''
  const sortState = (field) => sortBy.field === field ? (sortBy.direction === 'asc' ? 'ascending' : 'descending') : 'none'

  const sortedStocks = useMemo(() => {
    const multiplier = sortBy.direction === 'desc' ? -1 : 1

    return [...data.stocks].sort((first, second) => {
      const firstValue = sortValue(first, sortBy.field)
      const secondValue = sortValue(second, sortBy.field)

      if (sortBy.field === 'quantity') return (firstValue - secondValue) * multiplier
      return firstValue.localeCompare(secondValue, undefined, { numeric: true, sensitivity: 'base' }) * multiplier
    })
  }, [data.stocks, sortBy])

  return ( 
    <Page eyebrow="Operations / stock ledger" title="Stock ledger" action=
      {<Link className="primary inline" to="/move">Move stock <span>→</span></Link>}
    >
      <p className="section-copy">Every item, grouped by its current location.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th aria-sort={sortState('item')}>
                <button type="button" className="sort-header" onClick={() => handleSort('item')}>
                  Item <span aria-hidden="true">{sortIndicator('item')}</span>
                </button>
              </th>
              <th aria-sort={sortState('barcode')}>
                <button type="button" className="sort-header" onClick={() => handleSort('barcode')}>
                  Barcode <span aria-hidden="true">{sortIndicator('barcode')}</span>
                </button>
              </th>
              <th aria-sort={sortState('location')}>
                <button type="button" className="sort-header" onClick={() => handleSort('location')}>
                  Location <span aria-hidden="true">{sortIndicator('location')}</span>
                </button>
              </th>
              <th className="numeric" aria-sort={sortState('quantity')}>
                <button type="button" className="sort-header" onClick={() => handleSort('quantity')}>
                  Quantity <span aria-hidden="true">{sortIndicator('quantity')}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => 
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
