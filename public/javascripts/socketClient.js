
function SocketClient(){
    var socket = io.connect();
    var game;
    var board;
    var room;

    socket.on('greetings',function(msg){
        console.log(msg);
    });

    return {
        setBoard:function(newBoard){
            board= newBoard;
        },
        sendMove:function(playerColor,source,target,promo){
            socket.emit("move",room,{color:playerColor, from:source,to:target,promotion:promo||''});
        },requestNewGame:function(){

            socket.emit("newGameRequest",room);
        }
    }
}