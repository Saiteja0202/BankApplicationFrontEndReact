import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "/src/fetchWithAuth";
import Swal from "sweetalert2";
import "./CustomerContent.css";

export default function CustomerContent() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  const [name, setName] = useState(sessionStorage.getItem("name") || "");
  const [email, setEmail] = useState(sessionStorage.getItem("email") || "");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:9876/users/update-details/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        }
      );

      if (response.ok) {
        sessionStorage.setItem("name", name);
        sessionStorage.setItem("email", email);
        Swal.fire("Success", "Details updated successfully!", "success");
      } else {
        const errorText = await response.text();
        Swal.fire("Error", "Failed to update details: " + errorText, "error");
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      Swal.fire("Error", "An error occurred while updating details.", "error");
    }
  };

  const handleCreateAccount = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:9876/accounts/create/${userId}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        Swal.fire("Success", "Account created successfully!", "success");
        await fetchAccounts();
      } else {
        const errorText = await response.text();
        Swal.fire("Error", "Failed to create account: " + errorText, "error");
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      Swal.fire("Error", "Failed to create account", "error");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:9876/accounts/${userId}/delete/${accountId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        Swal.fire("Deleted!", "Account deleted successfully.", "success");
        await fetchAccounts();
      } else {
        const errorText = await response.text();
        Swal.fire("Error", "Failed to delete account: " + errorText, "error");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      Swal.fire("Error", "Failed to delete account", "error");
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        `http://localhost:9876/accounts/user/${userId}`
      );

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
          <h2>User Details</h2>
          <div className="details">
            <label>
              Name:<br />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              Email:<br />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <div className="inline-fields">
              <label>
                User ID:<br />
                <input type="text" value={userId} disabled />
              </label>

              <label>
                Role:<br />
                <input type="text" value={role} disabled />
              </label>
            </div>

            <button onClick={handleSave}>Save</button>
          </div>
        </section>

        <section className="details-box">
          <h2>Account Details</h2>
          <div className="details1">
            {loading ? (
              <p>Loading accounts...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : accounts.length > 0 ? (
              <ul className="account-list">
                {accounts.map((acc, index) => (
                  <li key={acc.account_id ?? index}>
                    <p>
                      <span>Account Number : </span>
                      {acc.accountNumber}
                    </p>
                    <p>
                      <span>Account Type : </span>
                      {acc.accountType}
                    </p>
                    <p>
                      <span>Balance : </span>₹{acc.balance}
                    </p>
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
          </div>
        </section>
      </div>

      <section className="dashboard-grid">
        <div
          className="dashboard-card"
          onClick={() => navigate("/customerhome/cards")}
        >
          <h3>💳 Cards</h3>
          <p>Manage your debit and credit cards.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/customerhome/deposits")}
        >
          <h3>🏦 Deposits</h3>
          <p>View and manage your savings.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/customerhome/transactions")}
        >
          <h3>📄 Transactions</h3>
          <p>Track your recent payments.</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/customerhome/loans")}
        >
          <h3>💰 Loans</h3>
          <p>Apply for personal or business loans.</p>
        </div>
      </section>
    </div>
  );
}
