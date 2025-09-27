// CustomerHome.jsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./CustomerHome.css";

export default function CustomerHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [name, setName] = useState(sessionStorage.getItem("name"));
  const memberId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleSave = () => {
    sessionStorage.setItem("name", name);
    alert("Details updated successfully!");
  };

  return (
    <div className="customer-home-container">
      <nav className="nav-bar">
        <div className="nav-left">
          <span className="bank-name">🏦 SBA Bank</span>
        </div>

        <div className="nav-right">
          <button
            className={location.pathname === "/customerhome/customercontent" ? "active" : ""}
            onClick={() => navigate("/customerhome/customercontent")}
          >
            Home
          </button>
          <button
            className={location.pathname === "/customerhome/loans" ? "active" : ""}
            onClick={() => navigate("/customerhome/loans")}
          >
            Loans
          </button>
          <button
            className={location.pathname === "/customerhome/deposits" ? "active" : ""}
            onClick={() => navigate("/customerhome/deposits")}
          >
            Deposits
          </button>
          <button
            className={location.pathname === "/customerhome/transactions" ? "active" : ""}
            onClick={() => navigate("/customerhome/transactions")}
          >
            Transactions
          </button>
          <button
            className={location.pathname === "/customerhome/cards" ? "active" : ""}
            onClick={() => navigate("/customerhome/cards")}
          >
            Cards
          </button>

          <div className="profile-section">
            <img
              className="profile-logo"
              src="/Profile_Logo.png"
              alt="Profile"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            <p className="user-info">{name}</p>

            {showDropdown && (
              <div className="dropdown-menu">
                <button  onClick={handleLogout} style={{ color: "black" }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
