const express = require('express');

const resetpasswordController = require('../controllers/restpasswdcontroller');


const router = express.Router();

router.get('/updatepassword/:id', resetpasswordController.updatepassword)

router.get('/resetpassword/:id', resetpasswordController.resetpassword)

router.post('/forgotpassword', resetpasswordController.forgotpassword)

module.exports = router;