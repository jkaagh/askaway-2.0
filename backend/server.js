require("dotenv").config();

const socket = require("socket.io")
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http")

//connect to mongodb database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connected to database"))

//set up express server.
const app = express();
const server = http.createServer(app)

var allowedOrigins = "http://localhost:* http://127.0.0.1:*";

//i copy pasted this, i dont know what it does
const whitelist = ['http://localhost:3000'];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}


//what is this for?
app.use(express.json())
// app.use(cors({ credentials: true, origin: true }))
app.use(cors(corsOptions))

const options = {
    cors:true,
    origins:["http://localhost:3000"]
};

const io = require("socket.io")(server,{
    origins: allowedOrigins,
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


//enable me to use routes in another file.
const Routes = require("./routes/route")
app.use("/", Routes)

//when a connection is established with any client
io.on("connection", socket =>{
    console.log("New WS Connection...")
    
})

//boot up server on specified port and run a log.
server.listen(3001, () => console.log("Server started"))

//tell our socket what server we are using.. i think?
// const io = socket(server)

