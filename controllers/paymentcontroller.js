 const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST108424737d52ebab4e83efef6a4637424801", "cfsk_ma_test_3c09f52f6afec1937e955a195f34524c_f53f915d");

   
const path = require("path");

const expenses= require("../models/expenses");
const Users=require('../models/users')


const processPayment = async (req, res) => {
  try{
        const request = {
          "order_amount": 2000,
          "order_currency": "INR",
          "order_id": "ORDER-" + Date.now(),
          
          "customer_details": {
            "customer_id": "1",  
            "customer_phone": "9999999999",
          },

          "order_meta": {
            // "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
            "return_url":"http://localhost:3000/",
            "payment_methods": "ccc, upi, nb"
          }
        }
           const response = await cashfree.PGCreateOrder(request);
     
        const paymentSessionId=response.data.payment_session_id;
        const orderId=response.data.order_id;
   
          
                                                                                                                     
  

  

    res.json({ paymentSessionId, orderId:response.data.order_id});
  }
  
  catch (error) {
    console.error("Error processing payment:", error.message);
    res.status(500).json({ message: "Error processing payment" });
  }
};

const getPaymentStatus = async (req, res) => {
  const orderId = req.params.orderId; 



  try {
    
        const response = await cashfree.PGOrderFetchPayments(orderId);

        let getOrderResponse = response.data;
        let orderStatus;

        if (
          getOrderResponse.filter(
            (transaction) => transaction.payment_status === "SUCCESS"
          ).length > 0
        ) {
          orderStatus = "Success"; 
        } else if (
          getOrderResponse.filter(
            (transaction) => transaction.payment_status === "PENDING"
          ).length > 0
        ) {
          orderStatus = "Pending"; 
        } else {
          orderStatus = "Failure";
        }
  

    // Update payment status in the database
 

if(orderStatus==='Success'){
  await Users.update(
  { membershipStatus: 'true' }, // The fields to update
  { where: {id: req.user.id } }  // The condition for the update
);
}
    
    res.json({orderStatus})
   
  } catch (error) {
    console.error("Error fetching payment status:", error.message);
    res.status(500).json({ message: "Error fetching payment status" });
  }
};  
module.exports={
    processPayment,
    getPaymentStatus

}