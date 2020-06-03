const User = require("./../models/user");

var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new mongoose.Schema({
  firstName: { type: String, default: "firstName" },
  lastName: { type: String, default: "lastName" },
  email: { type: String, default: "email" },
  username:String,
  password:String
});
let dbModel = mongoose.model("User", userSchema, "Users");

module.exports.getUsers = function () {
  return new Promise((resolve, reject) => {
    dbModel
      .find()
      .then((data) => {
        //TO DO: make list of User objects
        resolve(data);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end findAll users

module.exports.getUser = function (userEmail) {
  return new Promise((resolve, reject) => {
    dbModel
      .findOne({
        email: userEmail,
      })
      .exec()
      .then((data) => {
        //make user object and resolve
        let theUser = new User();
        theUser.setFirstName(data.firstName);
        theUser.setEmail(data.email);
        theUser.setLastName(data.lastName);
        theUser.setPassword(data.password);
        resolve(theUser);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end find user
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/49erslifters', {useUnifiedTopology: true, useNewUrlParser: true});
//
// var db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'connection error'));
//     db.once('open', function(){
// });
//
// var userSchema = new mongoose.Schema({
//     userID: String,
//     firstName: String,
//     lastName: String,
//     email: String,
//     username: String,
//     password: String
// });
//
// var users = mongoose.model('users', userSchema);
//
//
//  async function getUser(id){
//     let match;
//     try{
//         match = await users.findOne({userID: id});
//         return match;
//     }catch(err){
//         console.log(err);
//     }
// }
// module.exports.getUser = getUser;
