const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({

    log:{
        type: Array,
        require: false,
    },
    id:{
        type: Date,
        require: true,
        default: Date.now(),
    }
    


})

module.exports = mongoose.model("log", LogSchema)