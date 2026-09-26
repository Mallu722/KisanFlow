const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  centreId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', required: true },
  tokenNumber: { type: Number, required: true },
  cropType:    { type: String, default: 'Unknown' },
  quantity:    { type: Number, default: 0 },
  position:    { type: Number, default: 1 },
  estimatedWaitMinutes: { type: Number, default: 15 },
  status: {
    type: String,
    enum: ['waiting', 'called', 'processing', 'completed', 'cancelled'],
    default: 'waiting'
  },
  calledAt:    { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Token', TokenSchema);
