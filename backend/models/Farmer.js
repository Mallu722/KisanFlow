const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  phone: { type: String, required: true },
  name: { type: String, default: 'Farmer' },
  village: { type: String, default: 'Belagavi' },
  isVerified: { type: Boolean, default: true },
  language: { type: String, default: 'kn' },
}, { timestamps: true });

module.exports = mongoose.model('Farmer', FarmerSchema);
