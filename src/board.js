const pieces = require("./pieces.js");


class Board {
    constructor() {
        this.layout = this.initialLayout();
    }

    initialLayout = () => {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

        let layout = [];
        let pawns = [];
        const horses = ["b1", "g1", "b8", "g8"];
        const rooks = ["a1", "h1", "a8", "h8"];
        const bishops = ["c1", "f1", "c8", "f8"];
        const queens = ["d1", "d8"];
        const kings = ["e1", "e8"];

        // adds initial pawn locations to pawns array
        for (const i in letters) {
            pawns.push(`${letters[i]}2`);
            pawns.push(`${letters[i]}7`);
        }

        // assigns locations and piece to layout array
        for (const i in numbers) {
            for (const j in letters) {
                const location = letters[j] + numbers[i];
                const colour = i > 3 ? "black" : "white";
                let piece;
                    
                if (pawns.includes(location)) {
                    piece = new pieces.Pawn(colour);
                } else if (horses.includes(location)) {
                    piece = new pieces.Horse(colour);
                } else if (rooks.includes(location)) {
                    piece = new pieces.Rook(colour);
                } else if (bishops.includes(location)) {
                    piece = new pieces.Bishop(colour);
                } else if (queens.includes(location)) {
                    piece = new pieces.Queen(colour);
                } else if (kings.includes(location)) {
                    piece = new pieces.King(colour);
                } else {
                    piece = null;
                }

                layout[location] = piece;
            }
        }

        return layout;
    }
}

module.exports = Board;