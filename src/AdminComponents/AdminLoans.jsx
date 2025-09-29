import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "/src/fetchWithAuth";

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const adminId = sessionStorage.getItem("userId");

  const statuses = ["ALL", "PENDING", "ACTIVE", "REJECTED", "CLOSED"];

  const fetchLoans = async (status) => {
    if (!adminId) {
      console.error("Admin ID not found in sessionStorage");
      return;
    }
    setLoading(true);
    try {
      const url = `http://localhost:9876/loans/all/${adminId}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch loans: ${response.statusText}`);
      }
      const data = await response.json();

      if (status === "ALL") {
        setLoans(data);
      } else {
        setLoans(data.filter((loan) => loan.status === status));
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve with SweetAlert confirmation and success/error
  const handleApprove = async (loanId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this loan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const url = `http://localhost:9876/loans/approve/${loanId}/${adminId}`;
      const response = await fetchWithAuth(url, { method: "POST" });
      if (!response.ok) throw new Error("Failed to approve loan");

      Swal.fire("Approved!", "The loan has been approved.", "success");

      // Update the status locally without re-fetching all loans
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          (loan.loan_id || loan.id) === loanId ? { ...loan, status: "ACTIVE" } : loan
        )
      );
    } catch (error) {
      console.error("Error approving loan:", error);
      Swal.fire("Error", "Failed to approve loan", "error");
    }
  };

  // Handle Reject with SweetAlert confirmation and success/error
  const handleReject = async (loanId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this loan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const url = `http://localhost:9876/loans/reject/${loanId}/${adminId}`;
      const response = await fetchWithAuth(url, { method: "POST" });
      if (!response.ok) throw new Error("Failed to reject loan");

      Swal.fire("Rejected!", "The loan has been rejected.", "success");

      // Update the status locally without re-fetching all loans
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          (loan.loan_id || loan.id) === loanId ? { ...loan, status: "REJECTED" } : loan
        )
      );
    } catch (error) {
      console.error("Error rejecting loan:", error);
      Swal.fire("Error", "Failed to reject loan", "error");
    }
  };

  useEffect(() => {
    fetchLoans(statusFilter);
  }, [statusFilter, adminId]);

  if (!adminId) {
    return <p>Please log in as admin to view loan requests.</p>;
  }

  return (
    <div className="admin-loans">
      <h1>Loan Requests</h1>

      <div className="filter-container" style={{ marginBottom: "1rem" }}>
        <label htmlFor="statusFilter" style={{ marginRight: "8px" }}>
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading loans...</p>
      ) : (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>User ID</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Tenure (months)</th>
                <th>Interest Rate (%)</th>
                <th>EMI</th>
                <th>Remaining Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map((loan) => {
                  const loanId = loan.loan_id || loan.id;
                  const isPending = loan.status === "PENDING";
                  const isActive = loan.status === "ACTIVE";
                  const isRejected = loan.status === "REJECTED";
                  const isClosed = loan.status === "CLOSED";

                  return (
                    <tr key={loanId}>
                      <td>{loanId}</td>
                      <td>{loan.user?.user_id}</td>
                      <td>{loan.loanType}</td>
                      <td>₹{loan.amount}</td>
                      <td>{loan.tenureMonths}</td>
                      <td>{loan.interestRate}</td>
                      <td>₹{loan.emi}</td>
                      <td>₹{loan.remainingAmount}</td>
                      <td>{loan.status}</td>
                      <td>
                        {isPending ? (
                          <>
                            <button
                              className="btn accept"
                              onClick={() => handleApprove(loanId)}
                              style={{ marginRight: "6px" }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn reject"
                              onClick={() => handleReject(loanId)}
                            >
                               Reject
                            </button>
                          </>
                        ) : isActive ? (
                          <span className="status active" style={{ color: "green", fontWeight: "bold" }}>
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="status rejected" style={{ color: "red", fontWeight: "bold" }}>
                            Rejected
                          </span>
                        ) : isClosed ? (
                          <span className="status closed" style={{ color: "gray", fontWeight: "bold" }}>
                            Closed
                          </span>
                        ) : (
                          <span>{loan.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
