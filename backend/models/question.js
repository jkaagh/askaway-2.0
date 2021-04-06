const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({

    question:{
        type: String,
        require: true
    },
    userId:{
        type: String,
        require: true
    },
    roomId: {
        type: String,
        require: true
    }


})

module.exports = mongoose.model("question", QuestionSchema)