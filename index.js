import express from 'express';
import { Server } from "socket.io";
import cors from "cors";
import http from 'http';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server);

const users = [{}];
const roomCount = 5;
let rooms = [0, 0, 0, 0, 0];

function alotRoom() {
    let alotted = -1;
    let roomAvail = [];
    for(var i = 0; i<roomCount; i++) {
        if(rooms[i] < 4) roomAvail.push(i);
    }
    let numOfRoomAvaial =  roomAvail.length;
    if(numOfRoomAvaial === 0) return alotted;
    var randNum = Math.floor(Math.random()*numOfRoomAvaial);
    alotted = roomAvail[randNum];
    return alotted;
}

function createRooms() {
    for(var i = 0; i<roomCount; i++) {
        rooms.push(0);
    }
}

const port = process.env.PORT || 4500;
server.listen(port, () => {
    console.log("Server is running on http://localhost:"+port);
    // createRooms();
})

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({user, room}) => {
        console.log(user + "has joined room " + room);
        users[socket.id] = user;
        if(room < roomCount) rooms[room] = rooms[room] + 1;
        io.emit(room, {user:"Admin", msg: user + " has joined"});
        socket.emit("welcome", {user:"Admin", msg:"Welcome to the chat"});
        console.log(rooms);
    })
    socket.on("message", ({user, message, room}) => {
        io.emit(room, {user, msg:message});
    })
    socket.on("discon", ({user, room}) => {
        console.log(user + " has left the chat");
        if(room < roomCount && rooms[room] !== 0) rooms[room] = rooms[room] - 1;
        console.log(rooms);
        io.emit(room, {user:"Admin", msg: user + " has left the chat"});
    })
    
})

app.get("/getRandomRoom", (req, res) => {
    const roomID = alotRoom();
    res.json({roomID});
})

app.get("/", (req, res) => {
    res.send("Its working");
})