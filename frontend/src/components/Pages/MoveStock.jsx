import { useState } from 'react'
import { Page } from './Page'

export function MoveStock({ data, api, run }) { 
  const [type, setType] = useState('receive'); 
  const [form, setForm] = useState({ itemId: '', from: '', to: '', quantity: '' }); 
  
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value }); 
  
  const submit = (e) => { 
    e.preventDefault(); 
    const amount = Number(form.quantity); 
    const source = data.stocks.find((s) => s.itemId === Number(form.itemId) && s.locationId === Number(form.from)); 
    const destination = data.stocks.find((s) => s.itemId === Number(form.itemId) && s.locationId === Number(form.to)); 
    if (type !== 'receive' && (!source || source.quantity < amount)) 
      return run(() => Promise.reject(new Error('Not enough stock at the source location.')), ''); 
    
    return run(async () => { 
      if (type !== 'receive') 
        await api.updateStock(source.id, { quantity: source.quantity - amount, locationId: source.locationId }); 
      if (type !== 'ship') { 
        if (destination) 
          await api.updateStock(destination.id, { 
            quantity: destination.quantity + amount, 
            locationId: destination.locationId 
          }
        ); 
        else 
          await api.createStock({ 
            itemId: Number(form.itemId), 
            quantity: amount, 
            locationId: Number(form.to) 
          }) 
      } 
    }, 'Stock movement recorded.').then(() => setForm({ ...form, quantity: '' })) 
  }; 
  
  return ( 
    <Page eyebrow="Operations / movement" title="Move stock">
      <div className="form-layout">
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
          <button className="primary" type="submit">
            Record {type} 
            <span>→</span>
          </button>
        </form>
        <div className="form-aside">
          <p className="eyebrow">How it works</p>
          <h2>Make the floor<br /><em>match reality.</em></h2>
          <p>Existing positions combine automatically when stock arrives at a destination.</p>
        </div>
      </div>
    </Page> 
  );
}