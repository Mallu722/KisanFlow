const mongoose = require('mongoose');

const CentreSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  district: { type: String, default: 'Karnataka' },
  address:  { type: String, default: '' },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  totalCapacity:            { type: Number, required: true, default: 100 },
  currentLoad:              { type: Number, default: 0 },
  avgProcessingTimeMinutes: { type: Number, default: 15 },
  operatingHours:           { type: String, default: '8:00 AM – 6:00 PM' },
  isActive:                 { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Centre', CentreSchema);
