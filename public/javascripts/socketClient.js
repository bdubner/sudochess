
function SocketClient(){
    var socket = io.connect();
    var game;
    var board;
    var room;
    var opponentNameField=$('#opponentName');
    let opponentId;
    var nameField=$('#nameField');
    var inviterName;
    var inviterId;
    var readyBtn = $('#readyBtn');
    var acceptBtn = $('#invAcceptBtn');
    var rejectBtn = $('#invRejectBtn');
    var invitationModal = $('#invitationModal');

    invitationModal.on('show.bs.modal',function (event){
        $('#invitationText').text(inviterName + " has invited you to a game");
    });

    readyBtn.click(function () {
        socket.emit("invitation",nameField.val());
        //socket.to(room).emit('sendReady',opponentColor);
    })

    acceptBtn.click(function (){
        socket.emit("setupGame",inviterId,inviterName,nameField.val());
    })


    socket.on('greetings',function(msg){
        console.log(msg);
    });

    socket.on('invitation', function (name,opponentId){
        inviterId = opponentId;
        inviterName = name;
        //$('#invitationText').innerHTML =  name + " has invited you to a game";
        invitationModal.modal('show');
    });

    socket.on('roomToJoin',function (roomId){
        room = roomId;
        socket.join(roomId);
    });

    socket.on('startGame',function (otherId,name,myColor){
        readyBtn.hide();
        opponentNameField.text(name);
        console.log("started game against " + name + " with " + myColor)
        board.reset();
        board.setPlayerColor(myColor);
        opponentId = otherId;
    });

    socket.on('move',function (move){
        console.log("got move " + move);
        board.move(move);
    });

    return {
        setBoard:function(newBoard){
            board= newBoard;
            board.setSocket(this);
        },
        sendMove:function(move){
            console.log("sending move")
            socket.emit("sendMove",opponentId,move);
        },requestNewGame:function(){

            socket.emit("newGameRequest",room);
        }
    }
}