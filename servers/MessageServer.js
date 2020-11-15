exports = module.exports =function (email2Game){
    const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
    const zmq = require("zeromq");

    async function run(){
        const sock = new zmq.Pull;
        await sock.bind("tcp://127.0.0.1:5555");
        console.log("Listening for sudocomm on port 5555")
        for await (const [msg] of sock) {
            const move = msg.toString().split(' ');
            const game = email2Game.get(move[0]);
            const room = game['room'];
            const color = game['color'].charAt(0);

            io.to(room).emit('sudoMove',color,move[1],move[2]);
            console.log("move: %s", msg.toString());
        }
    }

    run();
}
