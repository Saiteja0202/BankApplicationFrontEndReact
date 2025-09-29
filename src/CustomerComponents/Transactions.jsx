import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Transactions.css';
import { fetchWithAuth } from '/src/fetchWithAuth.jsx';

export default function Transactions() {
  // ✅ Load accountId from sessionStorage
  const [accountId] = useState(() => sessionStorage.getItem('account_ID') || '');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!accountId) {
      Swal.fire({
        icon: 'warning',
        title: 'Account ID is missing',
        text: 'No Account ID found in session. Please create or select an account first.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(`http://localhost:9876/transactions/account/${accountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      if (data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Transactions Found',
          text: `No transactions found for Account ID: ${accountId}`,
        });
      }

      setTransactions(data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="transactions-container">
      <h1>Transactions</h1>

      {loading && <p>Loading...</p>}

      <div className="transactions-list">
        {transactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.type}</td>
                  <td>₹{tx.amount}</td>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !loading && (
          <p style={{ color: 'gray' }}>No transactions to display.</p>
        )}
      </div>
    </div>
  );
}
