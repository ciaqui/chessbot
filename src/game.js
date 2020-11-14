const Board = require("./board.js");


const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];


class Game {
    constructor(white, black) {
        this.board = new Board();
        this.players = {
            white, black
        };
        this.turn = this.players.white;
        this.winner = null;
        this.takenPieces = [];
    }

    render = () => {
        const layoutArray = this.board.layout;
        let renderArray = [];
        
        let counter = 0;

        for (let i = 0; i < 8; i++) {
            let rowStr = "";
            rowStr += `${i + 1}｜  `;

            for (let j = 0; j < 8; j++) {
                // gets the location of the chess piece (h2, b7, etc.)
                const locationLetter = letters[counter % 8];
                const locationNumber = numbers[Math.floor(counter / 8)];
                const location = locationLetter + locationNumber;

                if (layoutArray[location] === null) {
                    rowStr += "     ";
                } else {
                   rowStr += `${layoutArray[location].getIcon()}`; 
                }
                
                // annoying text formatting because discord font is not monospaced
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

        renderArray.splice(999, 0, "\n  ｜＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n         a         b         c         d          e         f          g          h");

        let turn;
        if (this.players.white.id == this.turn) {
            turn = this.players.white.username;
        } else {
            turn = this.players.black.username;
        }

        if (this.winner) {
            renderArray.splice(0, 0, `${this.winner.toString()} is the winner!\n`);
        } else {
           renderArray.splice(0, 0, `White = ${this.players.white.username}\nBlack = ${this.players.black.username}\n\n${turn}'s turn!\n`);
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
                return `There is already a piece on ${destination}`;
            }            
        }

        // makes sure that the piece is allowed to move to the destination
        if (!this.board.layout[piece].verifyMove(piece, destination)) {
            return `${this.board.layout[piece].name} cannot move to ${destination}`;
        }

        // if (!this.checkObstacle(piece, destination)) return "There are pieces in the way";

        // moves the piece
        const movePiece = this.board.layout[piece];
        this.board.layout[piece] = null;
        this.board.layout[destination] = movePiece;

        // switches the turn
        this.turn = this.turn === this.players.white ? this.players.black : this.players.white;
    }

    // true = no obstacles, false = obstacles
    // checkObstacle = (piece, destination) => {
    //     // horses disregard obstacles
    //     if (this.board.layout[piece].name === "Horse") {
    //         return true
    //     }
// 
    //     // retrives the difference between piece and destination
    //     const pieceX = letters.indexOf(piece[0]);
    //     const pieceY = piece[1];
    //     const destinationX = letters.indexOf(destination[0]);
    //     const destinationY = destination[1];
// 
    //     const diffX = destinationX - pieceX;
    //     const diffY = destinationY - pieceY;
// 
    //     // checks horizontally for pieces in the way
    //     const checkY = piece[1];
    //     for (let i = 0; i < diffX; i++) {
    //         console.log(i);
    //     }
    //     
    //     // checks vertically for pieces in th way
    //     const checkX = piece[0];
    //     for (let i = 0; i < diffY; i++) {
    //         const checkY = piece[1] + i;
    //         const check = checkX + checkY;
// 
    //         if (this.board.layout[check]) {
    //             return false;
    //         }
    //     }
// 
    //     return true;
    // }

    checkWin = () => {
        const layout = this.board.layout;

        // gets location of white na black kings
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

        if (!(whiteKing && blackKing)) {
            this.winner = !whiteKing ? this.players.white : this.players.black;
            return true;
        }

        return false;
    }
}

module.exports = Game;