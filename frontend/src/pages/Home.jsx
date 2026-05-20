import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?name=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-3">Find Medicines Near You</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Search for any medicine and instantly see which nearby pharmacies have it in stock, with price and distance.
      </p>
      <form onSubmit={handleSearch} className="w-full max-w-lg flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search medicine name e.g. Paracetamol..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Search
        </button>
      </form>
      <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl w-full text-center">
        {[
          { icon: '📍', title: 'Nearby Stores', desc: 'See stores within 5km radius' },
          { icon: '💰', title: 'Compare Prices', desc: 'Find the best price instantly' },
          { icon: '🕐', title: 'Time & Distance', desc: 'Know how far and how long' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-semibold text-gray-800">{f.title}</div>
            <div className="text-sm text-gray-500 mt-1">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}