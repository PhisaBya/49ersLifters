const Connection = require("../models/connection");

var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var connectionSchema = new mongoose.Schema({
  connectionId: { type: Number, default: "0000" },
  name: { type: String, default: "connectionName" },
  details: { type: String, default: "connectionDetails" },
  topic: { type: String, default: "connectionTopic" },
  startTime: { type: String, default: "startTime" },
  endTime: { type: String, default: "endTime" },
  location: { type: String, default: "location" },
  host: { type: String, default: "host" },
  date: { type: String, default: "date" },
  image: { type: String, default: "date" },
  status: { type: String, default: "active" },
  user: { type: String, default: "no user" },
});
dbModel = mongoose.model("Connection", connectionSchema, "Connections");

class ConnectionDB {
  constructor() {}

  getConnections() {
    return new Promise((resolve, reject) => {
      dbModel
        .find({})
        .then((data) => {
          console.log("in getConnections Db");
          console.log(data);
          let connections = [];
          data.forEach((connection) => {
            console.log("inside for each " + connection);
            let connectionObj = new Connection();

            connectionObj.setConnectionId(connection.connectionId);
            connectionObj.setConnectionName(connection.name);
            connectionObj.setConnectionTopic(connection.topic);
            connectionObj.setDetail(connection.details);
            connectionObj.setLocation(connection.location);
            connectionObj.setHost(connection.host);
            connectionObj.setDate(connection.date);
            connectionObj.setStartTime(connection.startTime);
            connectionObj.setEndTime(connection.endTime);
            connectionObj.setImage(connection.image);
            connections.push(connectionObj);
          });
          console.log("done");

          return resolve(connections);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  } //end findAll by category

  getConnectionsByTopic(topic) {
    return new Promise((resolve, reject) => {
      dbModel
        .find({
          connectionTopic: topic,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  } //end findAll by category

  getConnection(connectionId) {
    return new Promise((resolve, reject) => {
      console.log("in itemDb " + connectionId);
      dbModel
        .findOne({
          connectionId: connectionId,
        })
        .select("-_id")
        .exec()
        .then((data) => {
          let connectionObj = new Connection();

          connectionObj.setConnectionId(data.connectionId);
          connectionObj.setConnectionName(data.name);
          connectionObj.setConnectionTopic(data.topic);
          connectionObj.setDetail(data.details);
          connectionObj.setLocation(data.location);
          connectionObj.setHost(data.host);
          connectionObj.setDate(data.date);
          connectionObj.setStartTime(data.startTime);
          connectionObj.setEndTime(data.endTime);
          connectionObj.setImage(data.image);
          resolve(connectionObj);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  } //end find connection

  getTopics() {
    return new Promise((resolve, reject) => {
      dbModel
        .find()
        .distinct("topic")
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  createConnection(
    topic,
    title,
    details,
    location,
    date,
    start,
    end,
    email,
    image
  ) {
    return new Promise((resolve, reject) => {
      dbModel
        .findOne()
        .sort("-connectionId") // give me the max
        .exec(function (err, member) {
          let connection = new dbModel({
            connectionId: member.connectionId + 1,
            name: title,
            details: details,
            topic: topic,
            startTime: start,
            endTime: end,
            location: location,
            host: email,
            date: date,
            image: image,
          });

          connection.save().then((data) => {
            let connectionObj = new Connection();

            connectionObj.setConnectionId(data.connectionId);
            connectionObj.setConnectionName(data.name);
            connectionObj.setConnectionTopic(data.topic);
            connectionObj.setDetail(data.details);
            connectionObj.setLocation(data.location);
            connectionObj.setHost(data.host);
            connectionObj.setDate(data.date);
            connectionObj.setStartTime(data.startTime);
            connectionObj.setEndTime(data.endTime);
            connectionObj.setImage(data.image);
            resolve(connectionObj);
          });
        });
    });
  }
}
module.exports = ConnectionDB;


// var Connection = require('./../models/connection.js');
// var UserConnection = require('./../models/userConnection.js');
// // var mongoose = require('mongoose');
// // mongoose.connect('mongodb://localhost/49erslifters', { useNewUrlParser: true,  useUnifiedTopology: true });
// // var Schema = mongoose.Schema;
// //
// // var db = mongoose.connection;
// //     db.on('error', console.error.bind(console, 'connection error'));
// //     db.once('open', function(){
// // });
// // var connectionSchema = new mongoose.Schema({
// //     connectionId: String,
// //     connectionName: String,
// //     connectionTopic: String,
// //     details: String,
// //     date: String,
// //     startTime: String,
// //     endTime: String,
// //     location: String
// // });
// //
// // var connection = mongoose.model('connection',connectionSchema);
// // const connectionDB = require('./../models/connection');
// // const c1 = new connectionDB('1', '49ers Lifters - Chest & Triceps & Shoulders','Upper Body', 'I really need to increase my bench', 'Monday, February 24, 2020','5:00pm','6:00pm','UREC');
// // const c2 = new connectionDB('2', '49ers Lifters - Back & Biceps','Upper Body', 'I really need to increase my bench', 'Tuesday, February 25, 2020','5:00pm','6:00pm','UREC');
// // const c3 = new connectionDB('3', '49ers Lifters - Abs','Upper Body', 'I really need a shredded body', 'Wednesday, February 26, 2020','5:00pm','6:00pm','UREC');
// // const c4 = new connectionDB('4', '49ers Lifters - Hamstrings','Lower Body', 'I really need to increase my squat', 'Thursday, February 27, 2020','5:00pm','6:00pm','UREC');
// // const c5 = new connectionDB('5', '49ers Lifters - Quadriceps','Lower Body', 'I really need to increase my squat', 'Tuesday, February 25, 2020','5:00pm','6:00pm','UREC');
// // const c6 = new connectionDB('6', '49ers Lifters - Calves','Lower Body', 'I really need to increase my squat', 'Tuesday, February 25, 2020','6:00pm','7:30pm','UREC');
// //
// // const connections = [ c1, c2,c3,c4,c5,c6];
// // const topics = ['Upper Body', 'Lower Body'];
//

// var connectionSchema = new mongoose.Schema({
//   connectionId: String,
//   connectionName: String,
//   connectionTopic: String,
//   details: String,
//   date: String,
//   startTime: String,
//   endTime: String,
//   location: String
// });
//
// var Connection = mongoose.model('connections', connectionSchema);
//
//
//  async function getConnections(){
//    try{
//  	   let list = await Connection.find();
//  	   return list;
//   }catch(err){
//       console.log(err);
//   }
//
// };
//
// async function getConnection(id){
//       try{
//       let match = await Connection.findOne({connectionId: id});
//       return match;
//     }
//     catch(err){
//         console.log(err);
//     }
//
//   };
//
//
//   module.exports.getConnections = getConnections;
//   module.exports.getConnection = getConnection;
