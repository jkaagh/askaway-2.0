const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    roomId: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    lastActive: {
        type: Number,
        require: true,
    },
    userId: {
        type: String,
        require: true,
    },
    socketId:{ //used to send websocket stuff to client
        type: String,
        require: false,

    }
})
module.exports = mongoose.model("password", passwordSchema)