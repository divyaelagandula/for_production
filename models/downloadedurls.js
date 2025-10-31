const {DataTypes}=require('sequelize')
const db=require('../utilss/db-connection')
const downloadedurls=db.define('downloadedurls',{

 
    url:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    fileName:{
        type:DataTypes.STRING,
        allowNull:false
    },
    downloadeAt:{
        type:DataTypes.DATE,
        allowNull:false
    }
  
})
module.exports=downloadedurls
