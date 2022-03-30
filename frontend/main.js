const Discord = require('discord.js');

const Bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const prefix = "!";
let queries = [];

Bot.once('ready', () => {
	console.log("C3 Bot is online!");
	const testQueryInsert = ["Test Query", '{  "WHERE": {    "EQ": {      "rooms_seats": 0    }  },  "OPTIONS": {    "COLUMNS": [      "rooms_name"    ]  }}'];

	queries.push(testQueryInsert);
})

Bot.on('message', message => {
	if(!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/)
	const command = args.shift().toLowerCase();

	let answered;
	let answered2;
	let answered3;
	let answered4;

	if (command === "menu") {
		handleDiscordChat();
		mainMenu();
	}

	function mainMenu() {
		answered = false;
		message.channel.send('Please choose an option:');
		message.channel.send('[1] Add query \n[2] List queries \n[3] Run Query \n');
		Bot.on('message', async message => {
			if (answered) return;
			const args = message.content.split(/ +/)
			const command = args.shift().toLowerCase();

			if (command === '1') {
				answered = true;
				return handleAddQuery();
			}
			if (command === '2') {
				answered = true;
				return handleAddQuery();
			}
			if (command === '3') {
				answered = true;
				return handleRunQuery();
			}
		})
	}

	function handleAddQuery() {
		answered2 = false;
		message.channel.send("Please insert a unique query name: ");
		Bot.on('message', async message => {
			if(message.author.bot || answered2) return;
			answered2 = true;
			handleQueryFile(message.content);
		});
	}

	function handleQueryFile(name) {
		answered3 = false;
		message.channel.send("Please input JSON query: ");
		Bot.on('message', async message => {
			if (message.author.bot || answered3) return;
			// Todo: Base 64 query insert?
			const args = message.content.replace(/(\r\n|\n|\r)/gm, "");
			const queryInsert = [name, args];
			queries.push(queryInsert);
			answered3 = true;
			message.channel.send("The query: " + queryInsert[0] + " was added successfully!!")
			handleDiscordChat();
		});
	}

	function handleListQuery() {
		message.channel.send("Loading currently added queries... ");
		for (let i = 0; i < queries.length; i++) {
			message.channel.send("[" + (i + 1) + "] " + queries[i][0]);
		}
		message.channel.send("Complete!");
	}

	function handleRunQuery() {
		answered4 = false;
		handleListQuery();
		message.channel.send("Please select a query to run: ");
		Bot.on('message', async message => {
			if(message.author.bot || answered4) return;
			answered4 = true;
			const args = message.content.split(/ +/)
			const command = args.shift().toLowerCase();

			for (let i = 0; i < queries.length; i++) {
				if (command === String(i + 1)) {
					answered4 = true;
					return requestQueryResults(queries[i])
				}
			}
		});
	}

	function requestQueryResults(query) {
		message.channel.send("You have selected the query: " + query[0]);
		message.channel.send("Not Implemented Yet");
		// Todo: run the actual query and send back feedback
	}

	function handleDiscordChat() {
		message.channel.messages.fetch({Limit: 1}).then(messages => {
			message.channel.bulkDelete(messages);
		})
	}
})


Bot.login("OTU2Mzc3MDkzNTM1NTkyNTIw.YjvVkw.5_dLh2fVvzB0hq2QLWxH7QqLOeI");
