require("dotenv").config()

const express       = require("express");
const {v4: uuidv4}  = require("uuid")
const fetch         = require("node-fetch")
const {stringify}   = require("querystring")
const bodyParser    = require("body-parser")
const Question      = require("../models/question")
const Room          = require("../models/room");
const Password      = require("../models/password")
const Flagged       = require("../models/flaggedPassword")
router = express.Router(); 

const secretKey = process.env.PRIVATE_KEY


router.post("/createroom/", async(req, res) => {
    if(
        req.body.captcha === undefined ||
        req.body.captcha === "" ||
        req.body.captcha === null
    ){
        // return res.send({success: false, msg: "Please complete captcha"})
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
        // return res.send({success: false, msg: "Failed to complete captcha."})
    }

    //if everything worked out, run this:

    let bannedRooms =[
        "CUNT", 
        "FUCK",
        "NIGG",
        "NIGA",
        "JEWS",
        "RAPE",
        "SHIT",
        "HOES",
        "FAGG",
        "PISS",
        "ANUS",
        "TITS",
        "POOP",
        "CUCK",
        "ANAL",
        "PUSS",
        "PUSY",
        "PUSI",   
    ]
    let roomCode
    // let test = 0;
    let finished = false;
    while(finished === false){
        finished = true;
        roomCode = CodeGenerator(4)
        
        // if(test < 3){
        //     roomCode = "RAPE"
        // }
        // test++;
        console.log(roomCode)

        let existingRoom

        if(bannedRooms.includes(roomCode)){
            finished = false;
        }
        else{
            existingRoom = await Room.find({roomId: roomCode})

            if(existingRoom.length > 0){
                finished = false;
            }
        }

    }
  


    const adminPassword = uuidv4()
    // console.log(adminPassword)

    const newRoom = new Room({
        roomId: roomCode,
        bannedIds: [],
        flaggedPasswords: [],
        adminPassword: adminPassword,
        // passwordList: [], deprecated

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
        // return res.send({success: false, msg: "Please complete captcha"})
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
        // return res.send({success: false, msg: "Failed to complete captcha."})
    }

    
    //if everything works out, run this:




    let existingRoom

    // if(req.body.room is not a possible room, cancel everything)
    // not really necessary with captcha in place, but maybe in the future.

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
        
    }



    //if not too old (which means its currently active), check the password list.

    //if client sent a password
    if(req.body.existingPassword !== undefined){ 
        
        let password
        try{
            password = await Password.find({password: req.body.existingPassword}) 
        }catch(err){
            return res.send({ success: false, msg:"Error: Couldn't find any room."})
        }
        if(password[0].password === req.body.existingPassword){
            return res.send({success: true, roomId: req.body.room, userId: password[0].userId, msg: "Your password was correct"})
        }

    }

    

    //generate random id's for people
    
    let newUserId = CodeGenerator(2);
    console.log(newUserId)
   
    while(existingRoom[0].existingUserIds.includes(newUserId)){
        newUserId = CodeGenerator(2);
        console.log(newUserId)
        

        //in case over 200 people joins (max is 576), use longer id's instead.
        if(existingRoom[0].existingUserIds.length > 200){
            newUserId=CodeGenerator(4);
        }
    }

    existingRoom[0].existingUserIds.push(newUserId)
    try{    
        await existingRoom[0].save()
    }catch(err){
        console.log(err)
    }

    let newPassword = uuidv4();

    const passwordObject = new Password({
        roomId: req.body.room,
        password: newPassword,
        lastActive: 69420,
        userId: newUserId,
    })

    try{ 
        await passwordObject.save();
    }catch(err){
        return res.send({ success: false, msg: "Error saving password." })
    }
    return res.send({success: true, roomId: req.body.room, userId: newUserId, newPassword: newPassword, msg:"Wrong or no password, here's a new one."})
})

router.post("/postquestion/", async(req, res) => {

    return // currently not in use

    //check if client sent a password.
    if(req.body.password === undefined){
        return res.send({success: false, msg: "Error: Try joining the room from the front page, or double check that the code is correct."})
    }

    let bannedPassword
    //finds flagged password that matches.
    try{
        bannedPassword = await Flagged.find({password: req.body.password});
    }catch(err){
        return res.send({success: false, msg: "An error occurred"})
    }   

    // if a password is found (which means this password is banned)
    if(bannedPassword.length != []){
        return res.send({success: true, msg: "Successfully posted question!"}) //this sends the exact same thing as if the question was published.
        // then never do anything
    }

    //checks if user bypassed client side charachter amount restriction
    if(req.body.question.length > 200){
        return res.send({success: false, msg: "Error: Message too long."})
    }

    //get password from database matching what user sent.
    let password
    try{
        password = await Password.find({password: req.body.password});
    }catch(err){
        return res.send({success: false, msg: "Error: Error finding password."})
    }
    
    //if password doesnt exist in the database.
    if(password.length == 0){
        return res.send({success: false, msg: "Error: Wrong password"})
    }

    //check the password object for lastActive if its too early to post
    let d = new Date()
    let today = d.getTime()
    console.log(today - password[0].lastActive)
    //if earlier than 2.5 seconds since last post, ban user. (clientside is 3 seconds)
    if(today - password[0].lastActive < 2500){ 
        const newFlagged = new Flagged({
            password: req.body.password,
            roomId: req.body.roomId
        })
        try{
            await newFlagged.save()
        }catch(err){

            return res.send({success: true, msg: "Successfully posted question!"})
        }
    
    }

    //update lastactive.
    password[0].lastActive = today
    try{
        await password[0].save()
    }catch(err){
        console.log(err)
    }

    //post new question to database.
    const question = new Question({
        question: req.body.question,
        userId: password[0].userId,
        roomId: req.body.roomId
    })

    question.save();
    
    return res.send({success: true, msg: "Successfully posted question!"})


})

// //websocket for getting questions 
// router.ws("/getquestions", async(ws, req) => {

// })

router.post("/banuser/", async(req, res) => {
    let password;
    console.log("this ran")
    
    //Search database for admin password
    try {
        password = await Room.find({ adminPassword: req.body.password });
    } catch (err) {
        console.log(err)
        return res.send({ success: false, msg: "Server error, try again later." })
    }

    //if password isnt found.
    if (password.length == 0) {
        return res.send({ success: true, msg: "User banned successfully" })
        //trolling anyone who dares to cheat. this is otherwise impossible to reach.
    }

    //remove data for sent ID from server.
    try{
        await Question.find({roomId: req.body.roomId, userId: req.body.userId }).deleteMany()
    }catch(err){
        console.log(err)
        return res.send({success: false, msg: "Server error, couldn't delete questions. Try again later"})
    }
    
    
    //find user
    let user
    try{
        user = await Password.find({roomId: req.body.roomId, userId: req.body.userId})
    }
    catch(err){
        console.log(err)

        return res.send({success: false, msg: "Server error, couldn't find user."})
    }
    console.log(user)
    //ban user

    const newFlagged = new Flagged({
        password: user[0].password,
        roomId: user[0].roomId
    })
    try{
        await newFlagged.save()
    }catch(err){

        return res.send({success: true, msg: "Server error, couldn't ban user"})
    }

    return res.send({success: true, msg: "Successfully banned user"})
    


})



function CodeGenerator(codeLength){
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 456,976 different room combinations with 4 letters.
    let length = chars.length;
    let result = "";    
    for (let i = 0; i < codeLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * length));
    }

    return result;    
}



module.exports = router