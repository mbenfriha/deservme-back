const passport = require('passport');
const download = require('image-downloader');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};

var User = require('../../model/user');


const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';

InstagramStrategy = require("passport-instagram").Strategy;
passport.use(new InstagramStrategy({
        clientID: "39c17946070a479abe4be0b18572cc09",
        clientSecret: "a30e8470ac8347cc9e4995d04b43fda5",
        callbackURL: urlBack+"auth/instagram/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        return  User.findOne({'instagram.id': profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.instagram.id = profile.id;
                newUser.instagram.token = accessToken;
                newUser.instagram.name = profile.username;
                newUser.avatar = profile.username;
                newUser.avatar_type = 'instagram';

                // save our user to the database
                newUser.save(function (err, user) {
                    if (err) throw err;
                    // Download to a directory and save with an another filename
                    options = {
                        url: profile._json.data.profile_picture,
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
    res.cookie('jwt', token);
    if(req.session.redirectTo) {
        res.redirect(urlFront + req.session.redirectTo + '?id=' + req.user.instagram.id);
    } else {
        res.redirect(urlFront + '?id=' + req.user.instagram.id);
    }
};
