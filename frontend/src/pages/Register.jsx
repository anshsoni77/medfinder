import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register() {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name:'', email:'', password:'', storeName:'', address:'', phone:'', lat:'', lng:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => setForm(f => ({...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString()})),
      () => alert('Could not get location. Please enter manually.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/auth/register`, { ...form, role });
      login(data.user, data.token);
      navigate(role === 'seller' ? '/seller' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({...form, [field]: e.target.value}) });
  const cls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Create Account</h2>

        {/* Role toggle */}
        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          {['user','seller'].map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition ${role===r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {r === 'user' ? '👤 Patient / User' : '🏪 Medical Store Seller'}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input placeholder="Full Name" required className={cls} {...f('name')} />
          <input type="email" placeholder="Email" required className={cls} {...f('email')} />
          <input type="password" placeholder="Password" required className={cls} {...f('password')} />

          {role === 'seller' && (
            <>
              <input placeholder="Medical Store Name" required className={cls} {...f('storeName')} />
              <input placeholder="Store Address" required className={cls} {...f('address')} />
              <input placeholder="Phone Number" className={cls} {...f('phone')} />
              <div className="flex gap-2">
                <input placeholder="Latitude" required className={cls} {...f('lat')} />
                <input placeholder="Longitude" required className={cls} {...f('lng')} />
              </div>
              <button type="button" onClick={getLocation}
                className="w-full border border-blue-300 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50">
                📍 Auto-detect my location
              </button>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}