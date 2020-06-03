/**
 * Module dependencies.
 */

const express = require("express");
const Connection = require("./../models/connection");
const ConnectionDB = require("./../utility/connectionDB");
const UserConnection = require("./../models/userConnection");
const UserProfile = require("../models/userProfile");
const router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
let error = new Array(1);
const { check, validationResult } = require('express-validator');
/* route handler for main connections page.
 * and handles query string for connection
 * ALL HTTP methods (GET/POST/...) /cciconnect/connections
 */
router.all("/connections", async function (req, res, next) {
  let connectionId = req.query.connectionId;
  console.log("testing");
  // validate data
  if (validateConnectionId(connectionId)) {
    try {
      console.log("valid id");

      const connectionDB = new ConnectionDB();

      // getting specific connection data object
      let connection = await connectionDB.getConnection(connectionId);
      //checking for scripting
      var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/); //unacceptable chars
      var res = pattern.test(connection._detail);
      if(res){
        alert("attacked");
      }
      let data = {
        connection: connection,
      };

      res.render("connection", { data: data });
    } catch (e) {
      error.push(404);
      res.redirect("connections");
    }
  } else {
    next();
  }
});


/* route handler for a connection page with param
 * ALL HTTP methods (GET/POST/...) /cciconnect/connection
 */
router.all("/connection/:connectionId", async function (req, res, next) {
  let connectionId = req.params.connectionId;
  let connection;

  // validate data
  if (validateConnectionId(connectionId)) {
    try {
      let connectionDB = new ConnectionDB();
      // getting specific connection data object from DB
      connection = await connectionDB.getConnection(connectionId);

      let data = {
        connection: connection,
        theUser: req.session.theUser,
      };

      res.render("connection", { data: data, theUser: data.theUser });
    } catch (e) {
      error.push(404);
      res.redirect("/connect/connections");
    }
  } else {
    error.push(400);
    res.redirect("/connect/connections");
  }
});

router.post("/new",urlencodedParser,[
    //check for errors
    check('topic').not().isEmpty().withMessage('Topic name must be specified').trim().isLength({ min: 5 }).withMessage('Must be at least 5 chars long').matches(/^[a-z0-9 ]+$/i)
      .withMessage("must only contain letters, numbers and spaces"),
    check('title').not().isEmpty().withMessage('Event name must be specified').trim().isLength({ min: 5 }).withMessage('Must be at least 5 chars long').matches(/^[a-z0-9 ]+$/i)
      .withMessage("must only contain letters, numbers and spaces"),
    check('detail').not().isEmpty().withMessage('Add NA if details not available').trim().isLength({ min: 2, max:200 }).withMessage('Must be at least 2 chars long and less than 200').matches(/^[a-z0-9 ]+$/i)
      .withMessage("must only contain letters, numbers and spaces"),
    check('where').not().isEmpty().withMessage('Add NA if location not available').trim().isLength({ min: 2 }).withMessage('Must be at least 2 chars long').matches(/^[a-z0-9 ]+$/i)
      .withMessage("must only contain letters, numbers and spaces"),
    check('when').not().isEmpty().withMessage('Date must be specified').toDate().isAfter().withMessage('Event must be held after today, please change the date'),
    check('start').not().isEmpty().withMessage('Time must be specified'),check('end').not().isEmpty().withMessage('Time must be specified')
]
 ,async function (req, res) {
     var errors = validationResult(req);
     console.log('errors'+errors)
     if(!errors.isEmpty()){
       res.render('newConnection',{theUser:req.session.theUser.User, err:errors.mapped()});
     }else {
  console.log("new connection");
  if (req.session.theUser) {
    let topic = req.body.topic;
    let title = req.body.title;
    let details = req.body.detail;
    let location = req.body.where;
    let date = req.body.when;
    let start = req.body.start;
    let end = req.body.end;
    console.log(topic);
    console.log(title);
    console.log(details);
    console.log(location);
    console.log(date);
    console.log(start);
    console.log(end);

    let userName =
      req.session.theUser._firstName + " " + req.session.theUser.lastName;

    let connectionDB = new ConnectionDB();
    let create = await connectionDB.createConnection(
      topic,
      title,
      details,
      location,
      date,
      start,
      end,
      userName,
      "sports.jpg"
    );

    console.log("new connection created");
    console.log(create);

    /////
    let userProfile = new UserProfile(
      req.session.userProfile._user,
      req.session.userProfile._userConnections
    );
    console.log("adding rsvp, profile before add");
    console.log(userProfile);
    let connection = await connectionDB.getConnection(create._connectionId);
    userProfile.addConnection(connection, "Yes");
    console.log("adding rsvp, profile after add");
    console.log(userProfile);

    req.session.userProfile = userProfile;
    res.render("savedConnections_1", {
      theUser: req.session.userProfile._user,
      userConnections: req.session.userProfile._userConnections,
    });
  }
}
});

