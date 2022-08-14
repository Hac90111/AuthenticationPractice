//jshint esversion:6
require('dotenv').config()   // env variable to hide secret keys and private data(create .env file in root)
const express= require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');   // for hashing the password  

const app= express();
//console.log(process.env.SECRET); to access the key

app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// adding mongooose.Schema to add encrypt functionality (read mongoose encryption docs)

const userSchema= new mongoose.Schema({
    email: String,
    password: String
});



const User= new mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("home");
});

// login route get and post request

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const username= req.body.username;
    const password= md5(req.body.password);   // md5 to match the hashed password
    
    //Find the user with matching credentials

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    })

});


// register route post(creating a user) and get requests

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser= new User({
        email: req.body.username,
        password:md5(req.body.password)      // md5(message) to hash the 'message'
    });

    newUser.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.render("secrets");
        }
    })
});







app.listen(3000, function(){
    console.log("Server started on port 3000");
});