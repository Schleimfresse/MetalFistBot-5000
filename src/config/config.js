import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
const { Client, IntentsBitField } = Discord;

/**
 * configiration from the project
 */
let config = {
	/**
	 * Token of the discord bot
	 */
	TOKEN: process.env.BOT_TOKEN,
	/**
	 * Discord bot client id
	 */
	CLIENT_ID: process.env.CLIENT_ID,
	/**
	 * Riot games api key
	 */
	API_KEY: process.env.API_KEY,
	/**
	 * Twitch client id
	 */
	TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
	/**
	 * Twitch client secret
	 */
	TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
	/**
	 * Client instance of the discord bot
	 */
	CLIENT: new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.MessageContent,
			IntentsBitField.Flags.GuildVoiceStates,
			IntentsBitField.Flags.GuildPresences,
			IntentsBitField.Flags.DirectMessages,
		],
	}),
	/**
	 * Key of the Lyric api
	 */
	LYRICS_KEY: process.env.LYRICS_KEY,
	/**
	 * Spotify client id
	 */
	SP_CLIENTID: process.env.SP_CLIENT_ID,
	/**
	 * Spotify client secret
	 */
	SP_CLIENT_SECRET: process.env.SP_SECRET,
};

export default config;
