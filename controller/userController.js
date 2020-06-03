const createError = require("http-errors");
const express = require("express");

const Connection = require("./../models/connection");
const ConnectionDB = require("./../utility/connectionDB");

const User = require("./../models/user");
const userDB = require("./../utility/userDB");
var bodyParser = require('body-parser');
const UserProfile = require("./../models/userProfile");
const userProfileDB = require("./../utility/userProfileDB");

const UserConnection = require("./../models/userConnection");

const router = express.Router();
const { check, validationResult } = require('express-validator');
let error = new Array(1);
var urlencodedParser = bodyParser.urlencoded({extended: false});
/* GET /connect/login  */
router.post("/login",urlencodedParser,[
// username must be an email
check('email').isEmail().normalizeEmail().withMessage('Must be an email!'),
// password must be at least 6 chars long
check('password').isLength({ min: 6 }).withMessage('Must be 6 character long')
], async function (req, res, next) {
  await intializeSessionVariable(req, res);
  //validate username and password
    let uname= req.body.email;
    let user = await userDB.getUser(uname);
    console.log(uname);
    let unameprof = user._emailAddress;
    console.log(unameprof);
    let pword= req.body.password;
    console.log(pword);
    let pwordprof = user._password;
    console.log(pwordprof);
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
       console.log(errors);
       res.render('login',{err:errors.mapped(), msg:""});
    }
    else if (!((uname ==unameprof) && (pword==pwordprof))) {
    var msg = '*Invalid password and username, Try Again!';
    res.render('login',{err:"",msg:msg});
  }else {

  let data = {
    userProfile: req.session.userProfile,
  };
  console.log("session initialized with user profile data ");
  console.log(data.userProfile._user);
  res.render("savedConnections_1", {
    theUser: data.userProfile._user,
    userConnections: data.userProfile._userConnections,
  });
}
});

/* mount middleware to check for session data */
router.use("/", function (req, res, next) {
  console.log("test connect/myConnections ");
  //checking if session is already created
  if (!req.session.theUser) {
    //session doesn't exit route to login
    res.render("login", {msg:"", err:""});
  } else {
    // session exists go to next in the call stack
    next();
  }

});

/* GET /connect/myconnections  */
router.get("/", function (req, res) {

  let data = {
    userProfile: req.session.userProfile,
  };
  res.render("savedConnections_1", {
    theUser: data.userProfile._user,
    userConnections: data.userProfile._userConnections,
  });
});

/* POST /connect/myconnections/login  */
router.post("/login", function (req, res, next) {
  console.log("in login");

  intializeSessionVariable(req, res);

  let data = {
    userProfile: req.session.userProfile,
  };
  console.log("session initialized");
  console.log(data);
  res.render("savedConnections_1", {
    theUser: data.userProfile.user,
    userConnections: data.userProfile.userConnections,
  });
});

/* POST /connect/myconnections  */
router.post("/rsvp", async function (req, res) {
  let code = req.body.connectionId;

  let rsvp = "";

  if (
    req.body.rsvp.toUpperCase() == "YES" ||
    req.body.rsvp.toUpperCase() == "NO" ||
    req.body.rsvp.toUpperCase() == "MAYBE"
  ) {
    rsvp = req.body.rsvp;
  }

  try {
    let userProfile = new UserProfile(
      req.session.userProfile._user,
      req.session.userProfile._userConnections
    );
    console.log("adding rsvp, profile before add");
    console.log('code'+code);
    console.log(userProfile);
    let connectionDB = new ConnectionDB();
    let connection = await connectionDB.getConnection(code);
    userProfile.addConnection(connection, rsvp);
    console.log("adding rsvp, profile after add");
    console.log(userProfile);

    req.session.userProfile = userProfile;
    res.render("savedConnections_1", {
      theUser: req.session.userProfile._user,
      userConnections: req.session.userProfile._userConnections,
    });
  } catch (e) {
    console.log(e);
    error.push(404);
    res.redirect("/connect/connections");
  }
});

/* POST /connect/delete  */
router.post("/delete", async function (req, res, next) {
  let code = req.body.connectionId;
  if (req.session.theUser) {
    try {
      let userProfile = new UserProfile(
        req.session.userProfile._user,
        req.session.userProfile._userConnections
      );
      let connection = await new ConnectionDB().getConnection(code);
      userProfile.removeConnection(connection);
      req.session.userProfile = userProfile;
      res.render("savedConnections_1", {
        theUser: req.session.userProfile._user,
        userConnections: req.session.userProfile._userConnections,
      });
    } catch (e) {
      error.push(404);
      res.redirect("/connect/connections");
    }
  } else {
    intializeSessionVariable(req, res);
  }
});

/* GET /connect/signout  */
router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.render("index", { title: "Home", theUser: undefined });
});

