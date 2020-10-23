/**
 * sudochess server
*/

exports = module.exports =function (io){
    io.on('connection', function (socket)
        {
            io.emit("greetings","Welcome to Sudo Chess!");

            socket.on('alertMessage',alertMessage)

            function alertMessage(message){
                socket.broadcast.emit("alertMessage",message)
            }
        }
    )
}

