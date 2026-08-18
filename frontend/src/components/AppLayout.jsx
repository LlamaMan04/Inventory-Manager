import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import Dashboard from './Dashboard';
import TransactionForm from './TransactionForm';
import StockTable from './StockTable';

export default function AppLayout({ }) {
  const [activeLink, setActiveLink] = useState("/");

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="top-nav">
          <h1>Inventory Management</h1>
        </header>

        <div className="main-layout">
          <aside className="sidebar">

            <Link 
              className={`nav-link ${activeLink === "/" ? "active" : ""}`} 
              to="/"
              onClick={() => setActiveLink("/")}
            >
              Dashboard
            </Link>

            <Link 
              className={`nav-link ${activeLink === "/stock" ? "active" : ""}`} 
              to="/stock"
              onClick={() => setActiveLink("/stock")}
            >
              Stock Levels
            </Link>

            <Link 
              className={`nav-link ${activeLink === "/transfer" ? "active" : ""}`} 
              to="/transfer"
              onClick={() => setActiveLink("/transfer")}
            >
              Transfer Items
            </Link>

          </aside>

          <main className="content-area">
            <Routes>
              <Route path="/" element={ <Dashboard /> } />
              <Route path="/stock" element={ <StockTable items={testItems} /> }/>
              <Route path="/transfer" element={ <TransactionForm /> }/>
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

let testItems = [
  {
    "item_id": 1,
    "sku": 1234,
    "name": "Test item 1",
    "current_stock": 30
  },
  {
    "item_id": 2,
    "sku": 3456,
    "name": "Test item 2",
    "current_stock": 20
  },
  {
    "item_id": 3,
    "sku": 5678,
    "name": "Test item 3",
    "current_stock": 10
  }
];