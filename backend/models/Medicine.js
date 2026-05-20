const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  generic: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);