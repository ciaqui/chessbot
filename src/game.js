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
        this.takenPieces = [];
        this.message = message;
        this.waitPromotion = false;
        this.promotionPiece = null;
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

        renderArray.splice(999, 0, "\n  ｜＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n         *a         b         c         d          e         f          g          h*");

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

        // checks if piece if pawn and is attacking diagonally
        if (pieceClass.name === "Pawn") {
            if ((this.board.layout[destination]) && piece[0] === destination[0]) {
                return "Pawns can only take pieces diagonally";
            } else if (piece[0] !== destination[0]) {
                if (!this.board.layout[destination]) {
                    return `Pawn cannot move to ${destination}`;
                }
            }
        }

        // moves the piece
        const movePiece = this.board.layout[piece];
        this.board.layout[piece] = null;
        this.board.layout[destination] = movePiece;

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