const router = require('express').Router();
const Store = require('../models/Store');
const auth = require('../middleware/auth');

router.get('/my', auth, async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.user.id });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/my', auth, async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { seller: req.user.id },
      req.body,
      { new: true }
    );
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;