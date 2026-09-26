const mongoose = require('mongoose');

const SmsDeliveryLogSchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: false },
  farmerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: false },
  phone:          { type: String, required: true },
  message:        { type: String, required: true },
  templateId:     { type: String, default: null },
  status:         { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
  provider:       { type: String, default: 'msg91' },
  requestId:      { type: String, default: null },
  errorMessage:   { type: String, default: null },
  sentAt:         { type: Date, default: Date.now },
});

module.exports = mongoose.model('SmsDeliveryLog', SmsDeliveryLogSchema);
