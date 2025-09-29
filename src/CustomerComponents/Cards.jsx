import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithAuth } from "/src/fetchWithAuth.jsx";
import "./Cards.css";

export default function Cards() {
  const userId = sessionStorage.getItem("userId");
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    cardType: "CREDIT",
    limit: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:9876/cards/user/${userId}`);
      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
      setSelectedCardId(null);
    } catch (err) {
      console.error("Failed to fetch cards:", err);
      Swal.fire("Error", "Failed to fetch your cards.", "error");
    }
  };

  const openDialog = () => {
    setFormData({ cardType: "CREDIT", limit: "" });
    setFormError("");
    setShowDialog(true);
  };

  const closeDialog = () => setShowDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestCard = async () => {
    const { cardType, limit } = formData;
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      setFormError("Please enter a valid card limit.");
      return;
    }

    try {
      const payload = {
        cardType,
        limit,
      };

      const res = await fetchWithAuth(`http://localhost:9876/cards/apply/${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      Swal.fire("Success", text, "success");
      closeDialog();
      fetchCards();
    } catch (err) {
      console.error("Card request failed:", err);
      Swal.fire("Error", "Failed to apply for card.", "error");
    }
  };

  const handleRequestBlock = async () => {
    if (!selectedCardId) return;

    const confirm = await Swal.fire({
      title: "Block Card?",
      text: "Are you sure you want to request a block for this card?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, request block",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetchWithAuth(
          `http://localhost:9876/cards/request-block/${userId}/${selectedCardId}`,
          { method: "PUT" }
        );
        const text = await res.text();
        Swal.fire("Requested", text, "info");
        fetchCards();
      } catch (err) {
        console.error("Block request failed:", err);
        Swal.fire("Error", "Failed to request block.", "error");
      }
    }
  };

  const handleRequestDelete = async () => {
    if (!selectedCardId) return;

    const confirm = await Swal.fire({
      title: "Delete Card?",
      text: "Are you sure you want to request delete for this card?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, request delete",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetchWithAuth(
          `http://localhost:9876/cards/request-delete/${userId}/${selectedCardId}`,
          { method: "PUT" }
        );
        const text = await res.text();
        Swal.fire("Requested", text, "info");
        fetchCards();
      } catch (err) {
        console.error("Delete request failed:", err);
        Swal.fire("Error", "Failed to request delete.", "error");
      }
    }
  };

  return (
    <div className="cards-page">
      <h2>💳 Card Services</h2>

      <button onClick={openDialog} style={{ backgroundColor: "#90c582", margin: "20px" }}>
        Apply New Card
      </button>

      {cards.length === 0 ? (
        <p style={{ textAlign: "center", color: "#555" }}>No cards found.</p>
      ) : (
        <>
          <h3>Your Cards</h3>
          <ul className="card-list">
            {cards.map((card) => (
              <li
                key={card.card_id}
                className={selectedCardId === card.card_id ? "selected" : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    name="selectedCard"
                    value={card.card_id}
                    checked={selectedCardId === card.card_id}
                    onChange={() =>
                      setSelectedCardId(
                        selectedCardId === card.card_id ? null : card.card_id
                      )
                    }
                  />

                  <div className="card-details">
                    <div><strong>Type:</strong> {card.cardType}</div>
                    <div><strong>Status:</strong> {card.status || "N/A"}</div>
                    <div><strong>Request:</strong> {card.requestStatus}</div>
                    <div><strong>Limit:</strong> ₹{card.limitAmount}</div>
                    <div><strong>Number:</strong> {card.cardNumber || "Not issued"}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <div className="action-buttons">
            {/* <button onClick={handleRequestBlock} disabled={!selectedCardId}>
              Request Block
            </button> */}
            {/* <button onClick={handleRequestDelete} disabled={!selectedCardId}>
              Request Delete
            </button> */}
          </div>
        </>
      )}

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Apply for New Card</h3>

            <label>
              Card Type:
              <select name="cardType" value={formData.cardType} onChange={handleInputChange}>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </label>

            <label>
              Card Limit (₹):
              <input
                type="number"
                name="limit"
                value={formData.limit}
                onChange={handleInputChange}
                min="1000"
              />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="dialog-buttons">
              <button onClick={handleRequestCard}>Submit</button>
              <button className="cancel-btn" onClick={closeDialog}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
