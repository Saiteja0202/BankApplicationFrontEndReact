export default function AdminHome() {
    const memberId = sessionStorage.getItem('userId');
    const name = sessionStorage.getItem('name');
    const role = sessionStorage.getItem('role');
  
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {name}!</p>
        <p>Your Admin ID: {memberId}</p>
        <p>Role : {role}</p>
      </div>
    );
  }
  