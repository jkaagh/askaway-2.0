require("dotenv").config()

const express       = require("express");
const {v4: uuidv4}  = require("uuid")
const fetch         = require("node-fetch")
const {stringify}   = require("querystring")
const bodyParser    = require("body-parser")
const Question      = require("../models/question")
const Room          = require("../models/room");

router = express.Router(); 

const secretKey = process.env.PRIVATE_KEY


router.post("/createroom/", async(req, res) => {
    if(
        req.body.captcha === undefined ||
        req.body.captcha === "" ||
        req.body.captcha === null
    ){
        return res.send({success: false, msg: "Please complete captcha"})
    }
    const query = stringify({
        secret: secretKey,
        response: req.body.captcha,
        remoteip: req.connection.remoteAddress
      });

      const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
    
    
    const body = await fetch(verifyURL).then(res => res.json())

    // console.log(body)

    if(body.success !== true){
        return res.send({success: false, msg: "Failed to complete captcha."})
    }

    //if everything worked out, run this:


    //generate a random room id
    let roomCode = CodeGenerator(4)
    console.log(roomCode)

    //todo check if Room.find({createdDate < 24 hours ago})
    const existingRoom = await Room.find({roomId: roomCode})
    console.log(existingRoom)
    //will return [] if room doesnt exist.
    if(existingRoom.length === 0){ 
        
    }
    else{
        //if it does, do this. delete room if too old, otherwise dont.
    }

    const adminPassword = uuidv4()
    console.log(adminPassword)

    const newRoom = new Room({
        roomId: roomCode,
        bannedIds: [],
        adminPassword: adminPassword,
        passwordList: [],
    })

    try{
        await newRoom.save()
    }catch(err){
        return res.send({success: false, msg: "Server error: Failed creating room"})
    }

    res.send({adminPassword: adminPassword, roomId: roomCode, roomCreated: true})
    //if room doesnt exist, do this:






    //check if it already exists.
    //if it does, check date expiration. if too old then delete, if not then retry.

    //generate an admin password

    //send it all back to the client

})

function CodeGenerator(codeLength){
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let length = chars.length;
    let result = "";    
    for (let i = 0; i < codeLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * length));
        
    }

    return result;    
}



module.exports = router