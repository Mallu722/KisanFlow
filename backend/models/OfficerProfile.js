const mongoose = require('mongoose');

const OfficerProfileSchema = new mongoose.Schema({
  name:          { type: String, default: 'Dr. Anand Patil' },
  officerId:     { type: String, default: 'AGRI-OFF-KA-4819' },
  designation:   { type: String, default: 'Senior Procurement Officer' },
  department:    { type: String, default: 'Department of Agricultural Marketing & Co-operation' },
  district:      { type: String, default: 'Belagavi' },
  centreName:    { type: String, default: 'Bailhongal APMC Yard' },
  phone:         { type: String, default: '+91 98450 12345' },
  email:         { type: String, default: 'anand.patil@agri.karnataka.gov.in' },
  shiftTiming:   { type: String, default: 'Morning (07:30 AM – 04:30 PM)' },
  autoCallNext:  { type: Boolean, default: false },
  smsAlerts:     { type: Boolean, default: true },
  audioChime:    { type: Boolean, default: true },
  avatarUrl:     { type: String, default: '' },
  updatedAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('OfficerProfile', OfficerProfileSchema);
