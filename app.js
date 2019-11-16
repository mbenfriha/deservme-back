if (process.env.NODE_ENV == 'production') {
    require('dotenv').config();
}
const express  = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const download = require('image-downloader');
const url = require('url');
const jwt = require('jsonwebtoken');
const config = {secretOrKey:"-=&s%j6m@4m-kAt$PFwaC4Vt2WXE@-8_xe", jwt:'V?EqJ*geF?cYm^%5A=GkzwP&M#!PhEb4UN'};


const port     = process.env.PORT || 3000;
const urlFront = process.env.FRONT || 'http://localhost:4300';
const urlBack = process.env.BACK || 'http://localhost:3000/';
const urlAdmin = process.env.ADMIN || 'http://localhost:4200';

const Quizz = require('./route/quizz');
const Answer = require('./route/answer');
const User = require('./route/user');
const Admin = require('./route/admin');

const UserModel = require('./model/user');


const PassportTwitter = require('./route/passport-auth/twitter');
const PassportFacebook = require('./route/passport-auth/facebook');
const PassportGoogle = require('./route/passport-auth/google');
const PassportInstagram = require('./route/passport-auth/instagram');


// Get previous url before login
const storeRedirectToInSession = (req, res, next) => {
    let url_parts = url.parse(req.get("referer"));
    var redirectTo = url_parts.pathname;
    req.session.redirectTo = redirectTo;
    next();
};


// connect to DB
mongoose.connect('mongodb://localhost/deservme');
var db = mongoose.connection;

var app = express();

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var whitelist = [urlFront, urlAdmin];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else if(!origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS', origin))
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// Express Session
app.use(session({
    secret: 'mu8rE*YY~J|bS36k72K>9{xjX*nGh$32MµT@8€3r',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge : 24 * 60 * 60 * 1000 }
}));
app.use(session({
    secret: 'mu8rE*YY~J|bS36k72K>9{xjX*nGh$32MµT@8€3r',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge : 24 * 60 * 60 * 1000}
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

function CheckUser(profil) {
    User.findOne({
        $or: [
            {'google.id': profil.id},
            {'facebook.id': profil.id},
            {'twitter.id': profil.id},
            {'instagram.id': profil.id},
        ]
    }, function (err, user) {
        if (user) return user;
        else {
            return false;
        }
    });
}


/*
 *
 *  ROUTE FOR QUIZZ
 *
 */

//create quizz
app.post('/quizz/create', passport.authenticate('jwt', { session: false }), Quizz.create);

//get quizz by id
app.get('/quizz/:id', Quizz.getSingle);

//get all quizz
app.get('/quizz', passport.authenticate('jwt', { session: false }), Quizz.getAll);

//get all quizz of user
app.get('/quizz/user/:id', Quizz.getAllByUser);

//create report for quizz
app.get('/quizz/report/:quizz_id', Quizz.report);

//change state of quizz
app.get('/quizz/change/:id', passport.authenticate('jwt', { session: false }), Quizz.changeState);

//change close of quizz
app.get('/quizz/close/:id', passport.authenticate('jwt', { session: false }), Quizz.close);

//delete quizz
app.get('/quizz/delete/:id', passport.authenticate('jwt', { session: false }), Quizz.delete);



/*
 *
 *  ROUTE FOR ANSWER
 *
 */

//create answer
app.post('/answer/create/:quizz_id', passport.authenticate('jwt', { session: false }), Answer.create);

app.post('/answer/createAnonym/:quizz_id', Answer.createAnonym);

//get answer by id
app.get('/answer/:id', Answer.getSingle);

//get all answers by quizz
app.get('/answers/:id', Answer.getAllByQuizz);

//get answer by quizz_id and user_id
app.get('/answerUser/:quizz_id', passport.authenticate('jwt', { session: false }), Answer.getSingleByQuizzAndUser);


/*
 *
 *  ROUTE FOR User
 *
 */


// register User
app.post('/register', User.register);

// login user
app.post('/login', User.login);


// get current user
app.get('/user', passport.authenticate('jwt', { session: false }), User.current);


// logout user
app.get('/logout', function(req, res){
    req.logout();
    res.redirect(urlFront);
});

// update user
app.post('/update', passport.authenticate('jwt', { session: false }), User.update);

// get username
app.get('/username/:username', User.getUsername);

// get single user
app.get('/user/:id', User.get);



/*
 *
 *  ROUTE FOR Admin
 *
 */

app.get('/admin/allUsers', passport.authenticate('jwt', { session: false }), Admin.getAllUsers);


app.get('/admin/allQuizz', passport.authenticate('jwt', { session: false }), Admin.getAllQuizz);

app.get('/admin/banUser/:id', passport.authenticate('jwt', { session: false }), Admin.setBan)
app.get('/admin/deleteQuizz/:id', passport.authenticate('jwt', { session: false }), Admin.deleteQuizz)

app.get('/admin/reports', passport.authenticate('jwt', { session: false }), Admin.getAllReport);

/*
 *
 *  ROUTE FOR passport login
 *
 */

// twitter
app.get('/auth/twitter', storeRedirectToInSession, passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: urlFront }),
    PassportTwitter.auth);

// facebook
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: urlFront }),
    PassportFacebook.auth
);

// google
app.get('/auth/google', passport.authenticate('google',{ scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: urlFront }),
    PassportGoogle.auth
);

// instagram
app.get('/auth/instagram', passport.authenticate('instagram'));

app.get('/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: urlFront }),
    PassportInstagram.auth
);

passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey   : config.secretOrKey
    },
    function (jwtPayload, done) {
        UserModel.getUserById(jwtPayload.data._id, function(err, user) {
            if(user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        }, err => {return done(null, false)})
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserModel.getUserById(id, function(err, user) {
        done(err, user);
    });
});


app.use('/avatar', express.static(__dirname+'/uploads/profile'));
app.listen(port, () => console.log('App listening on port '+port));