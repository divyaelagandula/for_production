const express = require('express');
const router = express.Router();
const userAuthentication=require('../middileware/autherntication')
const premiumcontroller=require('../controllers/premiumcontroller')
router.get('/checking',userAuthentication.authentication,premiumcontroller.checkingUserIsPremiumOrNot);
router.get('/leaderBoard',premiumcontroller.leaderBoard)
module.exports = router;