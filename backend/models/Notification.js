const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  farmerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: false }, // if null, broadcast
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['queue', 'procurement', 'payment', 'announcement', 'alert'], default: 'queue' },
  read:      { type: Boolean, default: false },
  sentBy:    { type: String, default: 'Officer System' },
  channel:   { type: String, enum: ['app', 'sms', 'both'], default: 'both' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
