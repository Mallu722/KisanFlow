const Farmer = require('../models/Farmer');
const Centre = require('../models/Centre');
const Token = require('../models/Token');

// Mock Auth - Login or Create Farmer
exports.loginFarmer = async (req, res) => {
  try {
    const { phone } = req.body;
    let farmer = await Farmer.findOne({ phone });
    
    if (!farmer) {
      farmer = await Farmer.create({ phone });
    }
    
    res.json({ success: true, data: farmer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Recommend Centres based on location (mocked logic)
exports.recommendCentres = async (req, res) => {
  try {
    const centres = await Centre.find({ isActive: true })
      .sort({ currentLoad: 1 }) // sort by lowest load first
      .limit(5);
      
    res.json({ success: true, data: centres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Book a Slot and Generate Token
exports.bookSlot = async (req, res) => {
  try {
    const { farmerId, centreId } = req.body;
    
    // Simple logic to increment load and generate token
    await Centre.findByIdAndUpdate(centreId, { $inc: { currentLoad: 1 } });
    
    const tokenCount = await Token.countDocuments({ centreId, status: 'waiting' });
    
    const token = await Token.create({
      farmerId,
      centreId,
      tokenNumber: tokenCount + 1,
      status: 'waiting'
    });
    
    res.json({ success: true, data: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
