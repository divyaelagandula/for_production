const users=require('../models/users')
const jwt=require('jsonwebtoken')
const authentication=async (req,res,next)=>{
    try{
        const token=req.headers.authorization
        const user=jwt.verify(token,'divyakavya')
        console.log('id >>>>>>>>',user.userid)
        const result= await users.findByPk(user.userid,{raw:true})
        console.log('modifies>>>>>>>..',result)
        req.user=result
        next()

    }
    catch(err){
        console.log(err)
        return res.status(401).json({succeses:false,message:'user not authorized'})
    }
}
module.exports={
    authentication
}
