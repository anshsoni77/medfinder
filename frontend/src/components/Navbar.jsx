import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/" className="text-xl font-bold tracking-tight">💊 MedFinder</Link>
      <div className="flex gap-4 items-center text-sm">
        <Link to="/" className="hover:underline">Home</Link>
        {user ? (
          <>
            {user.role === 'seller' && (
              <Link to="/seller" className="hover:underline">My Store</Link>
            )}
            <span className="opacity-75">Hi, {user.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-50">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}