// default for this controller is the connections view
router.all("/*", async function (req, res) {
  console.log("no valid connection id with request");
  let status = null;
  // get the topics from ConnectionDb
  const connectionDB = new ConnectionDB();
  let topics = await connectionDB.getTopics();

  // getting all connections from db and creating Connection data object and pushing to array.
  let connections = await connectionDB.getConnections();

  console.log("Topics and connections from DB");
  console.log(connections);
  console.log(topics);

  let data = {
    topics: topics,
    connections: connections,
    status: status,
  };

  // check of user in session to customize header
  if (req.session.theUser) {
    res.render("connections", {
      data: data,
      theUser: req.session.theUser,
    });
  } else {
    // no user session exists
    res.render("connections", { data: data });
  }
});

function validateConnectionId(connectionId) {
  if (connectionId !== undefined) {
    if (Number.isInteger(Number.parseInt(connectionId))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

module.exports = router;
// var express = require('express');
// var Connection = require('../models/connection');
// var userConnection = require('../models/userConnection');
// var profile = require('../models/UserProfile');
// var router = express.Router();
// const session = require('express-session');
// var ConnectionDB = require('../utility/connectionDB');
// var bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({extended: false});
//
// // router.get('/', function(req, res, next) {
// //   res.render('index',{theUser: req.session.theUser});
// // });
// //
// // router.get('/connections', function (req, res) {
// //     var connectionDB = require('./../utility/connectionDB');
// //     res.render('connections', {data:connectionDB,theUser: req.session.theUser});
// // });
// // // router.get('/savedConnections', function (req, res) {
// // //   req.session.userProfile = userConnection;
// // //     res.render('savedConnections', { theuser: req.session.user});
// // // });
// //
// // router.get('/connection', function(req, res) {
// //   var connectionDB = require('./../utility/connectionDB');
// //   var connection = (connectionDB.getConnection(req.query.id));
// //   res.render('connection', {data:connection, qs:req.query,theUser: req.session.theUser});
// // });
// router.get('/newConnection', function (req, res) {
//   res.render('newConnection',{theUser: req.session.theUser});
// });
// // router.get('/about', function (req, res) {
// //   res.render('about',{theUser: req.session.theUser});
// // });
// // router.get('/contact', function (req, res) {
// //   res.render('contact',{theUser: req.session.theUser});
// // });
// //
// // module.exports = router;
// let error = new Array(1);
// router.all('/connections', async function(req, res){
//     let connectionsList = await ConnectionDB.getConnections();
//     var topicsList = [];
//     for(var i = 0; i < connectionsList.length; i++){
//         if(!(topicsList.includes(connectionsList[i].connectionTopic))){
//             topicsList.push(connectionsList[i].connectionTopic);
//         }
//     }
//     console.log(connectionsList);
//     console.log(topicsList);
//     res.render('connections', {data:connectionsList, theUser: req.session.theUser, topics: topicsList});
// });
// router.all("/connection/:connectionId", async function(req, res, next){
//   let connection = await ConnectionDB.getConnection(req.params.connectionId);
//   console.log("in connection route");
//   console.log(connection);
//   if(req.session.theUser){
//     res.render("connection", {
//       data: connection,
//       theUser: req.session.theUser
//     });
//   }else{
//     res.render("connection", {data: connection});
//   }
// });
//
// router.all("/*", async function(req, res, next){
//   console.log("no valid connection id with request");
//   let status = null;
//
//   let connectionsList = await ConnectionDB.getConnections();
//   var topicsList = [];
//   for(var i = 0; i < connectionsList.length; i++){
//       if(!(topicsList.includes(connectionsList[i].connectionTopic))){
//           topicsList.push(connectionsList[i].connectionTopic);
//       }
//   }
//   console.log("Topics and connections from DB");
//   console.log(connectionsList);
//
//   if (req.session.theUser){
//     res.render("connections", {
//       data: connectionsList,
//       theUser: req.session.theUser,
//       topics:topicsList
//     });
//   }else{
//     res.render("connections", {data: connectionsList, topics: topicsList});
//   }
// });
//
// function validatedConnectionId(connectionId){
//   if(connectionId !== undefined){
//     if(Number.isInteger(Number.parseInt(connectionId))){
//       return true;
//     }else{
//       return false;
//     }
//   }else{
//     return false;
//   }
// }
//
// module.exports = router;
