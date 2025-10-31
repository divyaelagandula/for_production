const users=require('./users')
const expenses=require('./expenses')
const forgetpassword=require('./forgetpassword')
const downloadedurls=require('./downloadedurls')
users.hasMany(expenses)
expenses.belongsTo(users)

users.hasMany(forgetpassword);
forgetpassword.belongsTo(users);

users.hasMany(downloadedurls)
downloadedurls.belongsTo(users)
module.exports={
    users,
    expenses,
    forgetpassword,
    downloadedurls
}