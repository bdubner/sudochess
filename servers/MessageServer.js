exports = module.exports =function (){
    const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
    var zmq = require("zeromq"),
        sock = zmq.socket("pull");

    sock.bindSync("tcp://127.0.0.1:3001");
    console.log("Server connected to port 3001");
    // setInterval(function(){
    //     console.log("sending greetings")
    //     io.emit('greetings', "message server");
    // }, 5000);

    sock.on("message", function(msg) {
        const move = msg.toString().split(' ');
        io.emit('sudoMove',move[0],move[1]);
        console.log("move: %s", msg.toString());
    });
}
