exports = module.exports =function (port, room, color){
    const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
    const zmq = require("zeromq");
    const rec = new zmq.Pull;
    const sender = new zmq.Push;

    async function receive(){
        await rec.bind("tcp://127.0.0.1:" + port);
        console.log("Listening for sudocomm on port " + port + ", color " + color + ", room " + room)
        for await (const [msg] of rec) {
            const move = msg.toString().split(' ');
            io.to(room).emit('sudoMove',color.charAt(0),move[0],move[1]);
            console.log("message: %s", msg.toString());
        }
    }

    async function retryRecieve(){
        await rec.unbind("tcp://127.0.0.1:" + port)
            .then(receive)
            .catch(retryRecieve);
    }

    async function setupSend(){
        let sendPort = port + 1;
        await sender.bind("tcp://127.0.0.1:" + sendPort);
        console.log("setup send on port " + sendPort);
    }

    async function retrySend(){
        let sendPort = port + 1;
        await sender.unbind("tcp://127.0.0.1:" + sendPort)
            .then(receive)
            .catch(retrySend);
    }

    async function clearConnections(){
        let sendPort = port + 1;
        await sender.unbind("tcp://127.0.0.1:" + sendPort);
        await rec.unbind("tcp://127.0.0.1:" + port);
    }

    receive().catch(retryRecieve);
    setupSend().catch(retrySend);

    return {
        sendMoveToSudo: async function (source, destination) {
            await sender.send(source + " " + destination);
        },
        clearConnections: async function (){
            await clearConnections();
        }
    }
}

