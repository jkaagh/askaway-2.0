require("dotenv").config();

// const socket = require("socket.io")
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

//mongoose and database connection
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connected to database"))

//middleware
app.use(express.json())
app.use(cors())

//routes
const Routes = require("./routes/route")
app.use("/", Routes)

//create server with 'app' (which the express application).
const server = require('http').createServer(app);


//actually boot up server.

server.listen(3001, () => console.log("Server started"));


//socket.io https://stackoverflow.com/questions/35713682/socket-io-gives-cors-error-even-if-i-allowed-cors-it-on-server?rq=1
const options={
    cors:true,
    origins:["http://localhost:3001"],
    // origins:["http://127.0.0.1:5347"],
}
const io = require('socket.io')(server, options);

io.on("connection", function(socket){
    console.log("New WS connection")

    socket.on("adminValidate", function(data){
        console.log(data)
        //check in database if this is admin password

        //if not, cancel

        //if yes, respond with question list on the server.


        //maybe put this sockets ID into a file on the database, 
    })

    socket.on("postQuestion", function(data){
        // do the post question i did in route here

        //check if client sent a password.

        if(data.password === undefined){
            return res.send({success: false, msg: "Error: Try joining the room from the front page, or double check that the code is correct."})
        }

    })
})
