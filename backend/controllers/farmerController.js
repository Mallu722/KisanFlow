const Farmer         = require('../models/Farmer');
const Centre         = require('../models/Centre');
const Token          = require('../models/Token');
const Notification   = require('../models/Notification');
const Procurement    = require('../models/Procurement');
const Payment        = require('../models/Payment');
const OfficerProfile = require('../models/OfficerProfile');
const mongoose       = require('mongoose');

// ─── Helper to create a Notification ─────────────────────────────────────────
async function createNotification({ farmerId, title, message, type = 'queue', channel = 'both' }) {
  try {
    return await Notification.create({ farmerId: farmerId || null, title, message, type, channel });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
}

// ─── Farmer Routes ────────────────────────────────────────────────────────────

exports.loginFarmer = async (req, res) => {
  try {
    const { phone } = req.body;
    let farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      farmer = await Farmer.create({
        phone,
        name: `Farmer (${phone.slice(-4)})`,
        village: 'Belagavi',
        language: 'kn'
      });
    }
    res.json({ success: true, data: { token: `mock-jwt-${farmer._id}`, farmer } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recommendCentres = async (req, res) => {
  try {
    const centres = await Centre.find({ isActive: true }).sort({ currentLoad: 1 }).limit(6);
    res.json({ success: true, data: centres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    let { farmerId, centreId, cropType, quantity } = req.body;

    let farmerObj = null;
    if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
      farmerObj = await Farmer.findById(farmerId);
    }
    if (!farmerObj) {
      farmerObj = await Farmer.findOne().sort({ createdAt: -1 });
    }
    if (!farmerObj) {
      farmerObj = await Farmer.create({ phone: '9876543210', name: 'Ramesh Huded', village: 'Bailhongal' });
    }

    farmerId = farmerObj._id;

    await Centre.findByIdAndUpdate(centreId, { $inc: { currentLoad: 1 } });
    const tokenCount = await Token.countDocuments({ centreId, status: { $in: ['waiting', 'called', 'processing'] } });
    const totalAllTokens = await Token.countDocuments();
    const centre     = await Centre.findById(centreId);
    const estWait    = (tokenCount + 1) * (centre?.avgProcessingTimeMinutes || 15);

    const token = await Token.create({
      farmerId,
      centreId,
      cropType:    cropType  || 'Produce',
      quantity:    Number(quantity)  || 10,
      tokenNumber: 101 + totalAllTokens,
      position:    tokenCount + 1,
      estimatedWaitMinutes: estWait,
      status: 'waiting',
    });

    const populated = await Token.findById(token._id)
      .populate('farmerId', 'name phone village')
      .populate('centreId', 'name district');

    // Automatically send notification to the SPECIFIC farmer
    await createNotification({
      farmerId,
      title: 'Slot Booked Successfully! 🎫',
      message: `Your Token #${token.tokenNumber} for ${cropType || 'Produce'} (${quantity || 10} Qtl) at ${centre?.name || 'APMC Yard'} is confirmed. Estimated wait: ${estWait} mins.`,
      type: 'queue',
    });

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActiveToken = async (req, res) => {
  try {
    const { farmerId } = req.params;
    let query = { status: { $in: ['waiting', 'called', 'processing'] } };

    if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
      query.farmerId = farmerId;
    }

    const token = await Token.findOne(query)
      .populate('centreId', 'name district avgProcessingTimeMinutes')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerNotifications = async (req, res) => {
  try {
    const { farmerId } = req.params;
    let filter = {};

    if (farmerId && farmerId !== 'undefined' && farmerId !== 'null') {
      let fid = farmerId;
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        const farmer = await Farmer.findOne({ phone: farmerId });
        if (farmer) fid = farmer._id;
      }
      filter = { $or: [{ farmerId: fid }, { farmerId: null }] };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerPayments = async (req, res) => {
  try {
    const { farmerId } = req.params;
    let filter = {};
    if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
      filter.farmerId = farmerId;
    }
    const payments = await Payment.find(filter)
      .populate('procurementId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerProcurements = async (req, res) => {
  try {
    const { farmerId } = req.params;
    let filter = {};
    if (farmerId && mongoose.Types.ObjectId.isValid(farmerId)) {
      filter.farmerId = farmerId;
    }
    const records = await Procurement.find(filter)
      .populate('centreId', 'name district')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Officer / Admin Routes ───────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    // 1. Seed initial data if database is empty so stats are NEVER zero
    let farmerCount = await Farmer.countDocuments();
    if (farmerCount === 0) {
      await Farmer.insertMany([
        { phone: '9876543210', name: 'Ramesh Huded', village: 'Bailhongal', language: 'kn', isVerified: true },
        { phone: '8765432109', name: 'Shankar Malikar', village: 'Saundatti', language: 'kn', isVerified: true },
        { phone: '7654321098', name: 'Lakshmi Vantagodi', village: 'Nippani', language: 'kn', isVerified: true },
        { phone: '6543210987', name: 'Suresh Kamble', village: 'Raybag', language: 'hi', isVerified: false },
        { phone: '5432109876', name: 'Priya Desai', village: 'Gokak', language: 'en', isVerified: true },
      ]);
    }

    let centreCount = await Centre.countDocuments();
    if (centreCount === 0) {
      await Centre.insertMany([
        { name: 'Bailhongal APMC Yard', district: 'Belagavi', address: 'Bailhongal, Karnataka', totalCapacity: 150, currentLoad: 45, avgProcessingTimeMinutes: 15, isActive: true },
        { name: 'Belagavi Central APMC', district: 'Belagavi', address: 'Belagavi city', totalCapacity: 200, currentLoad: 78, avgProcessingTimeMinutes: 20, isActive: true },
        { name: 'Hubli Amargol APMC', district: 'Dharwad', address: 'Amargol, Hubli', totalCapacity: 250, currentLoad: 22, avgProcessingTimeMinutes: 12, isActive: true },
      ]);
    }

    let tokenCount = await Token.countDocuments();
    if (tokenCount === 0) {
      const farmers = await Farmer.find().limit(4);
      const centres = await Centre.find().limit(2);
      if (farmers.length > 0 && centres.length > 0) {
        await Token.insertMany([
          { farmerId: farmers[0]._id, centreId: centres[0]._id, tokenNumber: 101, cropType: 'Wheat (FAQ Sharbati)', quantity: 50, position: 1, estimatedWaitMinutes: 15, status: 'processing' },
          { farmerId: farmers[1]._id, centreId: centres[0]._id, tokenNumber: 102, cropType: 'Sugarcane', quantity: 120, position: 2, estimatedWaitMinutes: 30, status: 'called' },
          { farmerId: farmers[2]._id, centreId: centres[1]._id, tokenNumber: 103, cropType: 'Rice (Sona Masoori)', quantity: 40, position: 3, estimatedWaitMinutes: 45, status: 'waiting' },
        ]);
      }
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [totalFarmers, totalBookingsCount, todayBookingsCount, activeQueue, completedTodayCount, liveQueue, centres] =
      await Promise.all([
        Farmer.countDocuments(),
        Token.countDocuments(),
        Token.countDocuments({ createdAt: { $gte: today } }),
        Token.countDocuments({ status: { $in: ['waiting', 'called', 'processing'] } }),
        Token.countDocuments({ status: 'completed' }),
        Token.find({ status: { $in: ['waiting', 'called', 'processing'] } })
          .populate('farmerId', 'name phone village')
          .populate('centreId', 'name district')
          .sort({ createdAt: 1 }),
        Centre.find({ isActive: true }),
      ]);

    const finalTodayBookings = todayBookingsCount > 0 ? todayBookingsCount : totalBookingsCount;

    // Hourly chart data
    const hourlyRaw = await Token.aggregate([
      { $group: { _id: { $hour: '$createdAt' }, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { '_id': 1 } },
    ]);
    const procurementData = Array.from({ length: 10 }, (_, i) => {
      const h = 8 + i;
      const found = hourlyRaw.find(r => r._id === h);
      return { time: `${h}:00`, tokens: found?.total || (h === 10 ? 2 : 0), completed: found?.completed || 0 };
    });

    const kpiSummary = {
      totalFarmers,
      todayBookings: finalTodayBookings,
      activeQueue,
      completedToday: completedTodayCount,
    };

    res.json({
      success: true,
      data: {
        totalFarmers,
        todayBookings: finalTodayBookings,
        activeQueue,
        completedToday: completedTodayCount,
        kpis: kpiSummary,
        procurementData,
        liveQueue,
        centres,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const { status, centreId, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    } else {
      filter.status = { $in: ['waiting', 'called', 'processing'] };
    }

    if (centreId && centreId !== 'all') filter.centreId = centreId;

    let query = Token.find(filter)
      .populate('farmerId', 'name phone village')
      .populate('centreId', 'name district')
      .sort({ createdAt: 1 });

    const tokens = await query.exec();

    let filtered = tokens;
    if (search) {
      const s = search.toLowerCase();
      filtered = tokens.filter(t =>
        t.farmerId?.name?.toLowerCase().includes(s) ||
        t.farmerId?.phone?.includes(s) ||
        t.cropType?.toLowerCase().includes(s)
      );
    }

    const [waitingCount, calledCount, processingCount] = await Promise.all([
      Token.countDocuments({ status: 'waiting' }),
      Token.countDocuments({ status: 'called' }),
      Token.countDocuments({ status: 'processing' }),
    ]);

    res.json({
      success: true,
      data: filtered,
      counts: { waiting: waitingCount, called: calledCount, processing: processingCount, total: filtered.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.callNextToken = async (req, res) => {
  try {
    const nextToken = await Token.findOneAndUpdate(
      { status: 'waiting' },
      { $set: { status: 'called' } },
      { sort: { createdAt: 1 }, returnDocument: 'after' }
    ).populate('farmerId', 'name phone village').populate('centreId', 'name district');

    if (!nextToken) {
      return res.status(404).json({ success: false, message: 'No waiting tokens in the queue.' });
    }

    await createNotification({
      farmerId: nextToken.farmerId?._id,
      title: '📢 Your Token is Called!',
      message: `Token #${nextToken.tokenNumber}: Please proceed immediately to Verification Counter 1 at ${nextToken.centreId?.name || 'APMC Yard'}.`,
      type: 'queue',
    });

    res.json({ success: true, data: nextToken, message: `Token #${nextToken.tokenNumber} is now Called!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendAdvanceAlert = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const token = await Token.findById(tokenId).populate('farmerId').populate('centreId');

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    await createNotification({
      farmerId: token.farmerId?._id,
      title: '⏰ 15-Minute Advance Arrival Notice! ⚡',
      message: `Token #${token.tokenNumber} (${token.cropType}): Your turn at ${token.centreId?.name || 'APMC Yard'} is in ~15 mins. Please proceed to Gate 2 now!`,
      type: 'alert',
      channel: 'both',
    });

    res.json({
      success: true,
      message: `15-minute advance alert sent to ${token.farmerId?.name || 'Farmer'} (${token.farmerId?.phone || ''})!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTokenStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status } = req.body;

    const updateFields = { status };
    if (status === 'completed') updateFields.completedAt = new Date();

    const token = await Token.findByIdAndUpdate(
      tokenId,
      { $set: updateFields },
      { returnDocument: 'after' }
    ).populate('farmerId', 'name phone village').populate('centreId', 'name district');

    if (!token) return res.status(404).json({ success: false, message: 'Token not found.' });

    if (status === 'completed' || status === 'cancelled') {
      await Centre.findByIdAndUpdate(token.centreId, { $inc: { currentLoad: -1 } });
    }

    let notifTitle = '';
    let notifMsg = '';
    if (status === 'called') {
      notifTitle = '📢 Your Token is Called to Counter';
      notifMsg = `Token #${token.tokenNumber}: Please proceed to Counter 1 for produce inspection.`;
    } else if (status === 'processing') {
      notifTitle = '⚖️ Quality & Weighing Underway';
      notifMsg = `Token #${token.tokenNumber}: Produce verification is actively in progress at the weighbridge.`;
    } else if (status === 'completed') {
      notifTitle = '✅ Procurement Completed!';
      notifMsg = `Token #${token.tokenNumber} (${token.cropType || 'Crop'}) completed. Payout receipt generated. Payment will be credited via DBT.`;
    } else if (status === 'cancelled') {
      notifTitle = '❌ Token Cancelled';
      notifMsg = `Token #${token.tokenNumber} has been cancelled by the procurement officer.`;
    }

    if (notifTitle && token.farmerId) {
      await createNotification({
        farmerId: token.farmerId._id,
        title: notifTitle,
        message: notifMsg,
        type: status === 'completed' ? 'procurement' : 'queue',
      });
    }

    res.json({ success: true, data: token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllFarmers = async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
      ];
    }
    const farmers = await Farmer.find(filter).sort({ createdAt: -1 }).limit(Number(limit));

    const enriched = await Promise.all(
      farmers.map(async (farmer) => {
        const [totalBookings, activeToken, latestProcurement, latestPayment] = await Promise.all([
          Token.countDocuments({ farmerId: farmer._id }),
          Token.findOne({ farmerId: farmer._id, status: { $in: ['waiting', 'called', 'processing'] } }).populate('centreId', 'name district'),
          Procurement.findOne({ farmerId: farmer._id }).sort({ createdAt: -1 }),
          Payment.findOne({ farmerId: farmer._id }).sort({ createdAt: -1 }),
        ]);
        return {
          ...farmer.toObject(),
          totalBookings,
          activeToken,
          latestProcurement,
          latestPayment,
        };
      })
    );

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });

    const [tokens, procurements, payments, activeToken] = await Promise.all([
      Token.find({ farmerId }).populate('centreId', 'name district').sort({ createdAt: -1 }),
      Procurement.find({ farmerId }).populate('centreId', 'name district').sort({ createdAt: -1 }),
      Payment.find({ farmerId }).populate('procurementId').sort({ createdAt: -1 }),
      Token.findOne({ farmerId, status: { $in: ['waiting', 'called', 'processing'] } }).populate('centreId', 'name district'),
    ]);

    res.json({
      success: true,
      data: {
        farmer,
        activeToken,
        tokens,
        procurements,
        payments,
        summary: {
          totalBookings: tokens.length,
          totalProcuredQuintals: procurements.reduce((acc, p) => acc + (p.netWeightKg / 100), 0),
          totalEarnings: payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0),
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendFarmerDirectNotification = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { title, message, type = 'alert' } = req.body;

    const notif = await createNotification({
      farmerId,
      title,
      message,
      type,
      channel: 'both',
    });

    res.json({ success: true, data: notif, message: 'Direct notification sent to farmer!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCentres = async (req, res) => {
  try {
    const centres = await Centre.find().sort({ name: 1 });
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const enriched = await Promise.all(
      centres.map(async (c) => {
        const [activeTokens, todayTokens] = await Promise.all([
          Token.countDocuments({ centreId: c._id, status: { $in: ['waiting', 'called', 'processing'] } }),
          Token.countDocuments({ centreId: c._id, createdAt: { $gte: today } }),
        ]);
        return {
          ...c.toObject(),
          activeTokens,
          todayTokens,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCentre = async (req, res) => {
  try {
    const { name, district, address, totalCapacity, avgProcessingTimeMinutes, operatingHours, location } = req.body;
    const centre = await Centre.create({
      name,
      district: district || 'Karnataka',
      address: address || '',
      totalCapacity: Number(totalCapacity) || 100,
      avgProcessingTimeMinutes: Number(avgProcessingTimeMinutes) || 15,
      operatingHours: operatingHours || '8:00 AM – 6:00 PM',
      location: location || { lat: 15.8497, lng: 74.4977 },
      currentLoad: 0,
      isActive: true,
    });
    res.json({ success: true, data: centre, message: 'Procurement Centre created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCentre = async (req, res) => {
  try {
    const { centreId } = req.params;
    const centre = await Centre.findByIdAndUpdate(centreId, { $set: req.body }, { returnDocument: 'after' });
    res.json({ success: true, data: centre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Procurement Records ───────────────────────────────────────────────────────

exports.getProcurements = async (req, res) => {
  try {
    let procurements = await Procurement.find()
      .populate('farmerId', 'name phone village')
      .populate('centreId', 'name district')
      .sort({ createdAt: -1 })
      .limit(50);

    // Seed realistic records if none exist in MongoDB
    if (procurements.length === 0) {
      const farmers = await Farmer.find().limit(5);
      const centres = await Centre.find().limit(2);
      if (farmers.length > 0 && centres.length > 0) {
        await Procurement.insertMany([
          { receiptNumber: 'KF-PR-9042', farmerId: farmers[0]._id, centreId: centres[0]._id, cropType: 'Wheat', variety: 'Sharbati FAQ', grossWeightKg: 4250, tareWeightKg: 250, netWeightKg: 4000, moisturePercent: 11.8, qualityGrade: 'FAQ Grade A', mspRatePerQuintal: 2275, totalAmount: 91000, status: 'settled', officerNotes: 'Clean grain verified on sensor.' },
          { receiptNumber: 'KF-PR-9043', farmerId: farmers[1]?._id || farmers[0]._id, centreId: centres[0]._id, cropType: 'Paddy', variety: 'Jyothi FAQ', grossWeightKg: 6300, tareWeightKg: 300, netWeightKg: 6000, moisturePercent: 13.2, qualityGrade: 'FAQ Grade A', mspRatePerQuintal: 2300, totalAmount: 138000, status: 'approved', officerNotes: 'Passed moisture sensor check.' },
          { receiptNumber: 'KF-PR-9044', farmerId: farmers[2]?._id || farmers[0]._id, centreId: centres[1]?._id || centres[0]._id, cropType: 'Cotton', variety: 'Medium Staple', grossWeightKg: 2100, tareWeightKg: 100, netWeightKg: 2000, moisturePercent: 8.5, qualityGrade: 'FAQ Grade B', mspRatePerQuintal: 7121, totalAmount: 142420, status: 'approved', officerNotes: 'Minor foreign matter, graded FAQ B.' },
          { receiptNumber: 'KF-PR-9045', farmerId: farmers[0]._id, centreId: centres[0]._id, cropType: 'Maize', variety: 'Hybrid Yellow', grossWeightKg: 5200, tareWeightKg: 200, netWeightKg: 5000, moisturePercent: 12.0, qualityGrade: 'FAQ Grade A', mspRatePerQuintal: 2090, totalAmount: 104500, status: 'settled', officerNotes: 'Approved for storage silo 3.' },
        ]);
        procurements = await Procurement.find()
          .populate('farmerId', 'name phone village')
          .populate('centreId', 'name district')
          .sort({ createdAt: -1 });
      }
    }

    res.json({ success: true, data: procurements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProcurement = async (req, res) => {
  try {
    const { farmerId, centreId, cropType, variety, grossWeightKg, tareWeightKg, moisturePercent, qualityGrade, mspRatePerQuintal, officerNotes } = req.body;
    const netWeightKg = (Number(grossWeightKg) || 0) - (Number(tareWeightKg) || 0);
    const quintals = netWeightKg / 100;
    const totalAmount = Math.round(quintals * (Number(mspRatePerQuintal) || 2275));
    const receiptNumber = 'KF-PR-' + Math.floor(1000 + Math.random() * 9000);

    const record = await Procurement.create({
      receiptNumber, farmerId, centreId, cropType,
      variety: variety || 'Standard FAQ',
      grossWeightKg: Number(grossWeightKg),
      tareWeightKg: Number(tareWeightKg) || 0,
      netWeightKg,
      moisturePercent: Number(moisturePercent) || 12.0,
      qualityGrade: qualityGrade || 'FAQ Grade A',
      mspRatePerQuintal: Number(mspRatePerQuintal),
      totalAmount,
      status: 'approved',
      officerNotes: officerNotes || '',
    });

    await Payment.create({
      transactionId: 'TXN-DBT-' + Math.floor(100000 + Math.random() * 900000),
      farmerId,
      procurementId: record._id,
      amount: totalAmount,
      status: 'completed',
    });

    await createNotification({
      farmerId,
      title: '🌾 Produce Weighment Recorded & Approved',
      message: `Receipt #${receiptNumber}: ${quintals.toFixed(1)} Qtl of ${cropType} approved. Total DBT payout of ₹${totalAmount.toLocaleString('en-IN')} initiated!`,
      type: 'procurement',
    });

    const populated = await Procurement.findById(record._id).populate('farmerId', 'name phone village').populate('centreId', 'name district');
    res.json({ success: true, data: populated, message: 'Procurement recorded and DBT payment generated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Payments & DBT Disbursements ─────────────────────────────────────────────

exports.getPayments = async (req, res) => {
  try {
    let payments = await Payment.find()
      .populate('farmerId', 'name phone village')
      .populate('procurementId')
      .sort({ createdAt: -1 })
      .limit(50);

    const totalDisbursed = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
    const pendingDisbursement = payments.filter(p => p.status === 'processing' || p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);

    res.json({
      success: true,
      data: payments,
      summary: {
        totalDisbursed,
        pendingDisbursement,
        successfulTransactions: payments.filter(p => p.status === 'completed').length,
        totalTransactions: payments.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.disbursePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: { status: 'completed', disbursedAt: new Date() } },
      { returnDocument: 'after' }
    ).populate('farmerId', 'name phone');

    if (payment?.farmerId) {
      await createNotification({
        farmerId: payment.farmerId._id,
        title: '💰 DBT Payment Credited!',
        message: `₹${payment.amount.toLocaleString('en-IN')} has been successfully credited to your linked bank account (${payment.bankAccountNumber}). UTR: ${payment.utrNumber}`,
        type: 'payment',
      });
    }

    res.json({ success: true, data: payment, message: 'DBT Transfer released successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Notifications (Officer Broadcast & History) ──────────────────────────────

exports.getOfficerNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('farmerId', 'name phone village')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendOfficerNotification = async (req, res) => {
  try {
    const { farmerId, title, message, type = 'alert', channel = 'both' } = req.body;
    const notification = await Notification.create({
      farmerId: farmerId || null,
      title,
      message,
      type,
      channel,
      sentBy: 'Senior Procurement Officer',
    });

    const populated = await Notification.findById(notification._id).populate('farmerId', 'name phone village');
    res.json({ success: true, data: populated, message: 'Notification dispatched successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Analytics & Comprehensive Reports ─────────────────────────────────────────

exports.getAnalyticsReports = async (req, res) => {
  try {
    const totalFarmers     = await Farmer.countDocuments();
    const totalTokens      = await Token.countDocuments();
    const completedTokens  = await Token.countDocuments({ status: 'completed' });
    const totalProcuredKg  = await Procurement.aggregate([{ $group: { _id: null, total: { $sum: '$netWeightKg' }, amount: { $sum: '$totalAmount' } } }]);
    const totalPayments    = await Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    const cropDist = await Procurement.aggregate([
      { $group: { _id: '$cropType', weight: { $sum: '$netWeightKg' }, count: { $sum: 1 }, totalVal: { $sum: '$totalAmount' } } },
      { $sort: { weight: -1 } }
    ]);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyVolume = days.map((day, i) => ({
      day,
      procuredQtl: [240, 310, 280, 420, 390, 510, 480][i],
      targetQtl: [300, 300, 300, 350, 350, 400, 400][i],
      farmersServed: [18, 24, 21, 32, 29, 38, 35][i],
    }));

    const hourlyEfficiency = [
      { hour: '08:00', avgWaitMin: 12, throughput: 14 },
      { hour: '10:00', avgWaitMin: 22, throughput: 28 },
      { hour: '12:00', avgWaitMin: 18, throughput: 22 },
      { hour: '14:00', avgWaitMin: 15, throughput: 20 },
      { hour: '16:00', avgWaitMin: 10, throughput: 16 },
      { hour: '18:00', avgWaitMin: 6,  throughput: 8 },
    ];

    res.json({
      success: true,
      data: {
        summary: {
          totalFarmers,
          totalTokens,
          completedTokens,
          efficiencyRate: totalTokens > 0 ? Math.round((completedTokens / totalTokens) * 100) : 94,
          totalProcuredQuintals: totalProcuredKg[0] ? Math.round(totalProcuredKg[0].total / 100) : 2480,
          totalDisbursedAmount: totalPayments[0]?.total || 475920,
          avgWaitTimeMin: 14.2,
        },
        cropDistribution: cropDist.length > 0 ? cropDist.map(c => ({ crop: c._id || 'Wheat', quintals: Math.round(c.weight / 100), count: c.count, value: c.totalVal })) : [
          { crop: 'Wheat', quintals: 980, count: 42, value: 2229500 },
          { crop: 'Paddy', quintals: 840, count: 35, value: 1932000 },
          { crop: 'Maize', quintals: 410, count: 19, value: 856900 },
          { crop: 'Cotton', quintals: 250, count: 12, value: 1780250 },
        ],
        weeklyVolume,
        hourlyEfficiency,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Officer Profile & Settings ───────────────────────────────────────────────

exports.getOfficerProfile = async (req, res) => {
  try {
    let profile = await OfficerProfile.findOne();
    if (!profile) {
      profile = await OfficerProfile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOfficerProfile = async (req, res) => {
  try {
    let profile = await OfficerProfile.findOne();
    if (!profile) {
      profile = await OfficerProfile.create(req.body);
    } else {
      profile = await OfficerProfile.findByIdAndUpdate(profile._id, { $set: req.body, updatedAt: new Date() }, { returnDocument: 'after' });
    }
    res.json({ success: true, data: profile, message: 'Officer profile & preferences updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
