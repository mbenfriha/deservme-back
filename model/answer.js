var mongoose = require('mongoose');

// Answer Schema
var detailAnswerSchema = mongoose.Schema({
    name: {
        type: String,
        validate: {
            validator: function(v) {
                return v.length <= 90
            },
            message: 'Réponse trop longue '
        }
    },
    rep: {
        type: Boolean,
    }
});

var QuestionSchema = mongoose.Schema({
    name: {
        type: String,
        validate: {
            validator: function(v) {
                return v.length <=  90
            },
            message: 'Question trop longue '
        }
    },
    question_id: {
        type: String,
    },
    answer: detailAnswerSchema
});

var AnswerSchema = mongoose.Schema({
    user_id: {
        type: String,
    },
    title: {
        type: String,
        validate: {
            validator: function(v) {
                return v.length <= 50
            },
            message: 'Titre du quizz trop long'
        }
    },
    quizz_id: {
        type: String,
    },

    avatar: {
        type : String,
    },
    registered_user: {
        type: Boolean,
        default: false,
    },
    username: {
        type : String,
    },
    answer: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    questions: [QuestionSchema]
});

var Answer = module.exports = mongoose.model('Answer', AnswerSchema);


module.exports.createAnswer = function(newAnswer, callback) {
    newAnswer.save(callback);
};

module.exports.getAnswerById = function(id, callback) {
    Answer.findById(id).exec(callback);
};

module.exports.getAnswerByUserId = function(user_id, quizz_id, callback) {
    Answer.findOne({user_id, quizz_id}).exec(callback);
};

module.exports.getAnswerAllByUserId = function(user_id, callback) {
    Answer.find({user_id, deleted: false}).exec(callback);
};


module.exports.getAnswerByQuizz = function(quizz_id, callback) {
    Answer.find({quizz_id, deleted: false}).sort({createdAt: -1}).exec(callback);
};


