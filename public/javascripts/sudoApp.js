var board;
var socket;
var sudoComm;

var init = function (){
    socket = SocketClient();
    board = Board();
    socket.setBoard(board);
    sudoComm = SudoCommunicator();
}

$(document).ready(init);
