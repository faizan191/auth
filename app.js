//jshint esversion:6

require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser')
const app = express();
const mongoose = require('mongoose');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'thisisnotagoodsecret',
    resave: false,
    saveUninitialized: false,
    
}))

//initilize passport
app.use(passport.initialize() );
//use passport to use our session
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser: true});
// mongoose.set('useCreateIndex',true)

const userSchema = mongoose.Schema({
    email: String,
    password: String
})

//Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.get('/', (req, res) => {
    res.render('home')
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.get('/secrets', (req, res) => {
    //if the user already logged in 
    if(req.isAuthenticated()){
        res.render('secrets')
    }else{
        res.redirect('/login')
    }
}); 

app.get('/register', (req, res) => {
    res.render('register')
});

app.post('/register',async (req, res) => {
    //this method comes from passport-local-mongoose
    User.register({username:req.body.username}, req.body.password, function(err,user) {
        if(err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets')
            });
        }
    });

});


app.post('/login',  (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    //a method from passport
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets')
            });
        }
    })

});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});


app.listen(5000, () => {
    console.log(`Server started on 5000`);
});