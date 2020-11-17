const Board = require("./board.js");


const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];


class Game {
    constructor(white, black, message) {
        this.board = new Board();
        this.players = {
            white, black
        };
        this.turn = this.players.white;
        this.winner = null;
        this.message = message;
        this.waitPromotion = false;
        this.promotionPiece = null;
        this.check = false;
    }

    render = () => {
        const layoutArray = this.board.layout;
        let renderArray = [];
        
        let counter = 0;

        for (let i = 0; i < 8; i++) {
            let rowStr = "";
            
            rowStr += `*${i + 1}*｜  `;

            for (let j = 0; j < 8; j++) {
                // gets the location of the chess piece (h2, b7, etc.)
                const locationLetter = letters[counter % 8];
                const locationNumber = numbers[Math.floor(counter / 8)];
                const location = locationLetter + locationNumber;

                if (layoutArray[location] === null) {
                    rowStr += "     ";
                } else {
                   rowStr += layoutArray[location].icon; 
                }
                
                // annoying text formatting because discord font is not monospaced :(
                // update: did not realise that discord actually did have monospace font in with code markdown, too late now anyway
                if (j !== 8) {
                    if ((rowStr.match(/ /g) || []).length > 28) {
                        if (layoutArray[location]) {
                            rowStr += "       ";
                        } else {
                            rowStr += "      ";
                        }
                    } else {
                        rowStr += "       ";
                    }
                }

                counter++;
            }

            if (i !== 0) {
                renderArray.splice(0, 0, "\n  ｜  ―       ―       ―       ―       ―       ―       ―       ―"); //nbsp: ( )
            }

            renderArray.splice(0, 0, `\n${rowStr}`);
        }

        renderArray.splice(100, 0, "\n  ｜＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n         *a         b         c         d          e         f          g          h*");

        let turn;
        if (this.players.white.id == this.turn) {
            turn = this.players.white.username;
        } else {
            turn = this.players.black.username;
        }

        if (this.winner) {
            renderArray.splice(0, 0, `${this.winner.toString()} is the winner! :partying_face: \n`);
        } else {
           renderArray.splice(0, 0, `**White = ${this.players.white.username}\nBlack = ${this.players.black.username}**\n(Opposite if using light mode)\n\n__**${turn}'s turn!**__\n`);
        }

        // combines all rows in render array into one string
        let renderStr;
        for (let i in renderArray) {
            renderStr += renderArray[i];
        }

        return renderStr.replace("undefined", "");
    }

    move = (piece, destination) => {
        // checks if a piece exists
        if (!this.board.layout[piece]) return `There is no piece at ${piece}`;

        // if in check then only the king can move
        if ((this.check) && (!this.board.layout[piece].name === "King")) return "You can only move the King while in check";

        // checks that the destination is valid
        if (!this.board.layout[destination]) {
            if (this.board.layout[destination] !== null) {
                return `Cannot move piece to ${destination}`;
            }
        }

        // makes sure that piece and destination are different
        if (piece === destination) return "You can't move a piece to the same square";

        // makes sure that the destination does not already have a piece of the same colour
        if (this.board.layout[destination]) {
            if (this.board.layout[piece].colour === this.board.layout[destination].colour) {
                return `There is already a piece of your colour on ${destination}`;
            }            
        }

        // makes sure that the piece is allowed to move to the destination
        if (!this.board.layout[piece].verifyMove(piece, destination)) {
            return `${this.board.layout[piece].name} cannot move to ${destination}`;
        }

        // checks for any obstacles between piece and destination
        const pieceClass = this.board.layout[piece];
        const checkArray = pieceClass.checkObstacles(piece, destination);
        // if there are areas on the board that need to checked
        if (checkArray.length > 0) {
            for (let i = 1; i < checkArray.length; i++) {
                const checkPiece = this.board.layout[checkArray[i]];
                // if there is a piece in the way
                if (checkPiece) {
                    return `There is a ${checkPiece.name} at ${checkArray[i]} blocking that move`;
                }
            }
        }

        // checks if piece is pawn and is attacking
        if (pieceClass.name === "Pawn") {
            // if pawn is trying to attack in a straight line
            if ((this.board.layout[destination]) && piece[0] === destination[0]) {
                return "Pawns can only take pieces diagonally";
            } else if (piece[0] !== destination[0]) { // if pawn is trying to attack diagonally
                const diffX = letters.indexOf(destination[0]) - letters.indexOf(piece[0]);
                console.log(diffX);

                if ((diffX > 1) || (diffX < -1)) {
                    return `Pawn cannot move to ${destination}`;
                }

                // if there is no piece to attack
                if (!this.board.layout[destination]) { 
                    return `Pawn cannot move to ${destination}`;
                }
            }
        }

        // moves the piece
        const movePiece = this.board.layout[piece];
        this.board.layout[piece] = null;
        this.board.layout[destination] = movePiece;

        // checks if a player has won
        this.checkWin();
        if (this.winner) return;

        // checks if there is a promotion
        if ((this.board.layout[destination].name === "Pawn") && (destination[1] == 8 || destination[1] == 1)) {
            this.message.channel.send(this.render());
            this.message.channel.send(`**Promotion!** What piece would you like ${destination} to promote to? ${this.message.author.toString()}\n**__q__** = Queen, **__h__** = Horse, **__r__** = Rook, **__b__** = Bishop`);
            
            this.waitPromotion = true;
            this.promotionPiece = destination;

            return "Promotion";
        }

        // switches the turn
        this.turn = this.turn === this.players.white ? this.players.black : this.players.white;

        // checks if the opponent's king is now in check
        this.checkCheck();
        if (this.check) {
            this.message.channel.send(this.render());
            this.message.channel.send(`**${this.turn === this.players.white ? "White" : "Black"}** is in check!`);

            return "Check";
        }
    }

