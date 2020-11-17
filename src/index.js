const Discord = require("discord.js");
const Game = require("./game.js");
const { Queen, Horse, Rook, Bishop } = require("./pieces.js");
const client = new Discord.Client();


const getUserFromMention = (mention) => {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    message.content = message.content.trim();
    if (message.content.startsWith("!chess")) {
        opponent = message.content.substr(7);

        let black;
        try {
            black = getUserFromMention(opponent)
        } catch (error) {
            message.channel.send("You need to mention an opponent after the command (e.g. !chess @user)");
            return;
        }

        // you can't play against the bot
        if (black.bot) {
            message.channel.send("You can't play against the bot, go find some friends instead :face_with_raised_eyebrow:")
            return;
        }


        const game = new Game(message.author, black, message);

        message.channel.send(game.render());

        // makes sure that only the person who's turn it is can enter a move
        const filter = m => m.author.id === game.turn.id;

        const collector = message.channel.createMessageCollector(filter);
        collector.on("collect", m => {
            // ignores any messages from the bot
            if (m.author.bot) return;

            // checks if input is for a promotion
            if (game.waitPromotion) {
                m.content = m.content.trim()

                const colour = game.turn.id === game.players.white.id ? "white" : "black";
                switch (m.content) {
                    case "q":
                        game.board.layout[game.promotionPiece] = new Queen(colour);
                        game.waitPromotion = false;
                        m.channel.send(game.render());
                        return;

                    case "h":
                        game.board.layout[game.promotionPiece] = new Horse(colour);
                        game.waitPromotion = false;
                        m.channel.send(game.render());
                        return;

                    case "r":
                        game.board.layout[game.promotionPiece] = new Rook(colour);
                        game.waitPromotion = false;
                        m.channel.send(game.render());
                        return;

                    case "b":
                        game.board.layout[game.promotionPiece] = new Bishop(colour);
                        game.waitPromotion = false;
                        m.channel.send(game.render());
                        return;
                    
                    default:
                        m.channel.send(`${m.content} is not a valid input, must be q, h, r, or b`);
                }
            }

            // checks for command to quit game
            if (m.content.startsWith("!quit")) {
                collector.stop();
                m.channel.send("Game has quit");
                
                return;
            }

            if (!game.waitPromotion) {
                // moves the piece to destination
                const pieceDestination = m.content.split(" ");
                const piece = pieceDestination[0];
                const destination = pieceDestination[1];

                response = game.move(piece, destination);
                if (response) {
                    if (response === "Promotion" || response === "Check") return;
                    m.channel.send(`${response} ${m.author.toString()}`); 
                } 
                else {
                    // checks if either player has won the game, stops the game if they have
                    if (game.winner) {
                        collector.stop();
                    }
                    
                    m.channel.send(game.render());
                }
            }
        });
    }
});


client.login('Nzc2NDk3NTE2OTA0MTg1ODY4.X61vqg.y1ks9k1Ky7jOOGUS2eJuwVTWM68');
