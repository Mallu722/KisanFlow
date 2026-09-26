const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'KrishiFlow Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// Production Static Client Serving (Single-Host Deployment Support)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🌾 KrishiFlow API Server is running. Frontend build not present at /frontend/dist.');
  });
}

// Automated Background Scheduler: 24-Hour (1-Day) Advance Reminder SMS
const Token = require('./models/Token');
const { sendSms } = require('./services/smsService');

setInterval(async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    const upcomingTokens = await Token.find({
      status: 'waiting',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate('farmerId').populate('centreId');

    for (const token of upcomingTokens) {
      if (token.farmerId && token.farmerId.phone) {
        const smsMsg = `📅 Automated 1-Day APMC Reminder: Dear ${token.farmerId.name || 'Farmer'}, your procurement slot for Token #${token.tokenNumber} (${token.cropType}) at ${token.centreId?.name || 'APMC Yard'} is scheduled for tomorrow! Keep your documents ready.`;
        await sendSms({ phone: token.farmerId.phone, message: smsMsg });
      }
    }
  } catch (err) {
    console.error('1-Day SMS Cron Error:', err.message);
  }
}, 60 * 60 * 1000); // Checks every hour

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
