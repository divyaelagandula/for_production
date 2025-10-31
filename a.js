const express = require('express');
const users = require('./models/users'); 
const expenses=require('./models/expenses')
const index=require('./models/in')
const userroutes=require('./routes/userroutes')
const expenseroutes=require('./routes/expenseroutes')
const paymentroutes=require('./routes/paymentroutes')
const premiumroutes=require('./routes/premiumroutes')
const resetPasswordRoutes = require('./routes/restpasswd')
const db = require('./utilss/db-connection'); 
const fs=require('fs')
const https=require('https')
const cors = require('cors');
const path=require('path')
  const compression = require('compression');


const app = express();


app.use(express.json()); 
app.use(cors());

    app.use(compression());

// 1. Static File Serving (Crucial for opening login.html)
// This serves all files (HTML, CSS, JS) from the 'views' directory automatically.
// This allows your <a href="/login.html"> link to work without an explicit route.
app.use(express.static(path.join(__dirname, 'views')));

app.use('/membership',paymentroutes)
app.use('/users',userroutes)
app.use('/expense',expenseroutes)
app.use('/premium',premiumroutes)
app.use('/password', resetPasswordRoutes);
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, "./views/signup.html"));
})



db.sync().then(() => {
    console.log('Database synchronized successfully');
    
    // Use https.createServer() instead of app.listen()
    app.listen(3000, () => {
        console.log("Server is running securely on http://localhost:3000");
    });
}).catch(err => {
    console.error('Failed to synchronize database:', err);
});