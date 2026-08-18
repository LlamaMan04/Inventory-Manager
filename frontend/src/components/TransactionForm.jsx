export default function TransactionForm() {
  return (
    <div className="transaction-form">
      <h2>New Inventory Transaction</h2>

      <form>
        <label>Barcode</label>
        <input type="text" placeholder="Scan or enter barcode" />

        <label>Item</label>
        <input type="text" placeholder="Item name" />

        <label>From Location</label>
        <select>
          <option value="">None</option>
        </select>

        <label>To Location</label>
        <select>
          <option value="">None</option>
        </select>

        <label>Quantity</label>
        <input type="number" min="1" />

        <label>Transaction Type</label>
        <select>
          <option>receive</option>
          <option>ship</option>
          <option>transfer</option>
          <option>adjust</option>
        </select>

        <button type="submit">Submit Transaction</button>
      </form>
    </div>
  );
}
