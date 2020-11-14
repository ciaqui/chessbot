const letters =  ["a", "b", "c", "d", "e", "f", "g", "h"];
const lettersDict = {1: "a", 2: "b", 3: "c", 4: "d", 5: "e", 6: "f", 7: "g", 8: "h"};


class Piece {
    constructor(colour) {
        this.colour = colour;
    }

    getIcon = () => {
        return this.icon;
    }

    getDiff = (piece, destination) => {
        const pieceX = letters.indexOf(piece[0]);
        const pieceY = piece[1];
        const destinationX = letters.indexOf(destination[0]);
        const destinationY = destination[1];

        const diffX = destinationX - pieceX;
        const diffY = destinationY - pieceY;

        return { x: diffX, y: diffY };
    }

    checkStraightLine = (diff) => {
        if (diff.x !== 0) {
            if (diff.y !== 0) return false;
        } else {
            if (diff.x !== 0) return false;
        }

        return true;
    }

    checkDiagonalLine = (diff) => {
        if (diff.x === diff.y) return true;
        if (diff.x === 0 - diff.y) return true;
        if (diff.y === 0 - diff.x) return true;

        return false;
    }

    checkObstacle = (diff, piece) => {
        let checkAreas = [];

        switch (this.name) {
            case "Pawn":
                const x = piece[0]

                for (let y = 0; y < diff.y; y++) {
                    checkAreas.push(lettersDict[x] + y);
                }

                break;

            case "Horse":
                const positiveX = diff.x >= 0 ? true : false;
                const positiveY = diff.y >= 0 ? true : false;     

                // scans horizontally
                for (let x = 0; positiveX ? x < diff.x : x > diff.x; positiveX ? x++ : x--) {
                    const checkX = piece[0] + lettersDict[x];
                    checkAreas.push(checkX + diff.y);
                }
                
                // scans vertically
                for (let y = 0; positiveY ? y < diff.y : y > diff.x; positiveY ? y++ : y--) {
                    const checkY = piece[1] + y
                    checkAreas.push(lettersDict[diff.x], checkY);
                }

            case "Rook":
                movesVertically = diff.x === 0 ? false : true;
                
                // scans vertically
                for (let i = 0; i < movesVertically ? diff.y : diff.x; diff.y > 0 ? i++ : i--) {
                    if (movesVertically) {
                        const checkY = piece[1] + i
                        checkAreas.push(piece[0])
                    }
                }
        }
    }
}

class Pawn extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Pawn";
        this.icon = colour === "white" ? "♗" : "♟︎";
        this.moves = 0;
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // pawn cannot move horizontally
        if (diff.x !== 0) return false;

        // pawn cannot move backwards
        if (diff.y < 0) return false;

        // pawn can not move up more than 2
        if (diff.y > 2) return false;

        // pawn can only move up 2 if first move
        if (diff.y = 2 && this.moves !== 0) return false;

        this.moves++
        return true;
    }
}

class Horse extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Horse";
        this.icon = colour === "white" ? "♘" : "♞";
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // horse cannot move more than 2 in any direction
        if (diff.x > 2 || diff.y > 2) return false;

        // horse can only move in an L shape
        const shapes = [[1, 2], [-1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, 1], [-2, -1]];
        for (let i in shapes) {
            if ((shapes[i][0] === diff.x) && (shapes[i][1] === diff.y)) return true;
        }

        return false;
    }
}

class Rook extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Rook";
        this.icon = colour === "white" ? "♖" : "♜";
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // rook only move in one direction
        return this.checkStraightLine(diff);
    }
}

class Bishop extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Bishop";
        this.icon = colour === "white" ? "♗" : "♝";
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // bishop can only move in diagonals
        return this.checkDiagonalLine(diff);
    }
}

class Queen extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Queen";
        this.icon = colour === "white" ? "♕" : "♛";
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        const straight = this.checkStraightLine(diff);
        const diagonal = this.checkDiagonalLine(diff);

        // queen can only move in straight or diagonal lines
        if (straight || diagonal) return true;

        return false;
    }
}

class King extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "King";
        this.icon = colour === "white" ? "♔" : "♚";
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // king can't move than one in any direction
        if (-1 < diff.x || diff.y > 1) return false;

        return true;
    }
}


module.exports = {
    Pawn: Pawn,
    Horse: Horse,
    Rook: Rook,
    Bishop: Bishop,
    Queen: Queen,
    King: King
};