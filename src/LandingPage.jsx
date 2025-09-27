import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">🏦 SBA Bank</div>
        <div className="navbar-links">
          {!isLoggedIn && (
            <button onClick={() => navigate('/login')}>Login</button>
          )}

          {
            !isLoggedIn && (
                <button onClick={() => navigate('/register')}>Register</button>

            )
          }
        </div>
      </nav>

      <header className="landing-header">
        <h1>Welcome to SBA Bank</h1>
        <p>Your trusted partner in digital banking</p>
      </header>

      <section className="services-grid-2x2">
        <div className="service-card" onClick={() => handleNavigation('/customerhome/loans')}>
          <h2>💰 Loans</h2>
          <p>Apply for personal, home, or business loans.</p>
        </div>
        <div className="service-card" onClick={() => handleNavigation('/customerhome/cards')}>
          <h2>💳 Cards</h2>
          <p>Manage your debit and credit cards securely.</p>
        </div>
        <div className="service-card" onClick={() => handleNavigation('/customerhome/transactions')}>
          <h2>📄 Transactions</h2>
          <p>Track your recent payments and transfers.</p>
        </div>
        <div className="service-card" onClick={() => handleNavigation('/customerhome/deposits')}>
          <h2>🏦 Deposits</h2>
          <p>View and manage your savings and fixed deposits.</p>
        </div>
      </section>
    </div>
  );
}
