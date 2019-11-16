const passport = require('passport');
const download = require('image-downloader');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};

var User = require('../../model/user');


const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';

var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
        clientID: "396653554338782",
        clientSecret: "b5dc33715e87b087be735a95aa9f5f29",
        callbackURL: urlBack+"auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
        return User.findOne({'facebook.id': profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.name = profile.displayName;
                newUser.avatar = profile.id;
                newUser.avatar_type = 'facebook';

                // save our user to the database
                newUser.save(function (err, user) {
                    if (err) throw err;
                    options = {
                        url: profile._json.picture.data.url,
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
        res.redirect(urlFront + req.session.redirectTo + '?id=' + req.user.google.id);
    }
    else {
        res.redirect(urlFront + '?id=' + req.user.google.id);
    }
};
