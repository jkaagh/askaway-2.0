require("dotenv").config()

const express       = require("express");
const {v4: uuidv4}  = require("uuid")
const fetch         = require("node-fetch")
const {stringify}   = require("querystring")
const bodyParser    = require("body-parser")
const Question      = require("../models/question")
const Room          = require("../models/room");
const Flagged       = require("../models/flaggedPassword")

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
    // console.log(roomCode)

    //todo check if Room.find({createdDate < 24 hours ago})
    const existingRoom = await Room.find({roomId: roomCode})
    // console.log(existingRoom)
    //will return [] if room doesnt exist.
    if(existingRoom.length === 0){ 
        
    }
    else{
        //if it does, do this. delete room if too old, otherwise dont.
    }

    const adminPassword = uuidv4()
    // console.log(adminPassword)

    const newRoom = new Room({
        roomId: roomCode,
        bannedIds: [],
        flaggedPasswords: [],
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

})

router.post("/joinroom/", async(req, res) =>{
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

    
    //if everything works out, run this:




    let existingRoom

    // if(req.body.room is not a possible room, cancel everything)
    //not really necessary with captcha in place, but maybe in the future.

    //finds the room with code provided.
    try{
        existingRoom = await Room.find({roomId: req.body.room}) //will return an array of maximum 1 room. 
        
        //if room doesnt exist, it returns empty array
    }catch(err){
        return res.send({success: false, msg: "An error occured while trying to find the room"})
    }


    //if no room is found
    if (existingRoom.length === 0) { 
        return res.send({ success: false, msg: "Room not found" })
    }
   
    //if a room is found, check how old it is.
    let roomAge = existingRoom[0].createdDate;
    let d = new Date()
    let today = d.getTime()
    // console.log(today - roomAge)
    

    if (today - roomAge > 86400000) { //if room is older than 24 hours 
        // console.log("this room is too old!")
        return res.send({ success: false, msg: "Room not found" })
        //todo AKZ87 maybe delete the old room here. 
    }



    //if not too old (which means its currently active), check the password list.
    let access = false; //used to check if password sent matches with one in the database.
    //if client sent a password
    if(req.body.existingPassword !== undefined){ //if join WITH password, regardless of it being fake or not.
        let passwordList = existingRoom[0].passwordList;
        let userId;
        if(passwordList.length === 0){ //if no passwords are saved in the database
            // do nothing, access is false by default.
            
        }else{
            for (let i = 0; i < passwordList.length; i++) {
                const pw = passwordList[i];
                if(pw.password === req.body.existingPassword){
                    access = true;
                    userId = pw.id;
                    break;
                }
            }
        }
        if(access == true){ //if passwords match
            return res.send({success: true, roomId: req.body.room, userId: userId, msg: "Your password was correct"})
        }
    }

    if(access == false){ //if you either dont have a password, or the one you sent doesnt match:
            
        let newPassword = uuidv4();
        let newUserId = CodeGenerator(2);
        let d = Date.now()
        let newObject = {
            password: newPassword,
            id: newUserId,
            lastActive: d
        }
        existingRoom[0].passwordList.push(newObject)
        try{
            
            await existingRoom[0].save();

        }catch(err){
            return res.send({ success: false, msg: "Error saving password." })
        }
        
        return res.send({success: true, roomId: req.body.room, userId: newUserId, newPassword: newPassword, msg:"Wrong or no password, here's a new one."})
    }   
})

router.post("/postquestion/", async(req, res) => {



    //check if client sent a password.
    if(req.body.password === undefined){
        return res.send({success: false, msg: "Error: Try joining the room from the front page, or double check that the code is correct."})
    }

    let password
    //finds flagged password that matches.
    try{
        password = await Flagged.find({password: req.body.password});
    }catch(err){
        return res.send({success: false, msg: "An error occurred"})
    }   

    // if a password is found (which means this password is banned)
    if(password.length != 0){
        return res.send("youre banned kid!")
        // then never do anything
    }
    


    // deprecated?
    // //check flaggedPasswords if password is flagged
    // if(room.flaggedPasswords.length != 0){
    //     for (let i = 0; i < flaggedPasswords.length; i++) {
    //         const pw = flaggedPasswords[i]; 
    //     }
    // }

    // const banned = new Flagged({
    //     roomId: req.body.roomId,
    //     password: req.body.password
    // })
    // try{
    //     banned.save()
    // }catch(err){

    // }
    

    //get room
    let room 
    try{
        room = await Room.find({roomId: req.body.roomId});
    }catch(err){
        return res.send({success: false, msg: "Error: Couldn't find the room. Maybe the room expired?"})
    }
    
    //check in passwordList for if its too early to post.
    let passwordList = room[0].passwordList
    let d = new Date()
    let today = d.getTime()
    for (let i = 0; i < passwordList.length; i++) {
        const pw = passwordList[i];
        if(today - pw.lastActive < 3000){ //if its less than 3 seconds since i tried to post something
            //ban the password for breaking the front end security
            const 
        }
    }
    //



    //todo: remove the fukcing shit make passwordList a collection everything else is horrible.
    //thats here. when creating a 

    fuck



    //

    //if it is, flag password and send back to client that captcha is required.

    //grab room object, look in banned passwords

    //if password banned, return the same as if it wasnt.

    //look in passwordList

    //check if password is correct.

    //post new question to database.


})




function CodeGenerator(codeLength){
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 456,976 different rooms
    let length = chars.length;
    let result = "";    
    for (let i = 0; i < codeLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * length));
        
    }

    return result;    
}



module.exports = router