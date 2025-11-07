const express=require('express')
const usercontroller=require('../controllers/usercontroller')
const middileware=require('../middileware/autherntication')
const routes=express.Router()
routes.post('/signup',usercontroller.signup)
routes.post('/login',usercontroller.login)
routes.post('/logout',middileware.authentication,usercontroller.logout)
module.exports=routes