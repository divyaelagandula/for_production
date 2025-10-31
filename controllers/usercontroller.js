const users=require('../models/users')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
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
module.exports={
    signup,
    login
}