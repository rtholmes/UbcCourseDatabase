const Discord = require('discord.js');
const Bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const fetch = require("node-fetch");

const prefix = "!";

Bot.once('ready', () => {
	console.log("C3 Bot is online!");
})

Bot.on('messageCreate', message => {
	if(!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/)
	const command = args.shift().toLowerCase();

	if (command === "menu") {
		handleDiscordChat();
		mainMenu();
	}

	function mainMenu() {
		let answered1 = false;
		message.channel.send('Please choose an option number:');
		message.channel.send('[1] Add query \n[2] List queries \n[3] Run Query \n');
		Bot.on('messageCreate', async message => {
			if (answered1) return;
			const args = message.content.split(/ +/)
			const command = args.shift().toLowerCase();

			if (command === '1') {
				answered1 = true;
				return handleAddQuery();
			}
			if (command === '2') {
				answered1 = true;
				return handleListQuery();
			}
			if (command === '3') {
				answered1 = true;
				return handleRunQuery();
			}
		})
	}

	function handleAddQuery() {
		let answered2 = false;
		message.channel.send("Please insert a unique query name: ");
		Bot.on('messageCreate', async message => {
			if(message.author.bot || answered2) return;
			answered2 = true;
			handleQueryFile(message.content);
		});
	}

	function handleQueryFile(name) {
		let answered3 = false;
		message.channel.send("Please input JSON query: ");
		Bot.on('messageCreate', async message => {
			if (message.author.bot || answered3) return;
			let temp = btoa(message.content);
			let link = "http://localhost:4321/query/" + name + "/" + temp;
			answered3 = true;
			fetch(link, {
				method: 'PUT',
				body: "",
				headers: { 'Content-Type': 'application/json'}
				}).then(res => {
				message.channel.send("The query: " + name + " was added successfully!!")
				handleDiscordChat();
			});
		});
	}

	function handleListQuery() {
		let link = "http://localhost:4321/queries";
		fetch(link).then(res => {
			res.json().then(res1 => {
				let result = res1.result;
				for (let i = 0; i < result.length; i++) {
					message.channel.send("- " + result[i].toString());
				}
			});
		});
	}

	function handleRunQuery() {
		let answered4 = false;
		handleListQuery();
		message.channel.send("Please select a query name to run: ");
		Bot.on('messageCreate', async message => {
			if(message.author.bot || answered4) return;
			answered4 = true;
			const args = message.content.split(/ +/)
			const command = args.shift().toLowerCase();

			let fs = require('fs');
			let arr = [];
			let files = fs.readdirSync("../data/jsonFiles");
			for (let statsKey of files) {
				arr.push(statsKey);
			}

			for (let i = 0; i < arr.length; i++) {
				if (command === arr[i].toLowerCase()) {
					answered4 = true;
					return requestQueryResults(arr[i])
				}
			}
		});
	}

	function requestQueryResults(query) {
		message.channel.send("You have selected the query: " + query);
		let link = "http://localhost:4321/dataset/query/" + query;
		fetch(link).then(res => {
			res.json().then(res1 => {
				if (res.status >= 400) {
					message.channel.send("Error " + res1.error);
					return;
				}
				let result = atob(res1.result);
				const path = "../data/queryResults/" + query + ".txt";
				let fs = require('fs');
				fs.writeFileSync(path, result);
				message.channel.send({
					content: "Query Results: ",
					files: [
						"../data/queryResults/" + query + ".txt"
					]
				}).catch(err => {
					console.log("printing error:");
					console.log(err.toString());
				});
			})
		})
	}

	function handleDiscordChat() {
		message.channel.messages.fetch({Limit: 1}).then(messages => {
			message.channel.bulkDelete(messages);
		})
	}
})


Bot.login("OTU2Mzc3MDkzNTM1NTkyNTIw.YjvVkw.5_dLh2fVvzB0hq2QLWxH7QqLOeI");
