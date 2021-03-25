const mongoose = require("mongoose");

const FlaggedPasswordSchema = new mongoose.Schema({

    password:{
        type: String,
        require: true,
    },
    roomId:{
       type: String,
       require: true,
    }


})

module.exports = mongoose.model("flaggedPassword", FlaggedPasswordSchema)