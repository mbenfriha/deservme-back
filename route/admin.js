var User = require('../model/user');
var Quizz = require('../model/quizz');
var Report = require('../model/report');

module.exports.getAllUsers = function(req, res) {
    User.getAll(function (err, user) {
        res.send(user).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
};

module.exports.getAllQuizz = function(req, res) {
    Quizz.getAllQuizz(function (err, quizz) {
        res.send(quizz).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
};

module.exports.getAllReport = function(req, res) {
    Report.allReport(function (err, report) {
        res.send(report).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
}

module.exports.setBan = function(req, res) {
    User.ban(req.params.id, function (err, user) {
        res.send(user).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
}

module.exports.deleteQuizz = function(req, res) {
    Quizz.deleteQuizz(req.params.id, function (err, user) {
        res.send(user).end();
    }, err => {
        res.status(500).send({message: "Une erreur est survenue"}).end()
    })
}
