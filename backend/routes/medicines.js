const router = require('express').Router();
const Medicine = require('../models/Medicine');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// Search medicines near user location
router.get('/search', async (req, res) => {
  try {
    const { name, lat, lng, radius = 5000 } = req.query;
    if (!name || !lat || !lng)
      return res.status(400).json({ message: 'name, lat, lng required' });

    // Find nearby stores first
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    });

    const storeIds = stores.map(s => s._id);

    // Find medicines in those stores matching the name
    const medicines = await Medicine.find({
      store: { $in: storeIds },
      name: { $regex: name, $options: 'i' },
      available: true
    }).populate('store');

    // Attach distance to each result
    const results = medicines.map(med => {
      const store = stores.find(s => s._id.toString() === med.store._id.toString());
      const [sLng, sLat] = store.location.coordinates;
      const dist = getDistanceKm(parseFloat(lat), parseFloat(lng), sLat, sLng);
      return {
        _id: med._id,
        medicineName: med.name,
        generic: med.generic,
        price: med.price,
        quantity: med.quantity,
        storeName: med.store.storeName,
        address: med.store.address,
        phone: med.store.phone,
        storeId: med.store._id,
        coordinates: store.location.coordinates,
        distanceKm: parseFloat(dist.toFixed(2)),
        estimatedMinutes: Math.ceil(dist / 0.5) // ~30 km/h avg
      };
    });

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seller: get my medicines
router.get('/my', auth, async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    const meds = await Medicine.find({ store: store._id });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seller: add medicine
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller')
      return res.status(403).json({ message: 'Only sellers can add medicines' });
    const store = await Store.findOne({ seller: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    const med = await Medicine.create({ ...req.body, store: store._id, seller: req.user.id });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seller: update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      req.body,
      { new: true }
    );
    if (!med) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seller: delete medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    await Medicine.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

module.exports = router;