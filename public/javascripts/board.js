 function Board() {

    var game = new Chess();
    var socket;
    var $status = $('#status');
    var $fen = $('#fen');
    var $pgn = $('#pgn');

    var playerColor;
    var whiteSquareGrey = '#a9a9a9'
    var blackSquareGrey = '#696969'

    const removeLegalMoveIndicators = () => {
        $('#board .square-55d63').css('background', '')
    };

    const addLegalMoveIndicator = square => {
        var $square = $('#board .square-' + square)

        var background = whiteSquareGrey
        if ($square.hasClass('black-3c85d')) {
            background = blackSquareGrey
        }

        $square.css('background', background)
    };

    const highlightLegalMoves = square => {
        // get list of possible moves for this square
        var moves = game.moves({
            square: square,
            verbose: true
        })

        // exit if there are no moves available for this square
        if (moves.length === 0) return

        // highlight the square they moused over
        addLegalMoveIndicator(square)

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            addLegalMoveIndicator(moves[i].to)
        }
    };
    const updateStatus = () => {
        var status = ''

        var moveColor = 'White'
        if (game.turn() === 'b') {
            moveColor = 'Black'
        }

        // checkmate?
        if (game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.'
        }

        // draw?
        else if (game.in_draw()) {
            status = 'Game over, drawn position'
        }

        // game still on
        else {
            status = moveColor + ' to move'

            // check?
            if (game.in_check()) {
                status += ', ' + moveColor + ' is in check'
            }
        }

        $status.html(status)
        $fen.html(game.fen())
        $pgn.html(game.pgn())
    };

    const onDragStart = (source, piece, position, orientation) => {
        // do not pick up pieces if the game is over
        if (game.game_over()) return false

        // only pick up pieces for the side to move
        if (playerColor !== game.turn() ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }

        highlightLegalMoves(source)
    };

    const onDrop = (source, target) => {
        removeLegalMoveIndicators()

        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })


        // illegal move
        if (move === null) return 'snapback'
        socket.sendMove(move);
        game.move()
        updateStatus()
    };

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    const onSnapEnd = () => {
        board.position(game.fen())
    };



    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };
    const board = Chessboard('board', config)

    return{
        setSocket:function(newSocket){
            socket = newSocket;
        },
        setPlayerColor:function(color){
            let colorChar = color.charAt(0).toLowerCase();
            if(colorChar==='w' || colorChar==='b')
                playerColor = colorChar;
                board.orientation(color);
        },
        setFenPosition:function(){
            board.position(game.fen());
        },
        getPgn:function() {
            return game.pgn();
        },
        getTurn:function(){
            return game.turn();
        },
        isGameOver:function(){
            return game.game_over();
        },
        move:function(move){
            game.move(move);
            board.position(game.fen(),false);
        },
        sudoMove:function(source,dest){
            game.move({from:source,to:dest,promotion: 'q'});
            board.position(game.fen(),false);
        },
        reset:function(){
            game.reset();
            board.start();
        },
        startBoard:function(){
            board.start();
        }

    }
}