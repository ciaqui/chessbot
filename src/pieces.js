const letters =  ["a", "b", "c", "d", "e", "f", "g", "h"];


class Piece {
    constructor(colour) {
        this.colour = colour;
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

    // returns an array of squares that should be checked for obstacles in the way
    checkObstacles = (piece, destination) => {
        const straightLine = (piece, destination) => {
            const movesVertically = diff.x === 0;
                
            // scans vertically
            if (movesVertically) {
                const movesPositively = diff.y > 0;

                if (movesPositively) {
                    for (let y = piece[1]; y < destination[1]; y++) {
                        checkAreas.push(piece[0] + y);
                    }
                } else {
                    for (let y = piece[1]; y > destination[1]; y--) {
                        checkAreas.push(piece[0] + y);
                    }
                }
            } else { // scans horizontally
                const movesPositively = diff.x > 0;
                
                if (movesPositively) {
                    for (let x = letters.indexOf(piece[0]); x < letters.indexOf(destination[0]); x++) {
                        checkAreas.push(letters[x] + piece[1]);
                    }
                } else {
                    for (let x = letters.indexOf(piece[0]); x > letters.indexOf(destination[0]); x--) {
                        checkAreas.push(letters[x] + piece[1]);
                    }
                }

            }
        }

        const diagonalLine = (piece, destination) => {
            const posX = diff.x > 0 ? true : false;
            const posY = diff.y > 0 ? true : false;
            let checkDiffX;
            let checkDiffY;


            if (posX) {
                // positive X
                for (let x = letters.indexOf(piece[0]); x < letters.indexOf(destination[0]); x++) {
                    checkDiffX = x - letters.indexOf(piece[0]);
                    
                    if (posY) {
                        // positive X and positive Y
                        for (let y = piece[1]; y < destination[1]; y++) {
                            checkDiffY = y - piece[1];

                            // if square is on a diagonal
                            if (checkDiffX ** 2 === checkDiffY ** 2) {
                                checkAreas.push(letters[x] + y);
                            }
                        }
                    } else {
                        // positive X and negative Y
                        for (let y = piece[1]; y > destination[1]; y--) {
                            checkDiffY = y - piece[1];

                            // if square is on a diagonal
                            if (checkDiffX ** 2 === checkDiffY ** 2) {
                                checkAreas.push(letters[x] + y);
                            }
                        }
                    }
                }
            } else {
                // negative X
                for (let x = letters.indexOf(piece[0]); x > letters.indexOf(destination[0]); x--) {
                    checkDiffX = x - letters.indexOf(piece[0]);

                    if (posY) {
                        // negative X and positive Y
                        for (let y = piece[1]; y < destination[1]; y++) {
                            checkDiffY = y - piece[1];

                            // if square is on a diagonal
                            if (checkDiffX ** 2 === checkDiffY ** 2) {
                                checkAreas.push(letters[x] + y);
                            }
                        }
                    } else {
                        // negative X and negative Y
                        for (let y = piece[1]; y > destination[1]; y--) {
                            checkDiffY = y - piece[1];

                            // if square is on a diagonal
                            if (checkDiffX ** 2 === checkDiffY ** 2) {
                                checkAreas.push(letters[x] + y);
                            }
                        }
                    }
                }
            }
        }

        const diff = this.getDiff(piece, destination);
        let checkAreas = [];

        switch (this.name) {
            case "Pawn":
                straightLine(piece, destination);

                break;

            case "Rook":
                straightLine(piece, destination);

                break;
            
            case "Bishop":
                diagonalLine(piece, destination);

                break;
            
            case "Queen":
                // if queen is moving diagonally
                if (this.checkDiagonalLine(diff)) {
                    diagonalLine(piece, destination);
                } else { // if queen is moving on a straight line
                    straightLine(piece, destination);
                }

                break;
        }

        return checkAreas;
    }
}

class Pawn extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Pawn";
        this.icon = colour === "white" ? "**♟︎**" : "♙";
        this.moves = 0;
    }

    verifyMove = (piece, destination) => {
        const diff = this.getDiff(piece, destination);

        // pawn cannot move backwards or more than 2
        if (this.colour === "white") {
            if (!(0 < diff.y <= 2)) return false;
        } else {
            if (!((diff.y >= -2) || (diff.y < 0))) return false;
        }

        // pawn can only move up 2 if first move
        if ((diff.y === 2 || diff.y === -2) && this.moves !== 0) return false;

        this.moves++
        return true;
    }
}

class Horse extends Piece {
    constructor(colour) {
        super(colour);
        this.name = "Horse";
        this.icon = colour === "white" ? "**♞**" : "♘";
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
        this.icon = colour === "white" ? "**♜**" : "♖";
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
        this.icon = colour === "white" ? "**♝**" : "♗";
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
        this.icon = colour === "white" ? "**♛**" : "♕";
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
        this.icon = colour === "white" ? "**♚**" : "♔";
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