const Discord = require("discord.js");
const Game = require("./game.js");
const client = new Discord.Client();


function getUserFromMention(mention) {
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
    if (message.content.startsWith(";;c ")) {
        command = message.content[4];

        switch (command) {
            case "g":
                const white = {
                    id: message.author.id,
                    username: message.author.username
                };
                const black = {
                    id: getUserFromMention(message.content.substr(6)).id,
                    username: getUserFromMention(message.content.substr(6)).username
                };

                const game = new Game(white, black);
                message.channel.send(game.render());


                const filter = m => m.author.id === white.id || black.id;
                const collector = message.channel.createMessageCollector(filter)
                firstMessage = true;

                collector.on("collect", m => {
                    // ignores the board message
                    if (m.content.startsWith("White is ")) {
                        return;
                    };

                    // ignores move if it isn't your turn
                    if (m.author.id !== game.getTurn()) {
                        return;
                    }

                    piece = m.content.substr(0, 2);
                    destination = m.content.substr(3, 2);

                    response = game.move(piece, destination);
                    if (response) {
                        m.channel.send(`${response} ${m.author.toString()}`);
                    }
                })

                break;

            default:
                message.channel.send("Command not recognised");
        }
    }
});


client.login('Nzc2NDk3NTE2OTA0MTg1ODY4.X61vqg.y1ks9k1Ky7jOOGUS2eJuwVTWM68');
