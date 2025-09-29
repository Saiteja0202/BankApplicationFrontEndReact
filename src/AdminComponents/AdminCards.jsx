import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "/src/fetchWithAuth";

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const adminId = sessionStorage.getItem("userId");

  const statuses = [
    "ALL",
    "NOTAPPLIED",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "BLOCKED",
  ];

  const fetchCards = async (status) => {
    if (!adminId) {
      console.error("Admin ID not found in sessionStorage");
      return;
    }
    setLoading(true);
    try {
      const url = `http://localhost:9876/cards/all/${adminId}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.statusText}`);
      }
      const data = await response.json();

      if (status === "ALL") {
        setCards(data);
      } else {
        setCards(data.filter((c) => c.requestStatus === status));
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (cardId) => {
    const result = await Swal.fire({
      title: "Approve Card?",
      text: "Do you want to approve this card request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const url = `http://localhost:9876/cards/admin/approve/${adminId}/${cardId}`;
      const response = await fetchWithAuth(url, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to approve card");
      await Swal.fire("Approved!", "Card request approved.", "success");
      fetchCards(statusFilter);
    } catch (error) {
      console.error("Error approving card:", error);
      Swal.fire("Error", "Failed to approve card.", "error");
    }
  };

  const handleReject = async (cardId) => {
    const result = await Swal.fire({
      title: "Reject Card?",
      text: "Do you want to reject this card request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const url = `http://localhost:9876/cards/admin/reject/${adminId}/${cardId}`;
      const response = await fetchWithAuth(url, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to reject card");
      await Swal.fire("Rejected!", "Card request rejected.", "success");
      fetchCards(statusFilter);
    } catch (error) {
      console.error("Error rejecting card:", error);
      Swal.fire("Error", "Failed to reject card.", "error");
    }
  };

  useEffect(() => {
    fetchCards(statusFilter);
  }, [statusFilter, adminId]);

  if (!adminId) {
    return <p>Please log in as admin to view card requests.</p>;
  }

  return (
    <div className="admin-cards">
      <h1>Card Requests</h1>

      <div className="filter-container" style={{ marginBottom: "1rem" }}>
        <label htmlFor="statusFilter" style={{ marginRight: "8px" }}>
          Filter by Request Status:
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
        <p>Loading cards...</p>
      ) : (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Card ID</th>
                <th>User ID</th>
                <th>Type</th>
                <th>Limit</th>
                <th>Card Number</th>
                <th>Status</th>
                <th>Request Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cards.length > 0 ? (
                cards.map((card, index) => {
                  const isPending = card.requestStatus === "PENDING";
                  const isApproved = card.requestStatus === "APPROVED";
                  const isRejected = card.requestStatus === "REJECTED";

                  return (
                    <tr key={card.card_id ?? index}>
                      <td>{card.card_id}</td>
                      <td>{card.user?.user_id || card.user?.id || "-"}</td>
                      <td>{card.cardType}</td>
                      <td>{card.limitAmount}</td>
                      <td>{card.cardNumber || "-"}</td>
                      <td>{card.status || "-"}</td>
                      <td>{card.requestStatus}</td>
                      <td>
                        {isPending ? (
                          <>
                            <button
                              className="btn accept"
                              onClick={() => handleApprove(card.card_id)}
                              style={{ marginRight: "6px" }}
                            >
                              Accept
                            </button>
                            <button
                              className="btn reject"
                              onClick={() => handleReject(card.card_id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : isApproved ? (
                          <span className="approved" style={{ color: "green", fontWeight: "bold" }}>
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="rejected" style={{ color: "red", fontWeight: "bold" }}>
                            Rejected
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No cards found.
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
