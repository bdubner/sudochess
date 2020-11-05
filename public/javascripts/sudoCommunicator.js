function SudoCommunicator(){
    var sp = new SerialPort("COM3", {
        baudrate: 9600,
        parser: serialport.parsers.readline("\n")
    });

    sp.on('open', onPortOpen);
    sp.on('data', onData);
    sp.on('close', onClose);
    sp.on('error', onError);


    function onPortOpen(){
        console.log("SP open");
    }

    function onData(d)
    {
        console.log("SP data: "+d)
    }

    function onClose(){
        console.log("SP close");
    }
    function onError(){
        console.log("SP error");
    }

    return{
        setPort(port){
            console.log(port);
        }
    }
}