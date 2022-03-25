const Discord = require('discord.js');

const Bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

Bot.once('ready', () => {
	console.log("C3 Bot is online!");
})


Bot.login("OTU2Mzc3MDkzNTM1NTkyNTIw.YjvVkw.5_dLh2fVvzB0hq2QLWxH7QqLOeI");
