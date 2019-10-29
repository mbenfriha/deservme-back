var mongoose = require('mongoose');




var ChoiceSchema = mongoose.Schema({
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
    choices: [ChoiceSchema]
});

var QuizzSchema = mongoose.Schema({
    user_id: {
        type: String,
    },
    title: {
       type:string,
    },
    answer: {
        type: Boolean,
        default: false,
    },
    questions: [QuestionSchema]
});


var Quizz = module.exports = mongoose.model('Quizz', QuizzSchema);

module.exports.createQuizz = function(newQuizz, callback) {
    newQuizz.save(callback);
};

module.exports.getQuizzById = function(id, callback) {
    console.log(id);
    Quizz.findById(id).exec(callback);
};