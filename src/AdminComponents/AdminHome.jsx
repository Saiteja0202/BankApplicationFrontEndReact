import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./AdminHome.css";

export default function AdminHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const name = sessionStorage.getItem("name");
  const userId = sessionStorage.getItem("userId");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-home-container">
      <nav className="nav-bar">
        <div className="nav-left">
          <span className="bank-name">🏦 SBA Bank</span>
          <span className="role">Admin</span>
        </div>

        <div className="nav-right">
        <button className={location.pathname === "/adminhome/admincards" ? "active" : ""}
              onClick={() => navigate("/adminhome/admincards")}>Cards</button>
        <button className={location.pathname === "/adminhome/admindeposits" ? "active" : ""}
              onClick={() => navigate("/adminhome/admindeposits")}>Deposits</button>
        <button className={location.pathname === "/adminhome/adminloans" ? "active" : ""}
              onClick={() => navigate("/adminhome/adminloans")}>Loans</button>
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
                <button onClick={handleLogout} style={{ color: "black" }}>
                  Logout
                </button>
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
