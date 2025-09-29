import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import CustomerHome from './CustomerComponents/CustomerHome';
import AdminHome from './AdminComponents/AdminHome';
import NotFound from './NotFound';
import AuthGuard from './AuthGuard';
import LandingPage from './LandingPage';
import Loans from './CustomerComponents/Loans';
import Deposits from './CustomerComponents/Deposits';
import Cards from './CustomerComponents/Cards';
import Transactions from './CustomerComponents/Transactions';
import CustomerContent from './CustomerComponents/CustomerContent';
import AdminDeposits from './AdminComponents/AdminDeposits';
import AdminCards from './AdminComponents/AdminCards';
import AdminLoans from './AdminComponents/AdminLoans';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
  path="/customerhome"
  element={
    <AuthGuard role="CUSTOMER">
      <CustomerHome />
    </AuthGuard>
  }
>
  <Route path='customercontent' element={<CustomerContent />} />
  <Route path="loans" element={<Loans />} />
  <Route path="deposits" element={<Deposits />} />
  <Route path="cards" element={<Cards />} />
  <Route path="transactions" element={<Transactions />} />
</Route>

          
<Route
  path="/adminhome"
  element={
    <AuthGuard role="ADMIN">
      <AdminHome />
    </AuthGuard>
  }
>
  <Route path="/adminhome/admindeposits" element={<AdminDeposits />} />
  <Route path="/adminhome/adminloans" element={<AdminLoans />} />
  <Route path="/adminhome/admincards" element={<AdminCards />} />
</Route>
            
          
          <Route path="/404" element={<NotFound />} />
          <Route path="/landingpage" element={<LandingPage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
