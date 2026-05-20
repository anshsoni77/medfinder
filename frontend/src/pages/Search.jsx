import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('name') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('name') || '');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError('Location access denied. Please enable location to find nearby stores.')
    );
  }, []);

  useEffect(() => {
    if (query && userPos) fetchResults();
  }, [query, userPos]);

  const fetchResults = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get(`${API}/medicines/search`, {
        params: { name: query, lat: userPos.lat, lng: userPos.lng, radius: 5000 }
      });
      setResults(data);
      if (data.length === 0) setError('No stores found with this medicine within 5km.');
    } catch {
      setError('Search failed. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setQuery(inputVal); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="bg-white border-b px-4 py-3">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="Search another medicine..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Search</button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Results list */}
        <div className="lg:w-2/5">
          <h2 className="font-semibold text-gray-700 mb-3">
            {loading ? 'Searching...' : `${results.length} result(s) for "${query}"`}
          </h2>
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
          <div className="space-y-3">
            {results.map(r => (
              <div key={r._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-800">{r.medicineName}</span>
                  <span className="text-green-600 font-bold text-lg">₹{r.price}</span>
                </div>
                {r.generic && <div className="text-xs text-gray-400 mb-2">Generic: {r.generic}</div>}
                <div className="text-sm font-medium text-blue-700">🏪 {r.storeName}</div>
                <div className="text-xs text-gray-500 mt-1">📍 {r.address}</div>
                {r.phone && <div className="text-xs text-gray-500">📞 {r.phone}</div>}
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">📏 {r.distanceKm} km</span>
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full">🕐 ~{r.estimatedMinutes} min</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">📦 Qty: {r.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:w-3/5 h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {userPos ? (
            <MapContainer center={[userPos.lat, userPos.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors' />
              <Circle center={[userPos.lat, userPos.lng]} radius={5000} color="blue" fillOpacity={0.05} />
              <Marker position={[userPos.lat, userPos.lng]}>
                <Popup>You are here</Popup>
              </Marker>
              {results.map(r => (
                <Marker key={r._id} position={[r.coordinates[1], r.coordinates[0]]}>
                  <Popup>
                    <strong>{r.storeName}</strong><br />
                    {r.medicineName} — ₹{r.price}<br />
                    {r.distanceKm} km away (~{r.estimatedMinutes} min)
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              {error || 'Getting your location...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}