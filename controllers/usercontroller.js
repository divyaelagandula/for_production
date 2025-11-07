const users=require('../models/users')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const redisClient=require('../utilss/redis')
function isnotvalid(string){
    if(string==undefined||string.length==0){
        return true
    }
    else{
        return false
    }
}
const signup=async (req,res)=>{
    try{
        const {name,email,password}=req.body
       
        if(isnotvalid(name)||isnotvalid(email)||isnotvalid(password)){
            return res.status(400).json({Error:'missing input filed'})
        }
        const hash = await bcrypt.hash(password, 5);
    
    const result=await users.create({name,email,password:hash,membershipStatus:'false',totalamount:0})
        res.status(201).json({message:'details added to database'})
        }
    
    
    catch(error){
        console.log(error.name)
        if(error.name=='SequelizeUniqueConstraintError'){
            return res.status(409).json({Error:'email alredy exists'})
        }
        res.status(500).json({Error:'error adding details into db'})
    }
    



}
// const login=async (req,res)=>{
//     try{
//         console.log(req.body)
//         const {email,password}=req.body
//         if(isnotvalid(email)||isnotvalid(password)){
//             return res.status(400).json({Error:'missing input filed'})
//         }
//         const listOfUsers=await users.findAll({raw:true})
//         console.log(listOfUsers)
//         const userEmailChecking=listOfUsers.find(user=>user.email==email)
//         const userPasswordChecking=listOfUsers.find(user=>user.password==password)
//         console.log('user email',userEmailChecking)
//         console.log('user paswoord',userPasswordChecking)
//         if(userEmailChecking && userPasswordChecking){
//             return res.status(200).json({succeses:true,message:'user logged successfully'})
//         }
//         if(!userEmailChecking){
//              return res.status(404).json({succeses:false,message:'user not found'})
//         }
//         if(!userPasswordChecking){
//              return res.status(401).json({succeses:false,message:'user not authorized/password invalid'})
//         }

//     }
//     catch(error){
//         console.log(error)
//         res.status(500).json({succeses:false,message:error})
//     }

// }
function generateToken(id){
    return jwt.sign({userid:id},'divyakavya')
}
const login=async (req,res)=>{
    try{
        const {email,password}=req.body
        if(isnotvalid(email)||isnotvalid(password)){
            return res.status(400).json({message:'missing input filed',succeses:false})
        }
        const user=await users.findAll({where:{email:email},raw:true})
                // if no email is found it return empty list..if email found list of that objet details returns

        if(user.length>0){
            bcrypt.compare(password,user[0].password,(error,result)=>{
                if(error){
                    throw new Error('something went wrong')
                }
                if(result==true){
                    return res.status(200).json({data:user,message:'user logged successfully',token:generateToken(user[0].id)})
                }
                else{
                    return res.status(401).json({succeses:false,message:'password invalid'})
                   }
            })
        }
         
        else{
              return res.status(404).json({succeses:false,message:'user not found'})
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({succeses:false,message:err})
    }
}
const logout=async (req,res)=>{
    try {
        // 1. Decode the token to get its expiration time (exp)
        const decodedToken = jwt.decode(token);
        if (!decodedToken || !decodedToken.exp) {
             return res.status(400).json({ success: false, message: 'Token decode failed.' });
        }

        const expirationTime = decodedToken.exp; // Unix timestamp in seconds
        
        // Calculate TTL (Time-To-Live) in seconds: (Expiry Time - Current Time)
        const ttl = expirationTime - Math.floor(Date.now() / 1000); 

        // Ensure TTL is a positive number
        if (ttl <= 0) {
            return res.status(200).json({ success: true, message: 'Token already expired.' });
        }

        // 2. Add the token to Redis Block List with the calculated TTL
        redisClient.set(token, 'blocked', {EX: ttl}).then(() => {
             // 3. Success response
             res.status(200).json({ success: true, message: 'Logged out successfully. Token revoked.' });
        }).catch(err => {
            console.error('Redis Block Error:', err);
            res.status(500).json({ success: false, message: 'Server failed to revoke token.' });
        });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout.' });
    }
}
module.exports={
    signup,
    login,
    logout
}