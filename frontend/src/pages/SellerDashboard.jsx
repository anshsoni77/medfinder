import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SellerDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [medicines, setMedicines] = useState([]);
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ name:'', generic:'', price:'', quantity:'' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get(`${API}/stores/my`, { headers }).then(r => setStore(r.data));
    loadMeds();
  }, []);

  const loadMeds = () => axios.get(`${API}/medicines/my`, { headers }).then(r => setMedicines(r.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/medicines/${editId}`, form, { headers });
        setMsg('Medicine updated!');
      } else {
        await axios.post(`${API}/medicines`, form, { headers });
        setMsg('Medicine added!');
      }
      setForm({ name:'', generic:'', price:'', quantity:'' });
      setEditId(null);
      loadMeds();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  const startEdit = (med) => {
    setEditId(med._id);
    setForm({ name: med.name, generic: med.generic || '', price: med.price, quantity: med.quantity });
  };

  const deleteMed = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    await axios.delete(`${API}/medicines/${id}`, { headers });
    loadMeds();
  };

  const toggleAvail = async (med) => {
    await axios.put(`${API}/medicines/${med._id}`, { available: !med.available }, { headers });
    loadMeds();
  };

  const cls = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {store && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="font-bold text-blue-800 text-lg">🏪 {store.storeName}</div>
          <div className="text-sm text-blue-600 mt-1">📍 {store.address}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
        {msg && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded mb-3">{msg}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <input placeholder="Medicine Name*" required className={cls}
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Generic Name (optional)" className={cls}
            value={form.generic} onChange={e => setForm({...form, generic: e.target.value})} />
          <input type="number" placeholder="Price (₹)*" required className={cls}
            value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          <input type="number" placeholder="Quantity in stock*" required className={cls}
            value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          <button type="submit" className="col-span-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">
            {editId ? '✏️ Update Medicine' : '+ Add Medicine'}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm({ name:'', generic:'', price:'', quantity:'' }); }}
              className="col-span-2 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-700">
          My Inventory ({medicines.length} items)
        </div>
        {medicines.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No medicines added yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {['Medicine','Generic','Price','Qty','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.map(m => (
                <tr key={m._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.generic || '—'}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">₹{m.price}</td>
                  <td className="px-4 py-3">{m.quantity}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvail(m)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${m.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {m.available ? '✓ In Stock' : '✗ Out'}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => startEdit(m)} className="text-blue-500 hover:underline text-xs">Edit</button>
                    <button onClick={() => deleteMed(m._id)} className="text-red-400 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}