var mongoose = require('mongoose');




var ChoiceSchema = mongoose.Schema({
    name: {
        type: String,
        validate: {
            validator: function(v) {
                return v.length <= 40
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
                return v.length <= 90
            },
            message: 'Question trop longue '
        }
    },
    choices: [ChoiceSchema]
});

var QuizzSchema = mongoose.Schema({
    user_id: {
        type: String,
    },
    username: {
        type: String,
    },
    title: {
       type: String,
        validate: {
            validator: function(v) {
                return v.length <= 50
            },
            message: 'Titre du quizz trop long '
        }
    },
    answer: {
        type: Boolean,
        default: false,
    },
    answer_count: {
        type: Number,
        default: 0
    },
    avatar: {
        type : String,
    },
    avatar_type: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    questions: [QuestionSchema],
    deleted: {
        type: Boolean,
        default: false,
    }
});


var Quizz = module.exports = mongoose.model('Quizz', QuizzSchema);

module.exports.createQuizz = function(newQuizz, callback) {
    newQuizz.save(callback);
};

module.exports.getQuizzById = function(id, callback) {
    console.log(id);
    Quizz.findById(id).exec(callback);
};
module.exports.getAll = function(user_id, callback) {
    Quizz.find({user_id: {$ne: user_id}, createdAt: { $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000))) }} ).sort({answer_count: 'desc'}).limit(20).exec(callback);
};

module.exports.getAllQuizz = function(callback) {
    Quizz.find().sort({date: 'desc'}).exec(callback);
};
module.exports.getMyQuizz = function(id, callback) {
    Quizz.find({user_id: id}).sort({createdAt: -1}).exec(callback);
};

module.exports.addAnswer = function(quizz_id, callback) {
    console.log(quizz_id, 'find_id');
    Quizz.findById(quizz_id, function(err, quizz) {
        console.log(quizz);
        quizz.answer_count = quizz.answer_count+1;
            quizz.save(function(err) {
                callback(err, quizz);
            });
    });
}