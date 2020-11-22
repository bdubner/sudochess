exports = module.exports =function (port, room, color){
    const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
    const zmq = require("zeromq");
    const rec = new zmq.Pull;

    async function receive(){
        await rec.bind("tcp://127.0.0.1:" + port);
        console.log("Listening for sudocomm on port " + port + ", color " + color + ", room " + room)
        for await (const [msg] of rec) {
            const move = msg.toString().split(' ');
            io.to(room).emit('sudoMove',color.charAt(0),move[0],move[1]);
            console.log("message: %s", msg.toString());
        }
    }
    receive().catch(retryRec);

    async function retryRec(){
        await rec.unbind("tcp://127.0.0.1:" + port)
            .then(receive)
            .catch(retryRec);
    }
}

