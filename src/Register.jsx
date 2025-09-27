import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = form.role === 'ADMIN' ? '/admin/register' : '/customer/register';

    try {
      const res = await fetch(`http://localhost:9876/users${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        const errorText = await res.text();
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorText || 'Please enter correct details.',
          confirmButtonText: 'OK',
        });
        return;
      }

      const data = await res.text();
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: data,
        showConfirmButton: false,
        timer: 2000,
        confirmButtonText: 'OK',
      });

      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Something went wrong. Please try again later.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <>
     
      <div className="register-container">
   
        <form onSubmit={handleSubmit}>
        <h2>Register</h2>
          <input
            placeholder="Name"
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <select onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit">Register</button>
          <p>Already have an account? <a href="/login">Login</a></p>
        </form>
      </div>
    </>
  );
}
