export default function StockTable({ items }) {
  return (
    <div className="stock-table">
      <h2>Current Stock</h2>

      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Current Stock</th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.item_id}>
              <td>{item.sku}</td>
              <td>{item.name}</td>
              <td>{item.current_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
