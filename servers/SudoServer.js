/**
 * sudochess server
*/
let email2Room = new Map();
let email2Game = new Map();
let id2Email = new Map();

function randomString(length){
    const chars = 'abcdefghijklmnopqrstuvwxyz01234566789'.split('');
    let str = '';
    for (let i = 0; i < length; i++) {
        let ind = Math.floor(Math.random() * chars.length);
        str += chars[ind];
    }
    return str;
}
const messageServer = require("./MessageServer");

exports = module.exports =function (io){
    io.on('connection', function (socket)
        {
            io.emit("greetings","Welcome to Sudo Chess!");

            socket.on('alertMessage',alertMessage);
            socket.on('createRoom',createRoom);
            socket.on('invitation',invitation);
            socket.on('setupGame',setupGame);
            socket.on('sendMove',sendMove);
            socket.on('joinRoomRequest',joinRoomRequest);
            socket.on("leaveRoomRequest",leaveRoomRequest);


            function alertMessage(message){
                io.emit("alertMessage",message);
            }

            function invitation(room, name){
                socket.to(room).emit("invitation",name,socket.id);
            }

            function setupGame(opponentId, opponentName, myName){
                let senderId = socket.id;
                let isSenderWhite = Math.random() < 0.5;
                let senderColor = isSenderWhite ? 'white' : 'black';
                let receiverColor = isSenderWhite ? 'black' : 'white';


                let myEmail = id2Email.get(socket.id);
                let roomId = email2Room.get(myEmail);
                let oppEmail = id2Email.get(opponentId);
                console.log("server setup game" +
                    "\nsender: id=" + senderId + ",email=" + myEmail +
                    "\nreceiver: id=" + opponentId + ",email=" + oppEmail);
                messageServer(5555,roomId,receiverColor);
                io.to(opponentId).emit("startGame",senderId,myName,receiverColor,5555);
                messageServer(5565,roomId,senderColor);
                socket.emit("startGame",opponentId,opponentName,senderColor,5565);
            }

            function sendMove(opponentId, move){
                io.to(opponentId).emit("move",move);
            }

            function createRoom(userEmail){
                const roomId = randomString(4);
                email2Room.set(userEmail,roomId);
                id2Email.set(socket.id,userEmail);
                console.log("creating room " + roomId + "for user " + userEmail);
                socket.join(roomId);
                socket.emit("roomToJoin",roomId);
            }

            function joinRoomRequest(roomId,name, userEmail){
                console.log(name + "(" + userEmail + ") is requesting to join " + roomId);
                email2Room.set(userEmail,roomId);
                id2Email.set(socket.id,userEmail);
                socket.join(roomId);
                socket.emit("roomToJoin",roomId);
                io.in(roomId).emit('playerJoined',name);
            }

            function leaveRoomRequest(roomId,name){
                io.in(roomId).emit("playerLeft",name);
                socket.leave(roomId);
                socket.emit("leaveRoom");
            }
        }
    )
}

function logMapElements(value, key, map) {
    console.log(`m[${key}] = ${value}`);
}