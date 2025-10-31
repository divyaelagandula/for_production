const express=require('express')
const usercontroller=require('../controllers/usercontroller')
const routes=express.Router()
routes.post('/signup',usercontroller.signup)
routes.post('/login',usercontroller.login)
module.exports=routes