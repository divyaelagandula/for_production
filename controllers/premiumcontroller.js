const {Sequelize}=require('sequelize')
const users = require('../models/users');
const expenses=require('../models/expenses') // Use a descriptive variable name

const checkingUserIsPremiumOrNot = async (req, res) => {
    try {
        // Renaming the result variable to userResult
        const userResult = await users.findByPk(req.user.id, { raw: true }); 
        
        console.log('Checking premium status:', userResult);

        // Now, we correctly use the Express 'res' object to send the response
        res.status(200).json({userResult});
    }
    catch (err) {
        console.error("Error checking premium status:", err);
        // Correctly using the Express 'res' object here too
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
const leaderBoard=async (req,res)=>{
    try{
        const userexpenses=await users.findAll({
            raw:true,
            order:[['totalamount','DESC']]
        })
    console.log("userexpenses>>>",userexpenses)
    res.status(200).json({userexpenses})


    }
    catch(err){
        console.log(err)
        res.status(500).json({error:err})
    }
    
}

module.exports = {
    checkingUserIsPremiumOrNot,
    leaderBoard
};