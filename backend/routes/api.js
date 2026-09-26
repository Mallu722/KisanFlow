const express = require('express');
const router  = express.Router();
const c       = require('../controllers/farmerController');

// ─── Farmer (public) ─────────────────────────────────────────────────────────
router.post('/farmer/signup',               c.signupFarmer);
router.post('/farmer/signin',               c.signinFarmer);
router.post('/farmer/send-otp',              c.sendOtp);
router.post('/farmer/verify-otp',            c.verifyOtp);
router.post('/farmer/login',                 c.signinFarmer);
router.get('/centres/recommend',             c.recommendCentres);
router.post('/slots/book',                   c.bookSlot);
router.get('/slots/active/:farmerId',        c.getActiveToken);
router.get('/farmer/notifications/:farmerId',c.getFarmerNotifications);
router.get('/farmer/payments/:farmerId',     c.getFarmerPayments);
router.get('/farmer/procurements/:farmerId', c.getFarmerProcurements);

// ─── Officer / Admin ─────────────────────────────────────────────────────────
router.get('/officer/dashboard',                     c.getDashboard);
router.get('/officer/queue',                         c.getQueue);
router.post('/officer/queue/call-next',              c.callNextToken);
router.post('/officer/token/:tokenId/advance-alert',  c.sendAdvanceAlert);
router.put('/officer/token/:tokenId/status',         c.updateTokenStatus);

// Farmers Directory & Deep Profile
router.get('/officer/farmers',                       c.getAllFarmers);
router.get('/officer/farmers/:farmerId',             c.getFarmerDetails);
router.post('/officer/farmers/:farmerId/notify',     c.sendFarmerDirectNotification);

// Centres Management
router.get('/officer/centres',                       c.getCentres);
router.post('/officer/centres',                      c.createCentre);
router.put('/officer/centres/:centreId',             c.updateCentre);

// Procurement Records
router.get('/officer/procurements',                  c.getProcurements);
router.post('/officer/procurements',                 c.createProcurement);

// Payments & DBT
router.get('/officer/payments',                      c.getPayments);
router.post('/officer/payments/:paymentId/disburse', c.disbursePayment);

// Notifications & Broadcast
router.get('/officer/notifications',                 c.getOfficerNotifications);
router.post('/officer/notifications/send',           c.sendOfficerNotification);
router.post('/officer/notifications/send-sms',       c.sendOfficerSmsAnnouncement);

// Analytics & Reports
router.get('/officer/reports',                       c.getAnalyticsReports);

// Officer Profile & Settings
router.get('/officer/profile',                       c.getOfficerProfile);
router.put('/officer/profile',                       c.updateOfficerProfile);

module.exports = router;
