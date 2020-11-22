
function SocketClient(){
    var socket = io.connect();
    var board;
    var room = "";
    var opponentNameField=$('#opponentName');
    let opponentId;
    var nameField=$('#nameField');
    var name = nameField.text();
    var inviterName;
    var inviterId;
    var readyBtn = $('#readyBtn');
    var acceptBtn = $('#invAcceptBtn');
    var rejectBtn = $('#invRejectBtn');
    var createBtn = $('#createRoomBtn');
    var joinBtn   = $('#joinRoomBtn');
    var roomIdField = $('#roomIdField');
    var chatBox = $('#chatBox');
    var invitationModal = $('#invitationModal');
    var userEmail = $('#userEmail').text();
    var portBtn   = $('#portBtn');

    invitationModal.on('show.bs.modal',function (event){
        $('#invitationText').text(inviterName + " has invited you to a game");
    });

    readyBtn.click(function () {
        socket.emit("invitation", room, name);
        //socket.to(room).emit('sendReady',opponentColor);
    })

    acceptBtn.click(function (){
        socket.emit("setupGame",inviterId,inviterName,name);
    })

    createBtn.click(function (){
        socket.emit("createRoom",userEmail);
    });

    // joinButton will leave room if you are already in a room
    joinBtn.click(function (){
        let roomId = roomIdField.val();
        console.log("trying to join " + roomId);
        if(room){ // leave room
            socket.emit("leaveRoomRequest",roomId,name);
        }
        else{ // send request to join room
            socket.emit("joinRoomRequest",roomId,name,userEmail);
        }

    });

    // Socket Commands
    socket.on('greetings',function(msg){
        console.log(msg);
    });

    socket.on('invitation', function (name,opponentId){
        inviterId = opponentId;
        inviterName = name;
        //$('#invitationText').innerHTML =  name + " has invited you to a game";
        invitationModal.modal('show');
    });

    socket.on('roomToJoin', function (roomId) {
        console.log("joining room " + roomId);
        room = roomId;
        //socket.join(roomId);
        roomIdField.val(roomId);
        roomIdField.prop("readonly",true);
        joinBtn.text("Leave Room");
    });

    socket.on('leaveRoom',function (){
        room = "";
        roomIdField.prop("readonly",false);
        roomIdField.val("");
        joinBtn.text("Join Room");
    });

    socket.on('startGame',function (otherId,name,myColor,sudoPort){
        readyBtn.hide();
        opponentNameField.text(name);
        console.log("started game against " + name + " with " + myColor)
        board.reset();
        board.setPlayerColor(myColor);
        opponentId = otherId;
        portBtn.text(sudoPort);
        portBtn.show();
    });

    socket.on('move',function (move){
        board.move(move);
    });

    socket.on('sudoMove',function (color,source, dest){
        if(board.getTurn() === color) {
            console.log("got sudo move " + color + " " + source + " " + dest);
            board.sudoMove(source, dest);
        }
    });

    socket.on('playerJoined',function(name){
        addChatMessage(name + " has joined the room.")
    });

    socket.on('playerLeft',function(name){
        addChatMessage(name + " has left the room.")
    });

    function addChatMessage(message){
        const chatSpan = $('<span class=""></span>')
        const chatMessage = $('<p class="text-info"></p>').text(message);
        chatSpan.append(chatMessage);
        chatBox.append(chatSpan);
    }

    return {
        setBoard:function(newBoard){
            board= newBoard;
            board.setSocket(this);
        },
        sendMove:function(move){
            console.log("sending move")
            socket.emit("sendMove",opponentId,move);
        }
    }
}