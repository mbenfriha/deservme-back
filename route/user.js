var User = require('../model/user');
var Quizz = require('../model/quizz');
var Answer = require('../model/answer');
multer = require('multer');
const fileUpload = require('express-fileupload');


// File upload settings
const PATH = __dirname + '/../uploads/profile';

module.exports.register = function(req, res) {
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
                    }
                    res.status(500).send(err.message).end();
                } else {
                    res.status(500).send(err).end();
                }
            } else {
                res.send(user).end()
            }
        });
    } else{
        res.status(500).send({message: "Passwords don't match"}).end()
    }
};

module.exports.current = function(req, res) {
    User.getUserById(req.user._id, function(err, user) {
        if(user){
            Quizz.getMyQuizz(user._id, false, function(err, quizz) {
                Answer.getAnswerAllByUserId(user._id, function(err, answers){
                    res.send({user: {user_id: user._id, username: user.username}, quizz, answers}).end();
                }, (err) =>  res.status(500).send(err).end());
            }, (err) => res.status(500).send(err).end())
        } else {
            res.status(404).send({message: "Cette utilisateur n'existe plus"}).end()
        }

    }, (err) => res.status(404).send(err).end())
};

module.exports.update = function(req, res) {
    User.updateUser(req, function(user, err){
        if(err){
            res.status(500).send(err).end();
        } else {
            delete user.password;
            res.send(user).end();
        }
    })
};
module.exports.updateAvatar = function(req, res) {
    console.log(__dirname + '/../uploads/profile/' + req.user._id + '.jpg');
    try {
        if(!req.files) {
            res.status(404).send({status: false, message: 'fichier manquant'}).end();
        } else {
            let avatar = req.files.file;
            console.log(__dirname + '/../uploads/profile/' + req.user._id + '.jpg');
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv(__dirname + '/../uploads/profile/' + req.user._id + '.jpg');

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports.getUsername = function(req, res) {
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
};

module.exports.get = function(req, res) {
    User.getUserById(req.params.id, function(err, user) {
        if(user){
            Quizz.getUserQuizz(user._id, false, function(err, quizz) {
                res.send({user: {user_id: user._id, username: user.username}, quizz}).end();

            }, (err) => res.status(500).send(err).end())
        } else {
            res.status(404).send({message: "Cette utilisateur n'existe plus"}).end()
        }
    }, (err) => res.status(404).send(err).end())
};

