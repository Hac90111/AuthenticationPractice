//jshint esversion:6
require('dotenv').config()   // env variable to hide secret keys and private data(create .env file in root)
const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

// require for passport, session and passport-local-mongoose
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// adding(initializing) session, refer to the docs,  npmjs.org(search express-session)

app.use(session({
    secret: "Our long secret",
    resave: false,
    saveUninitialized: false
}));

// initializing passportJs function (checkout Passportjs.org config section to learn more)
app.use(passport.initialize());
app.use(passport.session());


// mongoose connection and Schema

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// to hash and salt password, save it to database

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());  // to put the data into cookie
passport.deserializeUser(User.deserializeUser()); // to break the cookie and reveal the data



app.get("/", function (req, res) {
    res.render("home");
});

// login route get and post request

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // passport docs for login
    req.logIn(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });


});


// register route get and post requests

app.get("/register", function (req, res) {
    res.render("register");
});


// secrets route if authenticated, this will work without relogging in again, because of cookies, because I am already authenticated
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});


// logout route with deauthentication

app.get("/logout", function(req, res){
    req.logOut(function(err){
        if (err) {
            return next(err);
        }else{
            res.redirect("/")
        }
    });    // logout must have a callback function
});


app.post("/register", function (req, res) {

    // refer to the passport doc

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })

        }
    })

});



app.listen(3000, function () {
    console.log("Server started on port 3000");
});