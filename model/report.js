var mongoose = require('mongoose');

// report Schema
var ReportSchema = mongoose.Schema({
    quizz: {
        type : Object,
    },
    user: {
        type: Object,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    done: {
        type: Boolean,
        default: false,
    }
});

var Report = module.exports = mongoose.model('Report', ReportSchema);

module.exports.createReport = function(newReport, callback) {
    newReport.save(callback);
};


module.exports.getReport = function(quizz, user, callback){
    Report.findOne({"user._id": user._id, "quizz._id": quizz._id}, callback);
}


module.exports.allReport = function(callback){
    Report.find().exec(callback);
}

