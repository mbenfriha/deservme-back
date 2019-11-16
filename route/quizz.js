const Quizz = require('../model/quizz');
const Report = require('../model/report');
const request = require('request');
const shortUrl = process.env.SHORTURL || 'http://localhost:4100/';


module.exports.getAll = function(req, res) {
    Quizz.getAll(req.user._id,function (err, quizzs) {
        if (err) {
            res.status(500).send({message: "Une erreur est survenue"}).end()
        }
        res.send(quizzs).end()
    })
};
module.exports.getAllByUser = function(req, res) {
    Quizz.getMyQuizz(req.params.id, true, function (err, quizzs) {
        if (err) {
            res.status(404).send({message: "Ce quizz n'existe pas"}).end()
        } else {
            if (!quizzs) {
                res.status(404).send({message: "Ce quizz n'existe pas"}).end()
            } else {
                res.send(quizzs).end()
            }

        }
    })
};
module.exports.getSingle = function(req, res) {
    Quizz.getQuizzById(req.params.id, function (err, quizz) {
        if (err) {
            res.status(404).send({message: "Ce quizz n'existe pas"}).end()
        } else {
            if(!quizz){
                res.status(404).send({message: "Ce quizz n'existe pas"}).end()
            } else {
                if(quizz.deleted) {
                    res.status(404).send({message: "Ce quizz n'existe pas"}).end()
                } else {
                    res.send(quizz).end()
                }
            }
        }
    })
};
module.exports.create = function(req, res) {
        if(req.body.questions) {
            if(req.body.questions.length > 19) {
                res.status(401).send({message: "Un quizz ne peux comporter que 20 questions maximum"}).end()
            } else {
                var newQuizz = new Quizz({
                    user_id: req.user._id,
                    username: req.user.username,
                    answer: false,
                    title: req.body.title,
                    questions: req.body.questions,
                    avatar: req.user.avatar,
                    avatar_type: req.user.avatar_type,
                    private: req.body.private,
                    close: req.body.close
                })

                Quizz.createQuizz(newQuizz, function (err, quizz) {
                    if (err) {
                        res.status(500).send(err).end()
                    } else {
                        request(shortUrl+'newQuizz/'+quizz._id, { json: true }, (err, response, body) => {
                            if (err) { return console.log(err); }
                            quizz.shortUrl = body.short_id;
                            quizz.save();
                            res.send(quizz).end();
                        });
                    }
                });
            }

        }else{
            res.status(500).send({message: "Questions is empty"}).end()
        }
};
module.exports.report = function(req, res) {
    const user = req.user ? req.user: {_id: '0'};

    Quizz.getQuizzById(req.params.quizz_id, function(err, quizz) {
        Report.getReport(quizz, user, function(err, report) {
            if(!report) {
                var newReport = new Report({
                    user: user,
                    quizz: quizz,
                })

                Report.createReport(newReport, function (err, report) {
                    if (err){
                        res.status(500).send(err).end();
                    } else {
                        res.send(report).end()
                    }
                });
            } else {
                res.status(500).send({message: "Quizz Déjà signalé"}).end()
            }
        })
    }, err => {
        res.status(500).send({message: "Ce quizz n'existe pas"}).end()
    })
};


module.exports.changeState = function(req, res) {
        Quizz.changeState(req.params.id, function(err, quizz) {
            res.send(quizz).end()
        },(err) => res.status(500).send(err).end())
};

module.exports.close = function(req, res) {
    Quizz.closeQuizz(req.params.id, function(err, quizz) {
        res.send(quizz).end()
    }, (err) => res.status(500).send(err).end())
};

module.exports.delete = function(req, res) {
    Quizz.deleteQuizz(req.params.id, function(err, quizz) {
        res.send(quizz).end()
    },(err) => res.status(500).send(err).end())
};