/* GET /connect/newConnection  */
router.get("/newConnection", function (req, res, next) {
  if (!req.session.theUser) {
    intializeSessionVariable(req, res);
  }
  res.render("newConnection", {
    title: "Home",
    theUser: req.session.userProfile._user,
    err:""
  });
});

/* GET /connect/myconnections/*  */
router.get("/*", function (req, res, next) {
  res.render("index", { title: "Home", theUser: req.session.theUser });
});

// initialzing session data
async function intializeSessionVariable(req, res) {
  //get username from request
  let username = req.body.email;
  //only two users are currently saved. If neither use a default
  if (username != "pbya@uncc.edu" && username != "jdeere@uncc.edu") {
    username = "pbya@uncc.edu";
  }

  //get user from database
  let user = await userDB.getUser(username);
  console.log(user);

  // get userprofile from databse
  userProfileConnections = await userProfileDB.selectUserConnections(
    user._email
  );

  // create UserProfile object
  let userProfile = new UserProfile();

  let userConnectionList = new Array();

  // create user connections for view (include connection details)
  if (userProfileConnections.length >= 1) {
    userConnectionList = await makeProfileConnectionsForView(
      userProfileConnections
    );
  }

  userProfile.setUser(user);
  userProfile.setUserConnections(userConnectionList);

  //creating session variable/property and storing a User in it
  req.session.theUser = user;

  // creating session variable/property and storing UserProfile object in it
  req.session.userProfile = userProfile;
}

