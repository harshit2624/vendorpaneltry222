import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [store, setStore] = useState('YOUR_SHOPIFY_STORE.myshopify.com');
  const [clientId, setClientId] = useState('YOUR_SHOPIFY_CLIENT_ID');
  const [clientSecret, setClientSecret] = useState('YOUR_SHOPIFY_SECRET');
  const [connected, setConnected] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setupShopify = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store, clientId, clientSecret })
      });
      const data = await response.json();
      if (data.success) {
        setConnected(true);
        fetchOrders();
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
    }
  };

  return (
    <div className="app">
      <h1>Shopify Vendor Panel - Orders</h1>
      
      {!connected ? (
        <div className="setup-form">
          <h2>Setup Shopify Connection</h2>
          <input
            type="text"
            placeholder="Store (e.g., mystore.myshopify.com)"
            value={store}
            onChange={(e) => setStore(e.target.value)}
          />
          <input
            type="text"
            placeholder="Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
          />
          <button onClick={setupShopify} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect & Fetch Orders'}
          </button>
        </div>
      ) : (
        <div>
          <button onClick={fetchOrders}>Refresh Orders</button>
          {loading && <p>Loading...</p>}
          {error && <p style={{color: 'red'}}>{error}</p>}
          <div className="orders-table">
            <h2>Recent Orders (Last 10)</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.name}</td>
                    <td>{order.total_price} {order.currency}</td>
                    <td>{order.financial_status}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .app { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .setup-form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        input { display: block; width: 100%; margin: 10px 0; padding: 10px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { background: #ccc; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
        .orders-table { margin-top: 20px; }
      `}</style>
    </div>
  );
}

export default App;
