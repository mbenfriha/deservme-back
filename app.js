var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./model/user');
var Quizz = require('./model/quizz');
var Answer = require('./model/answer');


// Conenct to DB
mongoose.connect('mongodb://localhost/deservme');
var db = mongoose.connection;



// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,

}

app.use(cors(corsOptions));


// Express Session
app.use(session({
    secret: 'test',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

//create quizz
app.post('/quizz/create', function(req, res){
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    console.log(req.body)

    if(req.body.questions) {
        var newQuizz = new Quizz({
            user_id: req.user._id,
            username: req.user.username,
            answer: false,
            title: req.body.title,
            questions: req.body.questions,
            avatar: req.user.avatar,
            avatar_type: req.user.avatar_type
        })

        Quizz.createQuizz(newQuizz, function (err, quizz) {
            if (err) throw err;
            res.send(quizz).end()
        });
    }else{
        res.status(500).send("{errors: \"Questions is empty\"}").end()
    }
});

//get quizz by id
app.get('/quizz/:id', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Quizz.getQuizzById(req.params.id, function (err, quizz) {
        if (err) throw err;
        res.send(quizz).end()
    })
});


//get all quizz
app.get('/quizz', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Quizz.getAll(req.user._id,function (err, quizzs) {
        if (err) throw err;
        res.send(quizzs).end()
    })
});

app.get('/quizzs/:id', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Quizz.getMyQuizz(req.params.id, function (err, quizzs) {
        if (err) throw err;
        res.send(quizzs).end()
    })
});


//create answer
app.post('/answer/create/:quizz_id', function(req, res){
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    if(req.body.questions) {
        var newAnswer = new Answer({
            user_id: req.user._id,
            quizz_id: req.params.quizz_id,
            answer: true,
            questions: req.body.questions,
            username: req.user.username,
            avatar: req.user.avatar,
            avatar_type: req.user.avatar_type,
        })

        Answer.createAnswer(newAnswer, function (err, answer) {
            if (err){
                res.status(500).send(err).end();
            } else {
                Quizz.addAnswer(req.params.quizz_id, function(err, quizz){
                    if(err){
                        res.status(500).send(err).end();
                    } else {
                        res.send(answer).end();
                    }
                })
            }
        });
    }else{
        res.status(500).send("{errors: \"Answer is empty\"}").end()
    }
});

//get answer by id
app.get('/answer/:id', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Answer.getAnswerById(req.params.id, function (err, answer) {
        if (err) throw err;
        res.send(answer).end()
    })
});

//get all answers by quizz
app.get('/answers/:id', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Answer.getAnswerByQuizz(req.params.id, function (err, answer) {
        if (err) throw err;
        res.send(answer).end()
    })
});

//get answer by quizz_id and user_id
app.get('/answerUser/:quizz_id', function(req, res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
    Answer.getAnswerByUserId(req.user._id, req.params.quizz_id, function (err, answer) {
        if (err) {
            res.status(500).send(err).end();
        } else if(!answer) {
            res.status(404).send(err).end();
        } else {
            res.send(answer).end()
        }
    })
});

// Register User
app.post('/register', function(req, res){
    var password = req.body.password;
    var password2 = req.body.password2;

    if (password == password2){
        var newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        User.createUser(newUser, function(user, err) {
            if (err) {
                var error;
                if (err.name == 'ValidationError') {
                    for (field in err.errors) {
                        console.log(err.errors[field].message);
                    }
                    res.status(500).send(err.message).end();
                } else {
                    console.log(err);
                    res.status(500).send(err).end();
                }
            } else {
                res.send(user).end()
            }
        });
    } else{
        res.status(500).send("{errors: \"Passwords don't match\"}").end()
    }
});


var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({ email: username }, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

// Endpoint to login
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        res.send(req.user);
    }
);

// Endpoint to get current user
app.get('/user', function(req, res){
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
        res.send(req.user);
})


// Endpoint to logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('http://localhost:4200/');
});

app.post('/update', function(req, res){
    if(!req.user){
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    }
   // console.log(req.user);
    User.updateUser(req, function(err, user){
        if(err){
            res.status(500).send(err).end();
        } else {
            res.send(user).end();

        }
    })
});

app.get('/username/:username', function(req,res) {
    if(!req.user) {
        res.status(401).send("{errors: \"Vous n'êtes pas connecté\"}").end()
    } else {
        User.getUserByUsername(req.params.username, function (err, user) {
            if (err) {
                res.status(404).send(err).end();
            } else {
                if(!user) {
                    res.status(404).send(err).end();

                } else{
                    res.send(user).end();
                }

            }
        })
    }
});


var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
        clientID: "396653554338782",
        clientSecret: "b5dc33715e87b087be735a95aa9f5f29",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
            if (err) return done(err);
            if (user) return done(null, user);
            else {
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id;
                newUser.facebook.token = accessToken;
                newUser.facebook.name  = profile.displayName;
                newUser.avatar = profile.id;
                newUser.avatar_type = 'facebook';
                if (typeof profile.emails != 'undefined' && profile.emails.length > 0)
                    newUser.facebook.email = profile.emails[0].value;

                // save our user to the database
                newUser.save(function(err) {
                    if (err) throw err;
                    return done(null, newUser);
                });
            }
        });
    }
));

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log(req.user);
        res.redirect('http://localhost:4200/?id='+req.user.facebook.id);
    }
);


TwitterStrategy = require("passport-twitter").Strategy;
passport.use(new TwitterStrategy({
    consumerKey: "X4qBi8l1UYL67vyPXfs31arS1",
    consumerSecret: "043rfnI0XWmhMj5QEpP9sxjAwp60uf2WokmUa9oRSn78tj9BZg",
    callbackURL: "http://localhost:3000/auth/twitter/callback"
}, function(accessToken, refreshToken, profile, done) {
    return User.findOne({ 'twitter.id': profile.id }, function(err, user) {
        if (err) return done(err);
        if (user) return done(null, user);
        else {
            var newUser = new User;
            newUser.twitter.id = profile.id;
            newUser.twitter.name = profile.username;
            newUser.twitter.token = accessToken;
            newUser.avatar = profile.username;
            newUser.avatar_type = 'twitter';

            // save our user to the database
            newUser.save(function (err) {
                if (err) throw err;
                return done(null, newUser);
            });
        }
    });
}));


app.get('/auth/twitter',
    passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log(req.user);
        res.redirect('http://localhost:4200/?id='+req.user.twitter.id);
    }
);


app.listen(3000, () => console.log('App listening on port 3000!'))