async function makeProfileConnectionsForView(userConnections) {
  let userConnectionsArr = [];
  let theConnection;
  const connectionDB = new ConnectionDB();

  await asyncForEach(userConnections, async (element) => {
    try {
      theConnection = await connectionDB.getConnection(element.connection);
    } catch {
      console.log("error in fetching connection");
    }

    userConnection = new UserConnection(theConnection, element.rsvp);

    userConnectionsArr.push(userConnection);
  });
  return userConnectionsArr;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = router;


// const express = require('express');
// const ConnectionDB = require('./../utility/connectionDB');
// const userDB = require('./../utility/userDB');
// const UserProfileDB = require('./../utility/userProfileDB');
// const UserProfile = require('./../models/userProfile');
// const Connection = require('./../models/connection');
// const User = require('./../models/user');
// var bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({extended: false});
// const router = express.Router();
// let error = new Array(1);
// const { check, validationResult } = require('express-validator');
//
//
// router.post("/login",urlencodedParser,[
//   // username must be an email
//    check('username').isEmail().normalizeEmail().withMessage('Must be an email!'),
//    // password must be at least 6 chars long
//    check('password').isLength({ min: 6 }).withMessage('Must be 6 character long')
//  ], async function(req, res, next){
//   initializeSessionVariable(req, res);
//   let user = await userDB.getUser('1');
//
//   let uname= req.body.username;
//   console.log(uname);
//   //proof username
//   let unameprof = user.username;
//   console.log(unameprof);
//   let pword= req.body.password;
//   console.log(pword);
//   //proof password
//   let pwordprof = user.password;
//   console.log(pwordprof);
//    const errors = validationResult(req);
//    if (!errors.isEmpty()) {
//      console.log(errors);
//      res.render('login',{err:errors.mapped(), msg:""});
//   }
//   else if (!((uname ==unameprof) && (pword==pwordprof))) {
//   var msg = '*Incorrect password and username, Try Again!';
//   res.render('login',{err:"",msg:msg});
// }else {
//   let us = await UserProfileDB.getUserProfile('1');
//   // let usercon = await ConnectionDB.getConnection(userProfileDB.getUserProfile('1').connectionID);;
//   console.log('usercon'+ us);
//   req.session.theUser = user;
//   let data = {
//     // user: req.session.theUser;
//     userProfile: req.session.userProfile,
//   };
//   console.log("session initialized with user profile data");
//   console.log(req.session.userProfile._user);
//
//   try {
//     let userProfile = new UserProfile(
//       req.session.userProfile._user,
//       req.session.userProfile._userConnections
//     );
//     console.log("adding rsvp, profile before add");
//     console.log(userProfile);
//     let us = await UserProfileDB.getUserProfile('1');
//     // let usercon = await ConnectionDB.getConnection(userProfileDB.getUserProfile('1').connectionID);
//     //hardcoding user connection since userProfileDB keeps returning null
//     console.log(us);
//     let connection2 = await ConnectionDB.getConnection('3');
//     userProfile.addConnection(connection2, 'Maybe');
//   }
//   catch (e) {
//     console.log(e);
//     error.push(404);
//     res.redirect("/connect/connections");
//   }
//   res.render("savedConnections_1", {
//     theUser: req.session.userProfile._user,
//     userConnections: data.userProfile._userConnections,
//   });
// }
//
//
// });
//
//
// router.use("/", function(req, res, next){
//   console.log("test connect/myConnections");
//
//   if(!req.session.theUser){
//     res.render("login",{err:"",msg:""});
//   }else{
//
//     next();
//   }
// });
//
//
// router.post("/rsvp",urlencodedParser, async function(req, res){
//   let code = req.body.connectionId;
//
//  let rsvp = "";
//
//  if (
//    req.body.rsvp.toUpperCase() == "YES" ||
//    req.body.rsvp.toUpperCase() == "NO" ||
//    req.body.rsvp.toUpperCase() == "MAYBE"
//  ) {
//    rsvp = req.body.rsvp;
//  }
//
//   try {
//     let userProfile = new UserProfile(
//       req.session.userProfile._user,
//       req.session.userProfile._userConnections
//     );
//     console.log("adding rsvp, profile before add");
//     console.log(userProfile);
//     let us = await UserProfileDB.getUserProfile('1');
//     // let usercon = await ConnectionDB.getConnection(userProfileDB.getUserProfile('1').connectionID);;
//     console.log(us);
//     let connection = await ConnectionDB.getConnection(code);
//     if(req.session.userProfile._userConnections){
//     userProfile.addConnection(connection, rsvp);
//   }else{
//       userProfile.updateConnection(connection, rsvp);
//   }
//     console.log("adding rsvp, profile after add");
//     console.log(connection);
//     req.session.userProfile = userProfile;
//     console.log(userProfile);
//     res.render("savedConnections_1", {
//       theUser: req.session.userProfile._user,
//       userConnections: req.session.userProfile._userConnections
//     });
//   } catch (e) {
//     console.log(e);
//     error.push(404);
//     res.redirect("/connect/connections");
//   }
// });
//
//
//
//
// router.post("/delete",urlencodedParser, async function(req, res, next){
//   let code = req.body.connectionId;
//   if (req.session.theUser) {
//     // try {
//       let userProfile = new UserProfile(
//         req.session.userProfile._user,
//         req.session.userProfile._userConnections
//       );
//       let connection = await ConnectionDB.getConnection(code);
//       userProfile.removeConnection(connection);
//       req.session.userProfile = userProfile;
//       res.render("savedConnections_1", {
//         theUser: req.session.userProfile._user,
//         userConnections: req.session.userProfile._userConnections,
//       });
//     // } catch (e) {
//     //   error.push(404);
//     //   res.redirect("/connections");
//     // }
//   }else{
//     initializeSessionVariable(req, res);
//   }
// });
// async function initializeSessionVariable(req, res){
//   let user = await userDB.getUser('1');
//   req.session.theUser = user;
//   req.session.userProfile = new UserProfile(user,[]);
// }
//
//
// router.get('/', async function (req, res) {
//   res.render("savedConnections_1", {
//     theUser: req.session.userProfile._user,
//     userConnections: req.session.userProfile._userConnections
//   });
// });
//
// router.get('/logout', function (req, res) {
//   console.log("logging out user");
//   req.session.destroy();
//   res.redirect('/');
// });
// router.get('/newConnection', function (req, res) {
//   res.render('newConnection',{theUser: req.session.theUser, data: new Connection(), err:""});
// });
// router.post('/new',urlencodedParser,[
//   //check for errors
//   check('connectionTopic').not().isEmpty().withMessage('Topic name must be specified').trim().isLength({ min: 5 }).withMessage('Must be at least 5 chars long'),
//   check('connectionName').not().isEmpty().withMessage('Event name must be specified').trim().isLength({ min: 5 }).withMessage('Must be at least 5 chars long'),
//   check('details').not().isEmpty().withMessage('Add NA if details not available').trim().isLength({ min: 2, max:200 }).withMessage('Must be at least 2 chars long and less than 200'),
//   check('location').not().isEmpty().withMessage('Add NA if location not available').trim().isLength({ min: 2 }).withMessage('Must be at least 2 chars long'),
//   check('date').not().isEmpty().withMessage('Date must be specified').toDate().isAfter().withMessage('Event must be held after today, please change the date'),
//   check('startTime').not().isEmpty().withMessage('Time must be specified'),check('endTime').not().isEmpty().withMessage('Time must be specified')
// ], async function (req,res){
//   var errors = validationResult(req);
//   if(!errors.isEmpty()){
//     res.render('newConnection',{data: new Connection(),theUser:req.session.theUser, err:errors.mapped()});
//   }else{
//   var num = await ConnectionDB.getConnections();
//   var id = num.length+1;
//     var newConnection = new Connection({
//       connectionId: id,
//       connectionName: req.body.connectionName,
//       connectionTopic: req.body.connectionTopic,
//       date: req.body.date,
//       details: req.body.details,
//       startTime: req.body.startTime,
//       endTime: req.body.endTime,
//       location: req.body.location
// 		});
//     console.log("post new");
// 		UserProfileDB.addConnection(newConnection);
// 		res.render('connection', {
// 			data: newConnection,
// 			theUser: req.session.theUser,
// 		});
//   }
//
// });
// module.exports = router;
