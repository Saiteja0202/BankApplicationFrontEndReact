import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "/src/fetchWithAuth.jsx";
import "./Deposits.css";

export default function Deposits() {
  const userId = sessionStorage.getItem("userId");
  const [deposits, setDeposits] = useState([]);
  const [selectedDepositId, setSelectedDepositId] = useState(null);

  // For popup form
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    depositType: "FIXED",
    amount: "",
    interestRate: "",
    maturityDate: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    handleFetchDeposits();
  }, []); // Fetch deposits once on mount

  const handleFetchDeposits = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/user/${userId}`);
      const data = await res.json();
      setDeposits(Array.isArray(data) ? data : []);
      setSelectedDepositId(null);
    } catch (err) {
      console.error("Error:", err);
      setDeposits([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch deposits.",
      });
    }
  };

  const openDialog = () => {
    setFormData({
      depositType: "FIXED",
      amount: "",
      interestRate: "",
      maturityDate: "",
    });
    setFormError("");
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestDeposit = async () => {
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0 ||
      !formData.interestRate ||
      isNaN(formData.interestRate) ||
      Number(formData.interestRate) <= 0 ||
      !formData.maturityDate
    ) {
      setFormError("Please fill in valid values for all fields.");
      return;
    }

    try {
      const payload = {
        depositType: formData.depositType,
        amount: formData.amount,
        interestRate: formData.interestRate,
        maturityDate: formData.maturityDate,
      };

      const res = await fetchWithAuth(`http://localhost:9876/deposits/request/${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text,
      });

      closeDialog();
      handleFetchDeposits();
    } catch (err) {
      console.error("Request failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to submit deposit request.",
      });
    }
  };

  const handleRequestDelete = async () => {
    try {
      const res = await fetchWithAuth(
        `http://localhost:9876/deposits/delete-request/user/${selectedDepositId}/${userId}`,
        { method: "PUT" }
      );

      const text = await res.text();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text,
      });

      handleFetchDeposits();
    } catch (err) {
      console.error("Delete request failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to request delete.",
      });
    }
  };

  const handleCheckBalance = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/deposits/balance/${selectedDepositId}`);
      const balance = await res.text();

      Swal.fire({
        icon: "info",
        title: "Balance",
        text: `Balance: ₹${balance}`,
      });
    } catch (err) {
      console.error("Balance check failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to check balance.",
      });
    }
  };

  const hasPendingDeposit = deposits.some((dep) => dep.status === "PENDING");

  return (
    <div className="deposits-page">
      <h2>💰 Deposit Services</h2>

      <button style={{backgroundColor:"#90c582",marginLeft:"40px",margin:"20px"}} onClick={openDialog} disabled={hasPendingDeposit}>
        Apply New Deposit
      </button>

      {deposits.length === 0 ? (
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#555" }}>
          No deposits found.
        </p>
      ) : (
        <>
          <h3>Your Deposits</h3>
          <ul className="deposit-list">
            {deposits.map((dep) => (
              <li
                key={dep.deposit_id}
                className={selectedDepositId === dep.deposit_id ? "selected" : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    name="selectedDeposit"
                    value={dep.deposit_id}
                    checked={selectedDepositId === dep.deposit_id}
                    onChange={() => setSelectedDepositId(dep.deposit_id)}
                  />
                  <div className="deposit-details">
                    <div>
                      <strong>Deposit Type:</strong> {dep.depositType}
                    </div>
                    <div>
                      <strong>Deposit Amount:</strong> ₹{dep.amount}
                    </div>
                    <div>
                      <strong>Deposit Status:</strong> {dep.status}
                    </div>
                    <div>
                      <strong>Interest Rate:</strong> {dep.interestRate}%
                    </div>
                    <div>
                      <strong>Maturity Date:</strong> {dep.maturityDate}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <div className="action-buttons">
            {/* <button onClick={handleRequestDelete} disabled={!selectedDepositId}>
              Request Delete for Selected Deposit
            </button> */}

            <button onClick={handleCheckBalance} disabled={!selectedDepositId}>
              Check Balance
            </button>
          </div>
        </>
      )}

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Create Deposit Request</h3>

            <label>
              Deposit Type:
              <select name="depositType" value={formData.depositType} onChange={handleInputChange}>
                <option value="FIXED">Fixed Deposit</option>
                <option value="RECURRING">Recurring Deposit</option>
                <option value="SAVINGS">Savings Deposit</option>
              </select>
            </label>

            <label>
              Amount (₹):
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="100"
              />
            </label>

            <label>
              Interest Rate (%):
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />
            </label>

            <label>
              Maturity Date:
              <input
                type="date"
                name="maturityDate"
                value={formData.maturityDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="dialog-buttons">
              <button onClick={handleRequestDeposit}>Submit</button>
              <button onClick={closeDialog} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
