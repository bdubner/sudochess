const readline = require('readline');
let five = require("johnny-five");
let board = new five.Board({
    repl: false,
    debug: false,
});

if(process.argv.length !== 3){
    console.log("usage: node send_move port")
}
const port = process.argv[2];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Move > "
});
// producer
const zmq = require("zeromq");
const sender = new zmq.Push;
const receiver = new zmq.Pull;

sender.connect("tcp://127.0.0.1:"+port);
console.log("Sender bound to port " + port);

let sendPort = parseInt(port,10) + 1;
receiver.connect("tcp://127.0.0.1:" + sendPort)
console.log("Receiver bound to port " + sendPort);

const sendMoves = async () =>{
    rl.prompt(false);
    for await (const line of rl) {
        console.log("sending move " + line + " to web server");
        await sender.send(line);
        rl.prompt(false);
    }
}

const receiveMoves = async (led) =>{
    for await (const [msg] of receiver) {
        console.log("got message: " + msg + " from web");
        let srcNum = parseInt(msg.toString().charAt(1));
        let destNum = parseInt(msg.toString().charAt(4));
        led.on();
        await delay(srcNum * 1000);
        led.off();
        await delay(1000);
        led.on();
        await delay(destNum * 1000);
        led.off();
    }
}

board.on("ready",() => {
    let led = new five.Led(13);
    receiveMoves(led);
});

sendMoves();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
