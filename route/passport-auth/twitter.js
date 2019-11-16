const passport = require('passport');
const download = require('image-downloader');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};

var User = require('../../model/user');


const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';

TwitterStrategy = require("passport-twitter").Strategy;
passport.use(new TwitterStrategy({
        consumerKey: "X4qBi8l1UYL67vyPXfs31arS1",
        consumerSecret: "043rfnI0XWmhMj5QEpP9sxjAwp60uf2WokmUa9oRSn78tj9BZg",
        callbackURL: urlBack+"auth/twitter/callback"
    }, function(accessToken, refreshToken, profile, done) {
        return User.findOne({'twitter.id': profile.id}, function (err, user) {
            if (user) {
                return done(null, user);
            } else {
                var newUser = new User;
                newUser.twitter.id = profile.id;
                newUser.twitter.name = profile.username;
                newUser.twitter.token = accessToken;
                newUser.avatar = profile.username;
                newUser.avatar_type = 'twitter';

                // save our user to the database
                newUser.save(function (err, user) {
                    if (err) throw err;
                    options = {
                        url: profile._json.profile_image_url,
                        dest: __dirname + '/../../uploads/profile/' + user._id + '.jpg'
                    };
                    download.image(options)
                        .then(({filename, image}) => {
                        })
                        .catch((err) => console.error(err));
                    return done(null, newUser);
                });
            }
        });
    })
);

module.exports.auth = function(req, res) {
    let token = jwt.sign({
        data: req.user
    }, config.secretOrKey, { expiresIn: '24h' }); // expiry in seconds
    res.cookie('jwt', token, { domain: urlFront, path: '/', expires: new Date(Date.now() + 9000000), httpOnly: false });
    if(req.session.redirectTo) {
        res.redirect(urlFront + req.session.redirectTo );
    } else {
        res.redirect(urlFront );
    }
};
