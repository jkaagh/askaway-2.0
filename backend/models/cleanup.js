const mongoose = require("mongoose");

const CleanupSchema = new mongoose.Schema({

    timeSinceLast:{
        type: Number,
        require: true,
        default: 69420
    },
    id:{
        type: String,
        require: true,
        default: "asdf",
    }
    


})

module.exports = mongoose.model("cleanup", CleanupSchema)