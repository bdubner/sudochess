const readline = require('readline');
let five = require("johnny-five");
let board = new five.Board({
    repl: false,
    debug: false,
});

// move length of 40.25mm
const FULLSTEP = 136;
// move length of 20.125mm
const HALFSTEP = 68;
// rpm for motor driver
const RPM = 180;

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

var srcNum = 0;
var srcLtr = 0;
var destNum = 0;
var destLtr = 0;

var srcX = 0;
var srcY = 0;
var destX = 0;
var destY = 0;
var dx = 0;
var dy = 0;

const sendMoves = async () => {
    rl.prompt(false);
    for await (const line of rl) {
        console.log("sending move " + line + " to web server");
        await sender.send(line);
        rl.prompt(false);
    }
}

const receiveMoves = async (magnet, bottomStepper, topStepper) => {
    for await (const [msg] of receiver) {
        console.log("got message: " + msg + " from web");
        srcLtr = msg.toString().charAt(0);
        srcNum = parseInt(msg.toString().charAt(1));
        destLtr = msg.toString().charAt(3);
        destNum = parseInt(msg.toString().charAt(4));

        moveToSource(srcLtr, srcNum, bottomStepper, topStepper);
        magnet.write(1);

        destX = resolveHorizontal(destLtr) - resolveHorizontal(srcLtr);
        destY = resolveVertical(destNum) - resolveVertical(srcNum);

        if (isKnightMovement(srcLtr, srcNum, destLtr, destNum)) {
            await delay(1000);
            moveKnight(bottomStepper, topStepper);
            await delay(1000);
        } else {
            // horizontal movement e.g. queen, rook, king
            if ((srcNum == destNum) && (srcLtr != destLtr)) {
                await delay(1000);
                moveHorizontal(topStepper);
                await delay(1000);
            // verical movement e.g. pawn, queen, rook, king
            } else if ((srcLtr == destLtr) && (srcNum != destNum)) {
                await delay(1000);
                moveVertical(bottomStepper);
                await delay(1000);
            // diagonal movement e.g. queen, bishop, pawn (when taking)
            } else if ((srcLtr != destLtr) && (srcNum != destNum)) {
                await delay(1000);
                moveDiagonal(bottomStepper, topStepper);
                await delay(1000);
            }
        }
        magnet.write(0);

        // move back to starting position
        bottomStepper.rpm(RPM).cw().step(FULLSTEP * (srcY + destY), () => null);
        topStepper.rpm(RPM).cw().step(FULLSTEP * (srcX + destX), () => null);

    }
}

board.on("ready",() => {

    // magnet bound to digital pin 10
    var magnet = new five.Pin({
        pin: 10, 
        type: "digital"
    });

    // bottom stepper motor driver bound to pins 3 and 2 for step and direction
    // used for movement along the y-axis
    const bottomStepper = new five.Stepper({
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: [3, 2]
    });

    // top stepper motor driver bound to pins 9 and 8 for step and direction
    // used for movement along the x-axis
    const topStepper = new five.Stepper({
        type: five.Stepper.TYPE.DRIVER,
        stepsPerRev: 200,
        pins: [9, 8]
    });

    receiveMoves(magnet, bottomStepper, topStepper);
});

sendMoves();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function moveToSource(srcLtr, srcNum, bottomStepper, topStepper) {
    srcX = resolveHorizontal(srcLtr);
    srcY = resolveVertical(srcNum);
    bottomStepper.rpm(RPM).ccw().step(FULLSTEP * srcY, () => null);
    topStepper.rpm(RPM).ccw().step(FULLSTEP * srcX, () => null);
}

// given source letter and number with destination letter and number,
// determines wether the piece moved is a knight.
// the knight is the only piece able to jump other pieces, 
// so itmust move in between other pieces.
function isKnightMovement(srcLtr, srcNum, destLtr, destNum) {
    let x = srcLtr.charCodeAt(0) - destLtr.charCodeAt(0);
    let y = srcNum - destNum;
    if ((Math.abs(x) == 1) && (Math.abs(y) == 2)) {
        return true;
    }
    else if ((Math.abs(x) == 2) && (Math.abs(y) == 1)){
        return true;
    }
    return false;
}

