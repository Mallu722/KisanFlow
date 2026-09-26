const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  village: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  preferredLanguage: { type: String, default: 'en' },
}, { timestamps: true });

module.exports = mongoose.model('Farmer', FarmerSchema);
