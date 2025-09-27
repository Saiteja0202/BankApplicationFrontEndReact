import React, { useState } from "react";
import { fetchWithAuth } from "/src/fetchWithAuth.jsx";
import "./Deposits.css";

export default function Deposits() {
  const userId = sessionStorage.getItem("userId");
  const [deposits, setDeposits] = useState([]);
  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const handleFetchDeposits = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/user/${userId}`);
      const data = await res.json();
      setDeposits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error:", err);
      setDeposits([]);
    }
  };
  
  const handleRequestDeposit = async () => {
    const payload = {
      depositType: "FIXED",
      amount: "10000",
      interestRate: "5.5",
      maturityDate: "2025-12-31"
    };
  
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/request/${userId}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
  
      const text = await res.text(); // parse text here
      alert(text);
    } catch (err) {
      console.error("Request failed:", err);
    }
  };
  
  const handleRequestDelete = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/delete-request/user/${selectedDepositId}/${userId}`, {
        method: "PUT"
      });
  
      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error("Delete request failed:", err);
    }
  };
  
  const handleCheckBalance = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/balance/${selectedDepositId}`);
      const balance = await res.text();
      alert(`Balance: ₹${balance}`);
    } catch (err) {
      console.error("Balance check failed:", err);
    }
  };
  
  const hasPendingDeposit = deposits.some(dep => dep.status === "PENDING");
  return (
    <div className="deposits-page">
      <h2>💰 Deposit Services</h2>

      <button onClick={handleRequestDeposit} disabled={hasPendingDeposit}>
      Request New Deposit
    </button>
      <button onClick={handleFetchDeposits}>View My Deposits</button>

      {deposits.length > 0 && (
        <>
          <h3>Your Deposits</h3>
          <ul>
            {deposits.map(dep => (
              <li key={dep.deposit_id}>
                <label>
                  <input
                    type="checkbox"
                    name="selectedDeposit"
                    value={dep.deposit_id}
                    onChange={() => setSelectedDepositId(dep.deposit_id)}

                    
                  />
                  <p>Deposite Type : {dep.depositType} <p>Deposit Amount :  ₹{dep.amount}</p> <p>Deposist Status : {dep.status}</p></p>
                  
                </label>
              </li>
            ))}
          </ul>

          <button onClick={handleRequestDelete} disabled={!selectedDepositId}>
            Request Delete for Selected Deposit
          </button>

          <button onClick={handleCheckBalance} disabled={!selectedDepositId}>
            Check Balance
          </button>
        </>
      )}
    </div>
  );
}
