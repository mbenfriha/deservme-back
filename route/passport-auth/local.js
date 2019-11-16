const passport = require('passport');
const download = require('image-downloader');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};

var User = require('../../model/user');


const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';


var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({ email: username }, function(err, user){
            if(err) {
                res.status(500).send(err).end();
            };
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) {
                    res.status(500).send(err).end();
                };
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }
));