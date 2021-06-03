require("dotenv").config();

// const socket = require("socket.io")
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path")


const config = require("./config")
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//show client the frontend
app.use(express.static(path.join(__dirname, "build")))
// app.use('/static', express.static(path.join(__dirname, 'build')));
app.get('*', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, 'build')});
});

//mongoose and database connection
// mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const dbUrl = config.dbUrl;

var dboptions = {
  keepAlive: 1,
  connectTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(dbUrl, dboptions, (err) => {
  if (err) console.log(err);
  handleCleanup();
});


const db = mongoose.connection
db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connected to database"))

//middleware
app.use(cors())

//routes
const Routes = require("./routes/route")
app.use("/", Routes)

//create server with 'app' (which the express application).
const server = require('http').createServer(app);


//actually boot up server.

server.listen(process.env.PORT || 3001, () => console.log("Server started"));


//socket.io https://stackoverflow.com/questions/35713682/socket-io-gives-cors-error-even-if-i-allowed-cors-it-on-server?rq=1
const options={
    cors:true,
    origins:["http://localhost:3001","http://localhost:3002"],
    // origins:["http://127.0.0.1:5347"],
}
const io = require('socket.io')(server, options);



const Flagged       = require("./models/flaggedPassword")
const Password      = require("./models/password")
const Question      = require("./models/question")
const Room          = require("./models/room")
const Cleanup       = require("./models/cleanup")
const Analytics     = require("./models/analytics")
const Poll          = require("./models/poll");
const { copyFileSync } = require("fs");

// mongoose.set("debug", true)
// mongoose.set('useFindAndModify', false);

io.on("connection", function(socket){
    // console.log("New WS connection")

    socket.on("adminValidate", async function(data){ //this gets run every time admin client starts
        
        let password;

        //Search database for admin password
        try {
			password = await Room.find({ adminPassword: data.password });
		} catch (err) {
			console.log(err)
            return socket.emit("message", {success: false, msg: "Server Error, try again later."})
		}

        
        
        //if password isnt found.
        if(password.length == 0){
            return socket.emit("message", {success: false, msg: "Password not found. You appear to not have hosted this room. If this isn't the case, make sure you aren't using a different browser or incognito mode."})
        }

        //save socket id into database. used for knowing what client to send questions to.
        password[0].adminSocketId = socket.id


        try{
            await password[0].save()
        }catch(err){
            console.log(err)
        }

        //if yes, respond with question list on the server.

        
        try{
            questionList = await Question.find({roomId: password[0].roomId})
        }
        catch(err){
            console.log(err)
        }

        socket.emit("QuestionList", {questionList: questionList})


        
    })

    socket.on("postQuestion", async function(data){
		// do the post question i did in route here

		
		//check if client sent a password.
		if (data.password === undefined) {
			return socket.emit("RoomMessage", {
				success: false,
				msg:
					"Error: Try joining the room from the front page, or double check that the code is correct.",
			});
		}

		let bannedPassword;
		//finds flagged password that matches.
		try {
			bannedPassword = await Flagged.find({ password: data.password });
		} catch (err) {
			return socket.emit("RoomMessage", {
				success: false,
				msg: "A server error occured.",
			});
		}
		

		// if a password is found (which means this password is banned)
		if (bannedPassword.length != []) {
			return socket.emit("RoomMessage", {
				success: true,
				msg: "Successfully posted question!",
			});

			//this sends the exact same thing as if the question was published.
			// then never do anything
		}

		//checks if user bypassed client side charachter amount restriction
		if (data.question.length > 200) {
			return socket.emit("RoomMessage", {
				success: false,
				msg: "Not so fast",
			});
		}

		//get password from database matching what user sent.
		let password;
		try {
			password = await Password.find({ password: data.password });
		} catch (err) {
			return socket.emit("RoomMessage", {
				success: false,
				msg: "Error: Error finding password.",
			});
		}
		

		//if password doesnt exist in the database.
		//what the fuck is this for? I dont think this ever runs. But im keeping it since theres
		//probably a reason why i wrote it in the first place. hopefully.
		if (password.length == 0) {
			return socket.emit("RoomMessage", {
				success: false,
				msg: "Error: Wrong password",
			});
		}

		//check the password object for lastActive if its too early to post
		let d = new Date();
		let today = d.getTime();
		console.log(today - password[0].lastActive);
		//if earlier than 2.5 seconds since last post, ban user. (clientside is 3 seconds)
		if (today - password[0].lastActive < 2500) {
			const newFlagged = new Flagged({
				password: data.password,
				roomId: data.roomId,
			});
			try {
				await newFlagged.save();
			} catch (err) {
				
            }
            return socket.emit("RoomMessage", {
                success: true,
                msg: "Successfully posted question!",
            });
            //trolololol
		}

		//update lastactive.
		password[0].lastActive = today;
		try {
			await password[0].save();
		} catch (err) {
			console.log(err);
        }
        
        //post new question to database.
        const question = new Question({
            question: data.question,
            userId: password[0].userId,
            roomId: password[0].roomId,
        })

        question.save();

        socket.emit("RoomMessage", {
            success: true,
            msg: "Successfully posted question!"
        })

     
        //find admin socketid and emit to the host
        let room
        try {
			room = await Room.find({ roomId: password[0].roomId });
		} catch (err) {
			console.log(err)
		}

        let socketid = room[0].adminSocketId;
        console.log(socketid)

        io.to(socketid).emit("SingleQuestion", {
            question: data.question,
            userId: password[0].userId,
            roomId: password[0].roomId,
        })
        
	})

    socket.on("setSocketId", async function(data){
        
        let user
        try {
            user = await Password.find({password: data.password})
        } catch (error) {
            console.log(error)
        }

        //crashes if i dont send socketid obviously.
        user[0].socketId = socket.id

        try {
            user[0].save()
        } catch (error) {   
            console.log(error)
        }

        console.log(user[0])


        //get poll
        let poll
        try {
            poll = await Poll.find({roomId: user[0].roomId})
        } catch (error) {   
            console.log(error)
        }
        console.log(poll)

        if(poll.length == 0){
            return console.log("no poll has been created yet.")
        }

        if(poll[0].length !== 0){
            socket.emit("SendPoll", {
                pollData: poll[0].pollData,
                pollTitle: poll[0].pollTitle,
                selected: user[0].pollChoice,
             })
        }
    })

    socket.on("postPoll", async function(data){

        //validate if i am admin.
        let admin
        try {
            admin = await Room.find({adminPassword: data.password})
        } catch (error) {
            console.log(error)
        }

        if(admin.length === 0){
            return socket.emit("message", {success: false, msg: "Password not found. You appear to not have hosted this room. If this isn't the case, make sure you aren't using a different browser or incognito mode."})
        }


        //validate that this is indeed a poll.

        if(Array.isArray(data.pollData)){

        }
        else{
            return socket.emit("message", {success: true, msg: "Poll successfully published!"})
            //trolololol
        }

       //input validation

        let doReturn = false;

        data.pollData.forEach(element => {
            if(typeof element !== "string"){
                doReturn = true;
            }
            if(element === ""){
                doReturn = true;
            }
            if(element.length > 50){
                doReturn = true;
            }
            if(doReturn) return //hops out of loop
        });
 
        
        if(doReturn) return socket.emit("message", {success: true, msg: "Poll successfully published!"})

        if(data.pollData.length < 2){
            return socket.emit("message", {success: true, msg: "Poll successfully published!"})
        }
        
        if(data.pollData.length > 10){
            return socket.emit("message", {success: true, msg: "Poll successfully published!"})
        }

        if(typeof data.pollTitle !== "string") return socket.emit("message", {success: true, msg: "Poll successfully published!"})

        if(data.pollTitle === "") return socket.emit("message", {success: true, msg: "Poll successfully published!"})
        
        if(data.pollTitle.length > 50) return socket.emit("message", {success: false, msg: "Not so fast."})
        
        //theres absolutely a better way i just cant be bothered to figure it out.
        let checkboxtest = false;
        if(data.checkbox === true){
            checkboxtest = true;
        }
        if(data.checkbox === false){
            checkboxtest = true;
        }
        if(checkboxtest === false) return socket.emit("message", {success: true, msg: "Poll successfully published!"})


        
        //send to all clients.

        //create pollData with vote values aswell.

        let newPollData = []

        data.pollData.forEach((item) => {
            newPollData.push(
                {
                    option: item,
                    value: 0
                }
            )
        })

        console.log(newPollData)

        //find all users in this room

        
        
        //push to database
        const pollObject = new Poll({
            roomId: admin[0].roomId,
            pollData: newPollData,
            pollTitle: data.pollTitle,
            locked: data.checkbox,
        })
        try {
            await pollObject.save()
        } catch (error) {
            console.log(error)
            return socket.emit("message", {success: false, msg: "Server error: Could not create poll. Try again later."})
        }


        let users
        try {
            users = await Password.find({roomId: admin[0].roomId}) //gets the roomId from admin object
            //also this ensures you cannot send to any other room.
        } catch (error) {
            console.log(error)
        }

        let userSocketIds = []
        users.forEach(user => {
            userSocketIds.push(user.socketId)
        });

        //send to all clients.
        io.to(userSocketIds).emit("SendPoll", {
           pollData: newPollData,
           pollTitle: data.pollTitle
        })
        
        return socket.emit("message", {success: true, msg: "Poll successfully published!"})

        
        

    })

    socket.on("sendPollAnswer", async function(data) {

        //check if password is correct:
        let user;
        try {
            user = await Password.find({password: data.password})
        } catch (error) {
            console.log(error)
        }

        if(user.length == 0) {
            return socket.emit("message", {success: false, msg: "Error: Try joining the room from the front page, or double check that the code is correct."})
        }

        let previousChoice = user[0].pollChoice

        //set his choice to what he picked.
        user[0].pollChoice = data.choice;
        try {
            user[0].save()
        } catch (error) {
            console.log(error);
        }
        let newData = []

        //get poll from database and edit it
        await Poll.findOne({roomId: user[0].roomId}).then(doc => {
            //generate copy of array           
            doc.pollData.forEach((item) => {
                newData.push(
                    {option: item.option, value: item.value}
                )
            })
            //this doesnt work:
            //let newData = doc.pollData
            //edit and save value
            newData[data.choice].value += 1
            if(user[0].pollChoice !== -1) newData[previousChoice].value -= 1 //if user have not voted for anything yet.
            
            doc.pollData = newData;
            doc.save();
            
        })
        
        
        
        try {
            users = await Password.find({roomId: user[0].roomId}) 
            
        } catch (error) {
            console.log(error)
        }

        let userSocketIds = []
        users.forEach(user => {
            userSocketIds.push(user.socketId)
        });
        // console.log(userSocketIds)
        console.log("-----------------------")
        console.log(newData)
        //send to all clients.
        io.to(userSocketIds).emit("SendPoll", {
           pollData: newData,
           selected: data.choice    
        })

        
    
    })
})


//cleanup functions

//runs as soon as server connected to database.
 const handleCleanup = async () => {
    

    let cleanupObj
    try{
        cleanupObj = await Cleanup.find({id: "asdf"})
    }catch(err){
        console.log(err)
    }

    

    //if the cleanup timer object doesnt exist, create it. 
    if(cleanupObj.length === 0){
        const newCleanup = new Cleanup()
        try{
            newCleanup.save()
        }catch(err){
            console.log(err)
        }
        return // need to figure out a better way
    }


    //if there exists an object, run this:

    let clean = cleanupObj[0]
    
    
    //figure out how long it is since cleanup last ran
    let today = new Date();
    
    let timeSinceLast = today.getTime() - clean.timeSinceLast
    let hour = 3600000
    console.log("Time since last cleanup ", timeSinceLast, " out of ", hour)


    //if more than 1 minutes has passed
    if(timeSinceLast > hour){
        console.log("Running cleanup process...")
        let rooms
        try{
            rooms = await Room.find()
        }catch(err){
            console.log(err)
        }
        

        let toBeRemoved = []

        //if older than 24 hours, add their ID it to the toBeRemoved array.
        rooms.forEach(room => {
            // console.log(today.getTime() - room.createdDate.getTime())
            
            if(today.getTime() - room.createdDate.getTime() > 86400000 ){
                toBeRemoved.push(room.roomId)
            }

        })

        console.log("rooms to be removed: ", toBeRemoved)

        //delete questions:
        let anal = {
            questions: undefined,
            users: undefined,
            rooms: toBeRemoved.length,
        }
        let data
        try{
            data = await Question.find({roomId: {$in: toBeRemoved}})
            await Question.find({roomId: {$in: toBeRemoved}}).deleteMany()    //ONLY TEMPORARY!!!!
        }catch(err){
            console.log(err)
        }

        anal.questions = data.length;
       
        

        
        //delete passwords
        try{
            data = await Password.find({roomId:{$in: toBeRemoved}})
            await Password.find({roomId:{$in: toBeRemoved}}).deleteMany();
            
        }catch(err){
            console.log(err)
        }
        anal.users = data.length;

        //delete flaggedPasswords
        try{
            Flagged.find({roomId:{$in: toBeRemoved}})
            await Flagged.find({roomId:{$in: toBeRemoved}}).deleteMany()
           

        }catch(err){
            console.log(err)
        }

        //delete rooms
        try{
            await Room.find({roomId:{$in: toBeRemoved}}).deleteMany()
           
        }catch(err){
            console.log(err)
        }
        
        console.log(anal)

        //check if analytics file already exists. It always will, unless i click the reset button
        let analyticsData
        try{
            analyticsData = await Analytics.find({id: "analytics"})
        }catch(err){
            console.log(err)
        }

        if(analyticsData.length === 0){
            const NewAnal = new Analytics({
                rooms: anal.rooms,
                users: anal.users,
                questions: anal.questions,
            })
           
            try{
                NewAnal.save()
            }catch(err){

            }
        }
        else{
            analyticsData[0].rooms = analyticsData[0].rooms + anal.rooms
            analyticsData[0].users = analyticsData[0].users + anal.users
            analyticsData[0].questions = analyticsData[0].questions + anal.questions
            try{
                analyticsData[0].save()
            }catch(err){
                console.log(err)
            }
        }
    }
    

    //reset time since
    clean.timeSinceLast = today.getTime()
    clean.save()

}



