const { Sequelize, where, json } = require('sequelize')
const expenses = require('../models/expenses')
const users = require('../models/users')
const downloadedurls=require('../models/downloadedurls')
require('dotenv').config()
const AWS = require('aws-sdk')
const genai = require('@google/genai');
const sequelize = require('../utilss/db-connection');

const { response } = require('express');
function isnotvalid(string) {
    if (string == '') {
        return true
    }
    else {
        return false
    }
}
async function generateCategory(description) {
    const ai = new genai.GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `give only one category for the provided description.${description}`,
    });
    console.log('new aiii outputttttt', response.text);

    const category = response.text
    return category
}
const addexpense = async (req, res) => {
    console.log('.........', req.user)
    console.log(req.body)
    const transaction = await sequelize.transaction()
    try {
        const { amount, description } = req.body
        const category = await generateCategory(description)

        if (isnotvalid(amount) || isnotvalid(description)) {
            res.status(400).json({ message: 'amount and description must to fill' })
        }
        const result = await expenses.create({ amount, description, 'category': category, 'userId': req.user.id }, { transaction: transaction })
        const [affectedRowsCount] = await users.update(
            {
                totalamount: Number(req.user.totalamount) + Number(amount)
            },
            {
                where: { id: req.user.id },
                transaction: transaction
            }
        );

        if (affectedRowsCount > 0) {
            console.log(`Successfully added ${amount} to total_amount for user ID ${req.user.id}.`);
            await transaction.commit()
        } else {
            console.log(`No user found with ID ${req.user.id} to update.`);
        }

        console.log('added data in db.....', result)
        res.status(201).json({ message: 'details added sucesfully', data: result })
    }
    catch (error) {
        console.log(error)
        await transaction.rollback()
        res.status(500).json({ message: error })
    }

}
const getexpenses = async (req, res) => {
    try {
        const usedpage = Number(req.query.usedpage)
        const limit = Number(req.query.limit)
        const totalexpenses = await expenses.count({ where: { userId: req.user.id } })
        console.log('tttttttttt', totalexpenses)
        const result = await expenses.findAll({

            where: { userId: req.user.id }, // Filter by the authenticated user
            limit: limit,         // The number of records to return
            offset: (usedpage - 1) * limit,
            raw: true          // The number of records to skip

        })
        console.log('getting particular user details........', result)
        const buttondetails = {
            currentpage: usedpage,
            previouspage: usedpage - 1,
            nextpage: usedpage + 1,
            haspreviouspage: usedpage > 1,
            hasnextpage: usedpage < Math.ceil(totalexpenses / limit),
            totalpages: Math.ceil(totalexpenses / limit)

        }


        res.status(200).json({ result: result, buttondetails: buttondetails })
    }
    catch (err) {
        res.status(500).json({ message: 'unable to fetch details' })
    }

}
const deleteexpense = async (req, res) => {
    // 1. Get transaction object
    const transaction = await sequelize.transaction();

    try {
        const id = req.params.id;

        // 2. Find the expense *within* the transaction to get the amount
        // Also ensure it belongs to the current user
        const expenseToDelete = await expenses.findOne({
            where: { id: id, userId: req.user.id },
            transaction: transaction
        });

        // 3. Check if the expense exists and belongs to the user
        if (!expenseToDelete) {
            // Rollback if the expense wasn't found (important for 404)
            await transaction.rollback();
            return res.status(404).json({ message: 'Expense ID not found or does not belong to the user' });
        }

        const amount = expenseToDelete.amount; // Get the amount to subtract

        // 4. Destroy the expense *within* the transaction
        const result = await expenses.destroy({
            where: { id: id },
            transaction: transaction
        }); // 'result' here will be 1 (success) since we already checked for existence

        // 5. Update the user's totalamount *within* the transaction
        const [affectedRowsCount] = await users.update(
            {
                totalamount: Number(req.user.totalamount) - Number(amount)
            },
            {
                where: { id: req.user.id },
                transaction: transaction // Use the transaction
            }
        );

        // 6. Commit the transaction if all operations were successful
        await transaction.commit();

        if (affectedRowsCount > 0) {
            console.log(`Successfully subtracted ${amount} from total_amount for user ID ${req.user.id}.`);
        }

        return res.status(200).json({ message: 'Expense deleted successfully' });

    } catch (error) {
        // 7. Rollback the transaction on any error
        await transaction.rollback();
        console.error("Error deleting expense:", error);
        return res.status(500).json({ message: 'Unable to delete expense' });
    }
}
const download = async (req, res) => {
    try {
        const response = await expenses.findAll({ where: { userId: req.user.id } })
        const reponseinstring = JSON.stringify(response)
        const filename = `expense${req.user.id}-${new Date()}.txt`
        const url = await uploadToS3(reponseinstring, filename)
        console.log(url)
        await downloadedurls.create({
            url:url,
            fileName:filename,
            downloadeAt:new Date(),
            userId:req.user.id
        })
        if(url.error){
            throw new Error(`${url.error}`)
        }
        res.status(200).json({ succeses: true, fileurl: url })


    }
    catch (err) {
        res.status(500).json({ succeses: false, error: err.message })
    }


}
async function uploadToS3(data, filename) {
    try {
        const s3 = new AWS.S3();
        const bucketName = process.env.S3_BUCKET_NAME
        const fileParams = {
            // 2. Operation Parameters (using the required keywords)
            Bucket: bucketName,           // <--- The name of your S3 container
            Key: filename, // <--- The name/path of the file in S3
            Body: data,
            ACL:'public-read'
        };
      // Use .promise() to convert the upload operation into an awaitable Promise
        const s3response = await s3.upload(fileParams).promise();
        
        console.log("S3 Upload Successful. Response:", s3response);
        
        // Return the public URL (Location) from the S3 response
        return s3response.Location;
    
    }
    catch(error){
        console.log(error)
        return {error:error.message}
    }
    
}
// Example GET endpoint handler
const getDownloadHistory = async (req, res) => {
    try {
        const history = await downloadedurls.findAll({
            where: { userId: req.user.id },
            order: [['downloadeAt', 'DESC']] // Show most recent first
        });
        console.log('neeeeeewwwww',history)

        res.status(200).json({ success: true, history: history });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Could not fetch history' });
    }
}

module.exports = {
    addexpense,
    getexpenses,
    deleteexpense,
    download,
    getDownloadHistory
}