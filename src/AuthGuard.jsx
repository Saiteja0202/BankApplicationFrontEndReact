import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children, role }) {
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');

  if (!token || userRole !== role) {
    return <Navigate to="/404" />;
  }

  return children;
}
