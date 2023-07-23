import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
const { Client, IntentsBitField } = Discord;

let config = {
	TOKEN: process.env.BOT_TOKEN,
	CLIENT_ID: process.env.CLIENT_ID,
	API_KEY: process.env.API_KEY,
	CLIENT: new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
			IntentsBitField.Flags.GuildVoiceStates,
			IntentsBitField.Flags.GuildPresences,
		],
	}),
	LYRICS_KEY: process.env.LYRICS_KEY
};

export default config;
