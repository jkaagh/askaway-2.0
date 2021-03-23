const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({

    question:{
        type: String,
        require: true
    },
    askerId:{
        type: String,
        require: true
    }


})

module.exports = mongoose.model("question", QuestionSchema)