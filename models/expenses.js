const {DataTypes}=require('sequelize')
const db=require('../utilss/db-connection')
const expenses=db.define('expenses',{
        id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
    autoIncrement:true,
allowNull:false
    },
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    category:{
        type:DataTypes.TEXT,
        allowNull:false
    }
  
})
module.exports=expenses
