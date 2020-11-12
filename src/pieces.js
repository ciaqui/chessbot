class Piece {
    constructor(colour) {
        this.colour = colour;
    }

    getIcon = () => {
        return this.icon;
    }
}

class Pawn extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♗" : "♟︎";
    }
}

class Horse extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♘" : "♞";
    }
}

class Rook extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♖" : "♜";
    }
}

class Bishop extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♗" : "♝";
    }
}

class Queen extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♕" : "♛";
    }
}

class King extends Piece {
    constructor(colour) {
        super(colour);
        this.icon = colour === "white" ? "♔" : "♚";
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