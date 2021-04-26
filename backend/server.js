require("dotenv").config();

// const socket = require("socket.io")
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connected to database"))

app.use(express.json())
app.use(cors())

const Routes = require("./routes/route")
app.use("/", Routes)

// const server = app.listen(3001, () => console.log("Server started"))
const server = require('http').createServer();
const options={
    cors:true,
    origins:["http://127.0.0.1:5347"],
}
const io = require('socket.io')(server, options);
// var io = socket(server)

io.on("connection", function(socket){
    console.log(socket)
})

server.listen(3001, () => console.log("Server started"));