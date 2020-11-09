/**
 * sudochess server
*/
function randomString(length){
    const chars = 'abcdefghijklmnopqrstuvwxyz01234566789'.split('');
    let str = '';
    for (let i = 0; i < length; i++) {
        let ind = Math.floor(Math.random() * chars.length);
        str += chars[ind];
    }
    return str;
}

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

                console.log("server setup sender:" + senderId + "; receiver: " + opponentId)

                io.to(opponentId).emit("startGame",senderId,myName,receiverColor);
                socket.emit("startGame",opponentId,opponentName,senderColor);
            }

            function sendMove(opponentId, move){
                io.to(opponentId).emit("move",move);
            }

            function createRoom(){
                const roomId = randomString(4);
                console.log("creating room " + roomId);
                socket.join(roomId);
                socket.emit("roomToJoin",roomId);
            }

            function joinRoomRequest(roomId,name){
                console.log(name + " is requesting to join " + roomId);
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

