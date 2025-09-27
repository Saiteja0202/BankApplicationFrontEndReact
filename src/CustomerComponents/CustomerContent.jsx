import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "/src/fetchWithAuth";
import "./CustomerContent.css";

export default function CustomerContent() {
  const navigate = useNavigate();
  const memberId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");
  const [name, setName] = useState(sessionStorage.getItem("name") || "");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSave = () => {
    sessionStorage.setItem("name", name);
    alert("Details updated successfully!");
  };

  const handleCreateAccount = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:9876/accounts/create/${memberId}`, {
        method: "POST",
      });
      if (response.ok) {
        alert("Account created successfully!");
        await fetchAccounts();
      } else {
        const errorText = await response.text();
        alert("Failed to create account: " + errorText);
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      alert("Failed to create account");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await fetchWithAuth(`http://localhost:9876/accounts/${memberId}/delete/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Account deleted successfully!");
        await fetchAccounts();
      } else {
        const errorText = await response.text();
        alert("Failed to delete account: " + errorText);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account");
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`http://localhost:9876/accounts/user/${memberId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched accounts data:", data);

      if (!Array.isArray(data)) {
        setAccounts([]);
        setError("Unexpected data format received from server.");
        return;
      }

      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to fetch accounts.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="home-content">

  <div className="details-container">


    <section className="details-box">
      <div className="details">
      <h2>User Details</h2>
      <label>
        Name:<br></br>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Member ID:<br></br>
        <input type="text" value={memberId} disabled />
      </label>
      <label>
        Role:
        <br></br>
        <input type="text" value={role} disabled />
      </label>
      <button onClick={handleSave}>Save</button>
      </div>
    </section>

    <section className="details-box">
      <h2>Account Details</h2>
      {loading ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : accounts.length > 0 ? (
        <ul className="account-list">
          {accounts.map((acc, index) => (
            <li key={acc.account_id ?? index}>
              <p><span>Account Number: </span>{acc.accountNumber}</p>
              <p><span>Account Type: </span>{acc.accountType}</p>
              <p><span>Balance: </span>₹{acc.balance}</p>
              <button
                onClick={() => handleDeleteAccount(acc.account_id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p>No accounts found.</p>
          <button onClick={handleCreateAccount}>Create Account</button>
        </>
      )}
    </section>
  </div>

  <section className="dashboard-grid">
    <div className="dashboard-card" onClick={() => navigate("/customerhome/cards")}>
      <h3>💳 Cards</h3>
      <p>Manage your debit and credit cards.</p>
    </div>
    <div className="dashboard-card" onClick={() => navigate("/customerhome/deposits")}>
      <h3>🏦 Deposits</h3>
      <p>View and manage your savings.</p>
    </div>
    <div className="dashboard-card" onClick={() => navigate("/customerhome/transactions")}>
      <h3>📄 Transactions</h3>
      <p>Track your recent payments.</p>
    </div>
    <div className="dashboard-card" onClick={() => navigate("/customerhome/loans")}>
      <h3>💰 Loans</h3>
      <p>Apply for personal or business loans.</p>
    </div>
  </section>
</div>

  );
}
