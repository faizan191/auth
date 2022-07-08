//jshint esversion:6

require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser')
const app = express();
const mongoose = require('mongoose');
const md5 = require('md5');

mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser: true});

const userSchema = mongoose.Schema({
    email: String,
    password: String
})

const User = mongoose.model('User',userSchema);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register',async (req, res) => {
    const {username,password} = req.body;
     const newUser =  new User({
        email:username,
        //using hash function
        password:md5(password)
     })
     await newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render('secrets');
        }
     });
});


app.post('/login',  (req, res) => {
    const {username} = req.body;
    console.log(req.body.password)
    const password = md5(req.body.password)
    console.log(username,password);
    User.findOne({email:username}, function(err,foundUser) {
        if(err){
            console.log(err);
            return res.send('Error')
        }else if(foundUser){

            console.log(foundUser);
            console.log(foundUser.password);
            if(foundUser.password == password);
            res.render('secrets');
        }else{
                res.send('Error occoured')
            }
    })
});



app.listen(5000, () => {
    console.log(`Server started on 5000`);
});