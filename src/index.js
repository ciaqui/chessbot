const Discord = require("discord.js");
const Game = require("./game.js");
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
    if (message.content.startsWith("!chess")) {
        opponent = message.content.substr(7);

        const white = message.author;
        let black;
        try {
            black = getUserFromMention(opponent)
        } catch (error) {
            message.channel.send("You need to mention an opponent after the command (e.g. !chess @user)");
            return;
        }

        const game = new Game(message.author, getUserFromMention(opponent));

        message.channel.send(game.render());

        const filter = m => m.author.id === white.id || black.id;
        const collector = message.channel.createMessageCollector(filter)
        firstMessage = true;

        collector.on("collect", m => {
            // ignores any messages from the bot
            if (m.author.bot) return;

            // checks for command to quit game
            if (m.content.startsWith("!quit")) {
                collector.stop();
                m.channel.send("Game has quit");
                
                return;
            }

            // ignores move if it isn't your turn
            // if (m.author.id !== game.turn) {
            //     return;
            // }

            const pieceDestination = m.content.split(" ");
            const piece = pieceDestination[0];
            const destination = pieceDestination[1];

            response = game.move(piece, destination);
            if (response) {
                m.channel.send(`${response} ${m.author.toString()}`);
            } else {
                // checks if either player has won the game, stops the game if they have
                if (game.checkWin()) {
                    collector.stop();
                }
                
                m.channel.send(game.render());
            }
        });
    }
});


client.login('Nzc2NDk3NTE2OTA0MTg1ODY4.X61vqg.y1ks9k1Ky7jOOGUS2eJuwVTWM68');
