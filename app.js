var express = require('express');
var path = require('path');
const app = express();
var router = express.Router();
var connectionController = require('./controller/connectionController');
var userController = require('./controller/userController');
var mainController = require('./controller/mainController');
const session = require('express-session');
const createError = require("http-errors");
const debug = require("debug")("connections:server");
const http = require("http");

app.set("views", path.join(__dirname, "view"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "assets")));
app.use('/assets', express.static('assets'));
app.use(session({
        name: 'user', // The name of the cookie
        secret: '1234', // The secret is required, and is used for signing cookies
        resave: false, // Force save of session for each request.
        saveUninitialized: true
}));
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/49erslifters', {useNewUrlParser: true, useUnifiedTopology: true});

app.use('/', mainController);
app.use('/connect', mainController);
app.use('/connect/myconnections',userController);
app.use("/connect/addconnection", connectionController);
app.use('/connect',connectionController);

app.listen(8088);

module.exports = app;
