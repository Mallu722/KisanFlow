const mongoose = require('mongoose');

const CentreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  totalCapacity: { type: Number, required: true },
  currentLoad: { type: Number, default: 0 },
  avgProcessingTimeMinutes: { type: Number, default: 15 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Centre', CentreSchema);
