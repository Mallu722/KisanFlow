const mongoose = require('mongoose');

const ProcurementSchema = new mongoose.Schema({
  receiptNumber:  { type: String, unique: true },
  farmerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  centreId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', required: true },
  tokenId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: false },
  cropType:       { type: String, required: true },
  variety:        { type: String, default: 'Standard' },
  grossWeightKg:  { type: Number, required: true },
  tareWeightKg:   { type: Number, default: 0 },
  netWeightKg:    { type: Number, required: true },
  moisturePercent:{ type: Number, default: 12.5 },
  qualityGrade:   { type: String, enum: ['FAQ Grade A', 'FAQ Grade B', 'Grade C', 'Rejected'], default: 'FAQ Grade A' },
  mspRatePerQuintal: { type: Number, required: true },
  totalAmount:    { type: Number, required: true },
  status:         { type: String, enum: ['pending_quality', 'approved', 'rejected', 'settled'], default: 'approved' },
  officerNotes:   { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Procurement', ProcurementSchema);