// determines path of movement for a knight
// since a knight can "jump" other pieces, it must move in between them
function moveKnight(bottomStepper, topStepper) {
    dx = Math.abs(destX);
    dy = Math.abs(destY);
    if (destX > 0 && destY > 0) {
        if (dy == 2) {
            topStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).ccw().step(FULLSTEP * dy, () => null);
            delay(1000);
            topStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
        } else if (dy == 1) {
            bottomStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
            topStepper.rpm(RPM).ccw().step(FULLSTEP * dx, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
        }
    } else if (destX > 0 && destY < 0) {
        if (dy == 2) {
            topStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).cw().step(FULLSTEP * dy, () => null);
            delay(1000);
            topStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
        } else if (dy == 1) {
            bottomStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
            topStepper.rpm(RPM).ccw().step(FULLSTEP * dx, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
        }
    } else if (destX < 0 && destY < 0) {
        if (dy == 2) {
            topStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).cw().step(FULLSTEP * dy, () => null);
            delay(1000);
            topStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
        } else if (dy == 1) {
            bottomStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
            topStepper.rpm(RPM).cw().step(FULLSTEP * dx, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
        }
    } else if (destX < 0 && destY > 0) {
        if (dy == 2) {
            topStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).ccw().step(FULLSTEP * dy, () => null);
            delay(1000);
            topStepper.rpm(RPM).cw().step(HALFSTEP, () => null);
            delay(1000);
        } else if (dy == 1) {
            bottomStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
            topStepper.rpm(RPM).cw().step(FULLSTEP * dx, () => null);
            delay(1000);
            bottomStepper.rpm(RPM).ccw().step(HALFSTEP, () => null);
            delay(1000);
        }
    }
}

function moveHorizontal(topStepper) {
    dx = Math.abs(destX);
    if (destX < 0) {
        topStepper.rpm(RPM).cw().step(FULLSTEP * dx, () => null);
    } else if (destX > 0) {
        topStepper.rpm(RPM).ccw().step(FULLSTEP * dx, () => null);
    }
}

function moveVertical(bottomStepper) {
    dy = Math.abs(destY);
    if (destY < 0) {
        bottomStepper.rpm(RPM).cw().step(FULLSTEP * dy, () => null);
    } else if (destY > 0) {
        bottomStepper.rpm(RPM).ccw().step(FULLSTEP * dy, () => null);
    }
}

// movement on both axis simultanously results in a diagonal movement between pieces
function moveDiagonal(bottomStepper, topStepper) {
    dx = Math.abs(destX);
    dy = Math.abs(destY);
    if (destX > 0 && destY > 0) {
        bottomStepper.rpm(RPM).ccw().step(FULLSTEP * dy, () => null);
        topStepper.rpm(RPM).ccw().step(FULLSTEP * dx, () => null);
    } else if (destX > 0 && destY < 0) {
        bottomStepper.rpm(RPM).cw().step(FULLSTEP * dy, () => null);
        topStepper.rpm(RPM).ccw().step(FULLSTEP * dx, () => null);
    } else if (destX < 0 && destY < 0) {
        bottomStepper.rpm(RPM).cw().step(FULLSTEP * dy, () => null);
        topStepper.rpm(RPM).cw().step(FULLSTEP * dx, () => null);
    } else if (destX < 0 && destY > 0) {
        bottomStepper.rpm(RPM).ccw().step(FULLSTEP * dy, () => null);
        topStepper.rpm(RPM).cw().step(FULLSTEP * dx, () => null);
    }
}


// returns multiplier for horizontal movement based on letter
function resolveHorizontal(letter) {
    switch (letter) {
        case 'h': return 1;
        case 'g': return 2;
        case 'f': return 3;
        case 'e': return 4;
        case 'd': return 5;
        case 'c': return 6;
        case 'b': return 7;
        case 'a': return 8;
        default: return 0;
    }
} 

// returns multiplier for vertical movement based on number
function resolveVertical(num) {
    switch (num) {
        case 8: return 1;
        case 7: return 2;
        case 6: return 3;
        case 5: return 4;
        case 4: return 5;
        case 3: return 6;
        case 2: return 7;
        case 1: return 8;
        default: return 0;
    }
}
