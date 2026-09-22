import { useEffect, useState } from 'react'
import { Page } from '../Building-Blocks/Page'

const pendingMovesStorageKey = 'inventory_pending_moves'

export function MoveStock({ data, api, run }) {
  const [type, setType] = useState('receive')
  const [form, setForm] = useState({ itemId: '', barcode: '', from: '', to: '', quantity: '' })
  const [pending, setPending] = useState(() => {
    try {
      const storedMoves = sessionStorage.getItem(pendingMovesStorageKey)
      return storedMoves ? JSON.parse(storedMoves) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    sessionStorage.setItem(pendingMovesStorageKey, JSON.stringify(pending))
  }, [pending])

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const scanBarcode = (e) => {
    const barcode = e.target.value
    const item = data.items.find((candidate) => candidate.barcode === barcode.trim())
    setForm({ ...form, barcode, itemId: item ? String(item.id) : barcode.trim() ? '' : form.itemId })
  }

  const projectedQuantity = (itemId, locationId) => {
    const current = data.stocks.find((stock) => stock.itemId === itemId && stock.locationId === locationId)?.quantity || 0
    return pending.reduce((quantity, move) => {
      if (move.itemId !== itemId) return quantity
      if (move.type !== 'receive' && move.from === locationId) return quantity - move.quantity
      if (move.type !== 'ship' && move.to === locationId) return quantity + move.quantity
      return quantity
    }, current)
  }

  const submit = (e) => {
    e.preventDefault()
    const itemId = Number(form.itemId)
    const amount = Number(form.quantity)
    const from = Number(form.from)
    const to = Number(form.to)

    if (!itemId) return run(() => Promise.reject(new Error('Select an item or scan a valid barcode.')), '')
    if (type !== 'receive' && projectedQuantity(itemId, from) < amount)
      return run(() => Promise.reject(new Error('Not enough stock at the source location.')), '')

    setPending([...pending, {
      type,
      itemId,
      from: type === 'receive' ? undefined : from,
      to: type === 'ship' ? undefined : to,
      quantity: amount
    }])
    setForm({ ...form, quantity: '' })
  }

  const finalize = () => run(() => api.moveStock(pending), 'Stock movements finalized.').then((success) => {
    if (success) {
      setPending([])
      sessionStorage.removeItem(pendingMovesStorageKey)
      setForm({ itemId: '', barcode: '', from: '', to: '', quantity: '' })
    }
  })
  
  return ( 
    <Page eyebrow="Operations / movement" title="Move stock">
      <div className="move-layout">
        <form className="panel stack-form" onSubmit={submit}>
          <div className="segmented">
            {['receive', 'ship', 'transfer'].map((option) => 
              <button 
                type="button" 
                className={type === option ? 'selected' : ''} 
                onClick={() => setType(option)} 
                key={option}
              >
                {option}
              </button>
            )}
          </div>
          <label>
            Item
            <select value={form.itemId} onChange={change('itemId')} required>
              <option value="">Select an item</option>
              {data.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            Barcode
            <input type="text" value={form.barcode} onChange={scanBarcode} placeholder="Scan barcode" />
          </label>
          {type !== 'receive' && <label>
            From location
            <select value={form.from} onChange={change('from')} required>
              <option value="">Select source</option>
              {data.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>}
          {type !== 'ship' && <label>
            To location
            <select value={form.to} onChange={change('to')} required>
              <option value="">Select destination</option>
              {data.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
            </select>
          </label>}
          <label>
            Quantity
            <input type="number" min="1" step="1" value={form.quantity} onChange={change('quantity')} required />
          </label>
          <button className="primary" type="submit">Add to pending moves <span>+</span></button>
        </form>
        <section className="pending-section">
          <p className="eyebrow">Pending moves / {pending.length}</p>
          <div className="table-wrap pending-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Movement</th>
                  <th>From</th>
                  <th>To</th>
                  <th className="numeric">Quantity</th>
                  <th> </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((move, index) => {
                  const item = data.items.find((candidate) => candidate.id === move.itemId)
                  const from = data.locations.find((location) => location.id === move.from)?.name
                  const to = data.locations.find((location) => location.id === move.to)?.name
                  return <tr key={`${move.itemId}-${index}`}>
                    <td><b>{item?.name || `Item #${move.itemId}`}</b></td>
                    <td>{move.type}</td>
                    <td>{from || 'External'}</td>
                    <td>{to || 'External'}</td>
                    <td className="numeric quantity">{move.quantity}</td>
                    <td><button className="table-action" type="button" onClick={() => setPending(pending.filter((_, pendingIndex) => pendingIndex !== index))}>Remove</button></td>
                  </tr>
                })}
              </tbody>
            </table>
            {!pending.length && <p className="pending-empty">No movements staged yet.</p>}
          </div>
          {!!pending.length && <button className="primary finalize-button" type="button" onClick={finalize}>Finalize all <span>→</span></button>}
        </section>
      </div>
    </Page> 
  );
}