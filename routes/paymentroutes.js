const express = require('express');
const router = express.Router();
const userAuthentication=require('../middileware/autherntication')
const paymentcontroller= require('../controllers/paymentcontroller');

router.post('/pay', paymentcontroller.processPayment);
router.get('/payment-status/:orderId',userAuthentication.authentication, paymentcontroller.getPaymentStatus);

module.exports = router;