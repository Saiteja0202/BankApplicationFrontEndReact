import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "/src/fetchWithAuth.jsx";
import "./Loans.css";

export default function Loans() {
  const userId = sessionStorage.getItem("userId");
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    loanType: "PERSONAL",
    amount: "",
    tenureMonths: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/loans/user/${userId}`);
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
      setSelectedLoanId(null);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
      Swal.fire("Error", "Failed to fetch your loans.", "error");
    }
  };

  const openDialog = () => {
    setFormData({ loanType: "PERSONAL", amount: "", tenureMonths: "" });
    setFormError("");
    setShowDialog(true);
  };

  const closeDialog = () => setShowDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestLoan = async () => {
    const { loanType, amount, tenureMonths } = formData;
    if (!amount || !tenureMonths || isNaN(amount) || isNaN(tenureMonths) || Number(amount) <= 0 || Number(tenureMonths) <= 0) {
      setFormError("Please enter valid amount and tenure.");
      return;
    }

    try {
      const payload = {
        loanType,
        amount,
        tenureMonths,
      };

      const res = await fetchWithAuth(`http://localhost:9876/loans/request/${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      Swal.fire("Success", text, "success");
      closeDialog();
      fetchLoans();
    } catch (err) {
      console.error("Loan request failed:", err);
      Swal.fire("Error", "Failed to submit loan request.", "error");
    }
  };

  const handlePayInstallment = async () => {
    const amount = prompt("Enter amount to pay (₹):");
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      const payload = { amount };
      const res = await fetchWithAuth(`http://localhost:9876/loans/pay/${selectedLoanId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      Swal.fire("Payment", text, "info");
      fetchLoans();
    } catch (err) {
      console.error("Payment failed:", err);
      Swal.fire("Error", "Failed to process payment.", "error");
    }
  };

  return (
    <div className="loans-page">
      <h2>💸 Loan Services</h2>

      <button style={{backgroundColor:"#90c582",marginLeft:"40px",margin:"20px"}} onClick={openDialog}>Apply New Loan</button>

      {loans.length === 0 ? (
        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#555" }}>
          No loans found.
        </p>
      ) : (
        <>
          <h3>Your Loans</h3>
          <ul className="loan-list">
            {loans.map((loan) => (
              <li
                key={loan.loan_id}
                className={selectedLoanId === loan.loan_id ? "selected" : ""}
              >
                <label>
                <input
  type="checkbox"
  name="selectedLoan"
  value={loan.loan_id}
  checked={selectedLoanId === loan.loan_id}
  onChange={() =>
    setSelectedLoanId(selectedLoanId === loan.loan_id ? null : loan.loan_id)
  }
/>

                  <div className="loan-details">
                    <div><strong>Loan Type:</strong> {loan.loanType}</div>
                    <div><strong>Status:</strong> {loan.status}</div>
                    <div><strong>Amount:</strong> ₹{loan.amount}</div>
                    <div><strong>Interest:</strong> {loan.interestRate}%</div>
                    <div><strong>EMI:</strong> ₹{loan.emi}</div>
                    <div><strong>Remaining:</strong> ₹{loan.remainingAmount}</div>
                    <div><strong>Tenure:</strong> {loan.tenureMonths} months</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <div className="action-buttons">
            <button onClick={handlePayInstallment} disabled={!selectedLoanId}>
              Pay Installment
            </button>
          </div>
        </>
      )}

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Request Loan</h3>

            <label>
              Loan Type:
              <select name="loanType" value={formData.loanType} onChange={handleInputChange}>
                <option value="PERSONAL">Personal</option>
                <option value="HOME">Home</option>
                <option value="EDUCATION">Education</option>
                <option value="CAR">Car</option>
              </select>
            </label>

            <label>
              Amount (₹):
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="1000"
                step="1000"
              />
            </label>

            <label>
              Tenure (Months):
              <input
                type="number"
                name="tenureMonths"
                value={formData.tenureMonths}
                onChange={handleInputChange}
                min="1"
              />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="dialog-buttons">
              <button onClick={handleRequestLoan}>Submit</button>
              <button onClick={closeDialog} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
