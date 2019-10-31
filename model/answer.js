var mongoose = require('mongoose');

// Answer Schema
var detailAnswerSchema = mongoose.Schema({
    name: {
        type: String,
    },
    rep: {
        type: Boolean,
    }
});

var QuestionSchema = mongoose.Schema({
    name: {
        type: String,
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
    },
    quizz_id: {
        type: String,
    },
    answer: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    questions: [QuestionSchema]
});

var Answer = module.exports = mongoose.model('Answer', AnswerSchema);


module.exports.createAnswer = function(newAnswer, callback) {
    newAnswer.save(callback);
};

module.exports.getAnswerById = function(id, callback) {
    console.log(id);
    Answer.findById(id).exec(callback);
};

module.exports.getAnswerByUserId = function(user_id, quizz_id, callback) {
    Answer.findOne({user_id, quizz_id}).exec(callback);
};
