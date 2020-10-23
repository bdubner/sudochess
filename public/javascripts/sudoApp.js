var board;
var socket;

var init = function (){
    socket = SocketClient();
    board = Board();

    socket.setBoard(board);
}

$(document).ready(init);