    checkCheck = () => {
        const checkPawns = () => {
            let checkAreas;

            if (kingColour === "white") {
                checkAreas = [
                    letters[letters.indexOf(kingLocation[0]) - 1] + (kingLocation[1] + 1),
                    letters[letters.indexOf(kingLocation[0]) + 1] + (kingLocation[1] + 1)
                ];
            } else {
                checkAreas = [
                    letters[letters.indexOf(kingLocation[0]) - 1] + (kingLocation[1] - 1),
                    letters[letters.indexOf(kingLocation[0]) + 1] + (kingLocation[1] - 1)
                ];
            }

            for (let i in checkAreas) {
                if (layout[checkAreas[i]]) {
                    if (
                        (layout[checkAreas[i]].name === "Pawn")
                        && (layout[checkAreas[i]].colour !== kingColour)
                    ) {
                        this.check = true;
                        return true;
                    };
                }
            }
        }

        const checkHorses = () => {
            const checkAreas = [
                [1, 2], [-1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, 1], [-2, -1]
            ];

            for (let i in checkAreas) {
                const checkX = letters[letters.indexOf(kingLocation[0]) + checkAreas[i][0]];
                const checkY = checkAreas[i][1] + parseInt(kingLocation[1]);
                const check = checkX + checkY;
                
                if (layout[check]) {
                    if (layout[check].name === "Horse") {
                        this.check = true;
                        return true;
                    }
                }
            }
        }

        const checkLineSquare = (x, y, piece, obj) => {
            if (layout[x + y]) {
                if ((layout[x + y].name === piece) || (layout[x + y].name === "Queen")) {
                    if (layout[x + y].colour !== kingColour) {
                        obj.preKingPiece = obj.kingPiece ? false : true;
                        obj.postKingPiece = obj.kingPiece ? true : false;

                        if (obj.postKingPiece && obj.kingPiece) return true;
                    }
                }
                else if (layout[x + y].name === "King") {
                    obj.kingPiece = true;
                    if (obj.preKingPiece && obj.kingPiece) return true;
                }
                else {
                    obj.preKingPiece = false;
                    obj.postKingPiece = false;
                }
            }
        }

        const checkStraightLines = () => {
            let pieceObj = {
                preKingPiece: false,
                kingPiece: false,
                postKingPiece: false
            };

            // scans horizontal line from king
            for (let x = 0; x <= 7; x++) {
                if (checkLineSquare(letters[x], parseInt(kingLocation[1]), "Rook", pieceObj)) {
                    this.check = true;
                    return true;
                }
            }
            
            pieceObj.preKingPiece = false;
            pieceObj.kingPiece = false;
            pieceObj.postKingPiece = false;

            // scans vertical line from king
            for (let y = 0; y <= 7; y++) {
                if (checkLineSquare(kingLocation[0], y, "Rook", pieceObj)) {
                    this.check = true;
                    return true;
                }
            }
        }

        const checkDiagonalLines = () => {
            let posPieceObj = {
                preKingPiece: false,
                kingPiece: false,
                postKingPiece: false
            };
            let negPieceObj = posPieceObj;

            // scans +x +y line
            for (let x = 0; x <= 7; x++) {
                for (let y = 1; y <= 8; y++) {
                    const diagonal = (
                        ((letters.indexOf(kingLocation[0]) - x) ** 2) === 
                        ((kingLocation[1] - y) ** 2)
                    );

                    if (diagonal) {
                        if ( // bottom left and positive right quadrants (+x +y line)
                            ((x < letters.indexOf[kingLocation[0]]) && (y < parseInt(kingLocation[1]))) ||
                            ((x > letters.indexOf[kingLocation[0]]) && (y > parseInt(kingLocation[1])))
                        ) {
                            if (checkLineSquare(letters[x], y, "Bishop", posPieceObj)) {
                                this.check = true;
                                return true;
                            }
                        }
                        else if (x === letters.indexOf(kingLocation[1])) {
                            if (checkLineSquare(letters[x], y, "Bishop", posPieceObj)) {
                                this.check = true;
                                return true;
                            }
                            if (checkLineSquare(letters[x], y, "Bishop", negPieceObj)) {
                                this.check = true;
                                return true;
                            }
                        }
                        else { // top left and bottom right quadrants (+x -y line)
                            if (checkLineSquare(letters[x], y, "Bishop", negPieceObj)) {
                                this.check = true;
                                return true;
                            }
                        }
                    }
                }
            }
        }

        this.check = false;
        const layout = this.board.layout;
        const kingColour = this.turn === this.players.white ? "black" : "white";

        // gets location of king
        let kingLocation;
        for (let i in layout) {
            try {
                if (layout[i].name === "King") {
                    if (layout[i].colour === kingColour) {
                        kingLocation = i;

                        break;
                    }
                }
            } catch {}
        }

        if (checkPawns()) return;
        if (checkHorses()) return;
        if (checkStraightLines()) return;
        if (checkDiagonalLines()) return;
    }

    checkWin = () => {
        const layout = this.board.layout;

        // gets location of white and black kings
        let whiteKing = null;
        let blackKing = null;
        for (let i in layout) {
            try {
                if (layout[i].name === "King") {
                    if (layout[i].colour === "white") {
                        whiteKing = true;
                    } else if (layout[i].colour === "black") {
                        blackKing = true;
                    }
                } 
            } catch (error) {}
        }

        // if either white or black king cannot be found on board then someone has won
        if (!(whiteKing && blackKing)) {
            this.winner = !whiteKing ? this.players.white : this.players.black;
            return true;
        }

        return false;
    }
}

module.exports = Game;
