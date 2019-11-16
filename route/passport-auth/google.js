const passport = require('passport');
const download = require('image-downloader');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};

var User = require('../../model/user');


const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';

GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
        clientID: "885652029797-j6lvuba4fb6cv8nciaqdb20q20ouc8ik.apps.googleusercontent.com",
        clientSecret: "m-MO7TzxO1Z-MNCs5zU0fjQT",
        callbackURL: urlBack+"auth/google/callback",
        scope: 'profile'
    },
    function(accessToken, refreshToken, profile, done) {
        return  User.findOne({'google.id': profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.google.id = profile.id;
                newUser.google.token = accessToken;
                newUser.google.name = profile.displayName;
                newUser.avatar = profile.username;
                newUser.avatar_type = 'google';

                // save our user to the database
                newUser.save(function (err, user) {
                    if (err) throw err;
                    // Download to a directory and save with an another filename
                    options = {
                        url: profile.photos[0].value,
                        dest: __dirname + '/../../uploads/profile/' + user._id + '.jpg'
                    };
                    download.image(options)
                        .then(({filename, image}) => {
                        })
                        .catch((err) => console.error(err));
                    return done(null, newUser);
                });
            }
        })
    }
));


module.exports.auth = function(req, res) {
    let token = jwt.sign({
        data: req.user
    }, config.secretOrKey, { expiresIn: '24h' }); // expiry in seconds
    res.cookie('jwt', token, {domain:'.myquizzy.com'});

    if(req.session.redirectTo) {
        res.redirect(urlFront + req.session.redirectTo);
    }
    else {
        res.redirect(urlFront);
    }
};
