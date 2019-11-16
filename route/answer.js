var Answer = require('../model/answer');
var Quizz = require('../model/quizz');


module.exports.create = function(req, res) {

    if(req.body.questions) {
        var questions = req.body.questions.filter(q => q.name);
            var newAnswer = new Answer({
                user_id: req.user._id,
                quizz_id: req.params.quizz_id,
                answer: true,
                questions: questions,
                username: req.user.username,
                title: req.body.title,
                avatar: req.body.avatar,
                avatar_type: req.user.avatar_type,
                registered_user: true,
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
    } else {
        res.status(500).send({message: "Aucun réponse"}).end()
    }
};

module.exports.createAnonym = function(req, res) {
    if(req.body.questions) {
        var questions = req.body.questions.filter(q => q.name);
            var newAnswer = new Answer({
                quizz_id: req.params.quizz_id,
                answer: true,
                questions: questions,
                username: req.body.username,
                title: req.body.title,
                registered_user: false,
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
    } else {
        res.status(500).send({message: "Aucun réponse"}).end()
    }
};

module.exports.getSingle = function(req, res) {
    Answer.getAnswerById(req.params.id, function (err, answer) {
        if (err) {
            res.status(404).send({message: "Cette réponse n'existe pas"}).end()
        } else {
            if(!answer){
                res.status(404).send({message: "Cette réponse n'existe pas"}).end()
            } else {
                res.send(answer).end()
            }

        }
    })
};

module.exports.getAllByQuizz = function(req, res) {
    Answer.getAnswerByQuizz(req.params.id, function (err, answer) {
        if (err) {
            res.status(404).send({message: "Cette réponse n'existe pas"}).end()
        } else {
            if(!answer){
                res.status(404).send({message: "Cette réponse n'existe pas"}).end()
            } else {
                res.send(answer).end()
            }

        }
    })
};

module.exports.getSingleByQuizzAndUser = function(req, res) {
        Answer.getAnswerByUserId(req.user._id, req.params.quizz_id, function (err, answer) {
            if (err) {
                res.status(500).send(err).end();
            } else if (!answer) {
                res.status(404).send(err).end();
            } else {
                res.send(answer).end()
            }
        })
};