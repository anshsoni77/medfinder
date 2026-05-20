const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

StoreSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', StoreSchema);