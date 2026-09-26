const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId:   { type: String, unique: true },
  farmerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  procurementId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Procurement', required: false },
  amount:          { type: Number, required: true },
  bankAccountNumber: { type: String, default: '•••• •••• 4821' },
  ifscCode:        { type: String, default: 'SBIN0001234' },
  paymentMode:     { type: String, enum: ['DBT (Aadhaar)', 'NEFT', 'RTGS', 'UPI'], default: 'DBT (Aadhaar)' },
  status:          { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'completed' },
  disbursedAt:     { type: Date, default: Date.now },
  utrNumber:       { type: String, default: () => 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000) },
  createdAt:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', PaymentSchema);
