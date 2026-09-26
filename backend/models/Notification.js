const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  farmerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: false }, // if null, broadcast
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { 
    type: String, 
    enum: ['token_update', 'leave_home_alert', 'payment_status_updated', 'centre_closed', 'queue_delay', 'general_alert', 'officer_announcement', 'queue', 'procurement', 'payment', 'announcement', 'alert'], 
    default: 'token_update' 
  },
  deliveryChannel: { type: String, enum: ['push', 'sms', 'both'], default: 'both' },
  isCritical: { type: Boolean, default: false },
  templateId: { type: String, default: null },
  read:      { type: Boolean, default: false },
  sentBy:    { type: String, default: 'Officer System' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
