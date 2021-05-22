const mongoose = require("mongoose");

const AnalSchema = new mongoose.Schema({

    rooms:{
        type: Number,
        require: false,
    },
    users:{
        type: Number,
        require: false,
    },
    questions:{
        type: Number,
        require: false,
    },
    id:{
        type: String,
        require: true,
        default: "analytics"
    }
    


})

module.exports = mongoose.model("analytics", AnalSchema)