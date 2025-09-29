import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ name: '', password: '', role: 'CUSTOMER' });
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (!form.name || !email) {
      Swal.fire('Missing Fields', 'Please enter both username and email.', 'warning');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:9876/users/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email }),
      });
  
      const data = await res.text();
  
      if (!res.ok) {
        Swal.fire('Error', data || 'Failed to send OTP', 'error');
        return;
      }
  
      Swal.fire('OTP Sent', data, 'info');
      setShowOtpInput(true);
    } catch (err) {
      Swal.fire('Server Error', 'Unable to send OTP. Please try again later.', 'error');
    }
  };
  

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('http://localhost:9876/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.text();

      if (!res.ok) {
        Swal.fire('Invalid OTP', data, 'error');
        return;
      }

      if (data.includes('OTP verified')) {
        setIsOtpVerified(true);
        Swal.fire('Success', 'OTP Verified. You can now login.', 'success');
      } else {
        Swal.fire('Invalid OTP', data, 'error');
      }
    } catch (err) {
      Swal.fire('Server Error', 'OTP Verification failed. Try again later.', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const endpoint = form.role === 'ADMIN' ? '/admin/login' : '/customer/login';

    try {
      const res = await fetch(`http://localhost:9876/users${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email }),
      });

      const data = await res.text();

      if (!res.ok) {
        if (data.includes('OTP not verified')) {
          Swal.fire('OTP Required', data, 'warning');
          setShowOtpInput(true);
        } else {
          Swal.fire('Login Failed', data, 'error');
        }
        return;
      }

      const parsed = JSON.parse(data);
      sessionStorage.setItem('role', form.role);
      sessionStorage.setItem('userId', parsed.userId);
      sessionStorage.setItem('token', parsed.token);
      sessionStorage.setItem('name', form.name);
      sessionStorage.setItem('isLoggedIn', 'true');

      Swal.fire('Login Successful', `Welcome ${form.name}`, 'success');

      navigate(form.role === 'ADMIN' ? '/adminhome' : '/customerhome/customercontent');
    } catch (error) {
      Swal.fire('Server Error', 'Try again later.', 'error');
    }
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <div className="email-container">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {isOtpVerified && <span ><img src="/public/Verified_Icon.png" className="verified-star"></img></span>}
      </div>

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="CUSTOMER">Customer</option>
        <option value="ADMIN">Admin</option>
      </select>

      {!showOtpInput && (
        <button type="button" className="otp-button" onClick={handleGenerateOtp}>
          Send OTP
        </button>
      )}

      {showOtpInput && !isOtpVerified && (
        <div className="otp-section">
          <input
            type="text"
            placeholder="Enter OTP"
            maxLength={6}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button type="button" onClick={handleVerifyOtp}>
            Verify OTP
          </button>
        </div>
      )}

{isOtpVerified && (
  <button type="submit">Login</button>
)}
    </form>
  );
}
