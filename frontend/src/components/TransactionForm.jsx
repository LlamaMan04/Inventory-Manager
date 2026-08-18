import { useState } from "react";

export default function TransactionForm() {
  const [ transferType, setTransferType ] = useState("Receive");

  return (
    <div className="transaction-form">
      <h2>Transfer Items</h2>

      <form className="transfer-form">
        <label className="form-label">Barcode</label>
        <input className="form-input" type="text" placeholder="Scan or enter barcode" />

        <label className="form-label">Item</label>
        <input className="form-input" type="text" placeholder="Item name" />

        <label className="form-label">Quantity</label>
        <input className="form-input" type="number" min="1" />

        <label className="form-label">Transfer Type</label>
        <select className="form-input" onChange={(e) => setTransferType(e.target.value)} value={transferType}>
          <option>Receive</option>
          <option>Ship</option>
          <option>Transfer</option>
        </select>

        { (transferType === "Ship" || transferType === "Transfer") && <div>
          <label className="form-label">From Location</label>
          <select className="form-input">
            <option value="">None</option>
          </select>
        </div>}

        { (transferType === "Receive" || transferType === "Transfer") && <div>
          <label className="form-label">To Location</label>
          <select className="form-input">
            <option value="">None</option>
          </select>
        </div> }

        <button className="transfer-submit"type="submit">Submit Transfer</button>
      </form>
    </div>
  );
}
