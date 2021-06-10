const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({

    roomId:{
        type: String, //LJSH 
        require: true
    },
    // deprecated: used elsewhere for performance
    // flaggedPasswords: { //and array of passwords that are flagged for spam.
    //     type: Array,
    //     require: false
    // },
    adminPassword:{ 
        type: String,
        require: true
    },
    adminSocketId:{ //this is used to know which socket to send data to.
        type: String,
        require: false
    },
    adminSelected:{
        type: Number,
        required: true,
        default: -1
    },
    // passwordList: { //deprecated
    //     type: Array,
    //     require: false
    // },
    existingUserIds:{
        type: Array,
        require: true,
        default: []
    },
    createdDate: {
        type: Date,
        require: true,
        default: Date.now
    }
})


module.exports = mongoose.model("room", RoomSchema)

// let passwordList = [ 
//     {
//         password: "9zk19sjls9mzjd82jz9k",
//         id: "AJ"
//         lastActive: timestamp // this is to check whether or not its been 3 seconds since question post
//     },
//     {
//         password: "asd2d19sasdls9mzjdas",
//         id: "QK"
//         lastActive: timestamp
//     }
// ] 
// i could put this array of objects like their own schema. but i
// already did that so now i'm trying both options out. 
// update: holy shit that fucking sucks. nope.
