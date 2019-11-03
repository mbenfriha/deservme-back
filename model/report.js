var mongoose = require('mongoose');

// report Schema
var ReportSchema = mongoose.Schema({
    quizz_id: {
        type : String,
    },
    user_id: {
        type: String,
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


module.exports.getReport = function(quizz_id, user_id, callback){
    Report.findOne({user_id, quizz_id}, callback);
}