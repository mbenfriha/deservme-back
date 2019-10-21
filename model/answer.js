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
    quizz_id: {
        type: String,
    },
    answer: {
        type: Boolean,
        default: true,
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