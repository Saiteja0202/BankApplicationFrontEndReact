import { useEffect, useState } from "react";
import { fetchWithAuth } from "/src/fetchWithAuth";
import Swal from "sweetalert2";
import "./AdminDeposits.css";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const adminId = sessionStorage.getItem("userId");

  const statuses = [
    "ALL",
    "NOTAPPLIED",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "ACTIVE",
    "CLOSED",
    "DEFAULTED",
  ];

  const fetchDeposits = async (status) => {
    try {
      let url = `http://localhost:9876/deposits/all/${adminId}`;
      const response = await fetchWithAuth(url);
      const data = await response.json();

      if (status === "ALL") {
        setDeposits(data);
      } else {
        setDeposits(data.filter((d) => (d.requestStatus || "").toUpperCase() === status));
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  const handleApprove = async (depositId) => {
    try {
      const url = `http://localhost:9876/deposits/approve/admin/${depositId}/${adminId}`;
      await fetchWithAuth(url, { method: "PUT" });
      Swal.fire({
        icon: "success",
        title: "Deposit Approved",
        text: `Deposit ID ${depositId} has been approved.`,
      });
      fetchDeposits(statusFilter);
    } catch (error) {
      console.error("Error approving deposit:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: "Something went wrong while approving the deposit.",
      });
    }
  };

  const handleReject = async (depositId) => {
    try {
      const url = `http://localhost:9876/deposits/reject/admin/${depositId}/${adminId}`;
      await fetchWithAuth(url, { method: "PUT" });
      Swal.fire({
        icon: "info",
        title: "Deposit Rejected",
        text: `Deposit ID ${depositId} has been rejected.`,
      });
      fetchDeposits(statusFilter);
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text: "Something went wrong while rejecting the deposit.",
      });
    }
  };

  useEffect(() => {
    fetchDeposits(statusFilter);
  }, [statusFilter]);

  return (
    <div className="admin-deposits">
      <h1>Deposit Requests</h1>

      <div className="filter-container">
        <label htmlFor="statusFilter">Filter by Request Status:</label>
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

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Deposit ID</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Interest Rate</th>
              <th>Maturity Date</th>
              <th>Status</th>
              <th>Request Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length > 0 ? (
              deposits.map((deposit) => {
                const status = (deposit.requestStatus || "").toUpperCase();
                const isPending = status === "PENDING";
                const isApproved = status === "APPROVED";
                const isRejected = status === "REJECTED";

                return (
                  <tr key={deposit.deposit_id}>
                    <td>{deposit.deposit_id}</td>
                    <td>{deposit.user?.user_id}</td>
                    <td>{deposit.depositType}</td>
                    <td>{deposit.amount}</td>
                    <td>{deposit.interestRate}</td>
                    <td>{deposit.maturityDate}</td>
                    <td>{deposit.status}</td>
                    <td>{deposit.requestStatus}</td>
                    <td>
                      {isPending ? (
                        <>
                          <button
                            className="btn accept"
                            onClick={() => handleApprove(deposit.deposit_id)}
                          >
                            Accept
                          </button>
                          <button
                            className="btn reject"
                            onClick={() => handleReject(deposit.deposit_id)}
                          >
                            Reject
                          </button>
                        </>
                      ) : isApproved ? (
                        <span className="approved">Approved</span>
                      ) : isRejected ? (
                        <span className="rejected">Rejected</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No deposits found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
