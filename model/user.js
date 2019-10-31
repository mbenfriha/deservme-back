var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        validate: {
            validator: function (v, cb) {
                User.find({username: v, _id:  { $ne: this._id }} , function (err, docs) {
                    cb(docs.length == 0);
                });
            },
            message: 'Le pseudo a déjà été pris'
        }
    },
    password: {
        type: String
    },
    email: {
        type: String,
        index:true,
        validate: {
            validator: function(v, cb) {
                User.find({email: v, _id: { $ne: this._id }}, function(err, docs){
                    cb(docs.length == 0);
                });
            },
            message: 'Cet email a déjà été pris'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type : String,
    },
    avatar_type: {
        type: String,
    },
    facebook: {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter: {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
});


var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(function(err) {
                callback(newUser, err);
            });
        });
    });
}
module.exports.updateUser = function(updateUser, callback) {
   // console.log(updateUser);
    let upd = updateUser.body;
    User.findOne(updateUser.user._id, function(err, user) {
        if(upd.username) {
            user.username = upd.username;
        }
        if(upd.newEmail) {
            console.log(upd.newEmail);
            user.email = upd.newEmail;
        }
        if(upd.password) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(upd.password, salt, function(err, hash) {
                    user.password = hash;
                    user.save(function(err) {
                        callback(user, err);
                    });
                });
            });
        } else {
            user.save(function(err) {
                callback(err, user);
            });
        }

    });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}
