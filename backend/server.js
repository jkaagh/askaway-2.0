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

		console.log(data);
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
		console.log(password);

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
            roomId: data.roomId,
        })

        question.save();

        socket.emit("RoomMessage", {
            success: true,
            msg: "Successfully posted question!"
        })

        console.log("ass")
        //find admin socketid and emit to the host
        let room
        try {
			room = await Room.find({ roomId: data.roomId });
		} catch (err) {
			console.log(err)
		}

        let socketid = room[0].adminSocketId;
        console.log(socketid)

        io.to(socketid).emit("SingleQuestion", {
            question: data.question,
            userId: password[0].userId,
            roomId: data.roomId,
        })
        
	})

    socket.on("setSocketId", async function(){
        console.log("this ran")
    })
    socket.on("postPoll", async function(data){

        //validate that this is indeed a poll.


        //todo make client have specific ID to send to.

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



