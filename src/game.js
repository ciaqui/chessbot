const Board = require("./board.js");


class Game {
    constructor(white, black) {
        this.board = new Board();
        this.players = {
            white, black
        };
        this.turn = this.players.white.id;
        this.winner = null;
    }

    getTurn = () => {
        return this.turn;
    }

    render = () => {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
        const layoutArray = this.board.getLayout();
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
                    rowStr += "";
                } else {
                   rowStr += `${layoutArray[location].getIcon()}       `; 
                }

                if ((j === 7) && (i !== 0)) {
                    rowStr += "\n  ｜  ―       ―       ―       ―       ―       ―       ―       ―"; //nbsp: ( )
                }

                counter++;
            }

            renderArray.splice(0, 0, rowStr);
        }

        renderArray.splice(999, 0, "  ｜＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿\n         a         b         c         d          e         f          g          h");

        let turn;
        if (this.players.white.id == this.turn) {
            turn = this.players.white.username;
        } else {
            turn = this.players.black.username;
        }

        renderArray.splice(0, 0, `White is ${this.players.white.username}, Black is ${this.players.black.username}.\n\n${turn}'s turn!\n`)

        return renderArray;
    }

    move = (piece, destination) => {
        console.log(this.board);

        // checks if a piece exists
        if (!this.board.layout[piece]) {
            return `There is no piece at ${piece}`;
        }

        // checks that the destination is valid
        if (!this.board.layout[destination]) {
            return "Invalid piece destination";
        }
    }
}

module.exports = Game;