const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    roomId: {
        type: String,
        require: true,
    },
    pollData: {
        type: Array,
        required: true,
    },
    pollTitle: {
        type: String,
        required: true,
    }
})
module.exports = mongoose.model("poll", pollSchema)