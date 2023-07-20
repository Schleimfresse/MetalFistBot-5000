import config from "./config/config.js";
import { REST, Routes } from "discord.js";

const commands = [
	{
		name: "ping",
		description: "Measures the latency of the bot",
	},
	{
		name: "botinfo",
		description: "Information about the bot",
	},{
		name: "serverinfo",
		description: "Information about the server",
	},
	{
		name: "help",
		description: "Help for all commands which the bot offers",
	},
	{
		name: "masterypoints",
		description: "Get the total mastery points from a champion from a summoner",
		options: [
			{
				name: "region",
				description: "The region from the summoner",
				type: 3,
				required: true,
				choices: [
					{ name: "BR", value: "BR1" },
					{ name: "EUN", value: "EUN1" },
					{ name: "EUW", value: "EUW1" },
					{ name: "JP", value: "JP1" },
					{ name: "KR", value: "KR" },
					{ name: "LA1", value: "LA1" },
					{ name: "LA2", value: "LA2" },
					{ name: "NA", value: "NA1" },
					{ name: "OC", value: "OC1" },
					{ name: "PH", value: "PH2" },
					{ name: "RU", value: "RU" },
					{ name: "SG", value: "SG2" },
					{ name: "TH", value: "TH2" },
					{ name: "TR", value: "TR1" },
					{ name: "TW", value: "TW2" },
					{ name: "VN", value: "VN2" },
				],
			},
			{
				name: "summoner",
				description: "The name of the summoner",
				type: 3,
				required: true,
			},
			{
				name: "champion",
				description: "The champion of the summoner whose Mastery Points are to be sought.",
				type: 3,
				required: true,
			},
		],
	},
	{
		name: "totalmasterypoints",
		description: "Get the total mastery points from a summoner",
		options: [
			{
				name: "region",
				description: "The region from the summoner",
				type: 3,
				required: true,
				choices: [
					{ name: "BR", value: "BR1" },
					{ name: "EUN", value: "EUN1" },
					{ name: "EUW", value: "EUW1" },
					{ name: "JP", value: "JP1" },
					{ name: "KR", value: "KR" },
					{ name: "LA1", value: "LA1" },
					{ name: "LA2", value: "LA2" },
					{ name: "NA", value: "NA1" },
					{ name: "OC", value: "OC1" },
					{ name: "PH", value: "PH2" },
					{ name: "RU", value: "RU" },
					{ name: "SG", value: "SG2" },
					{ name: "TH", value: "TH2" },
					{ name: "TR", value: "TR1" },
					{ name: "TW", value: "TW2" },
					{ name: "VN", value: "VN2" },
				],
			},
			{
				name: "summoner",
				description: "The name of the summoner",
				type: 3,
				required: true,
			},
		],
	},
	{
		name: "leave",
		description: "Let the bot disconnect from the voice channel",
	},
	{
		name: "clear",
		description: "Clear messages from a text channel",
		options: [
			{
				name: "amount",
				description: "The amount of messages to be deleted.",
				type: 3,
				required: true,
			},
		],
	},
	{
		name: "stop",
		description: "Stop the currently playing music",
	},
	{
		name: "pause",
		description: "Pause the currently playing music",
	},
	{
		name: "unpause",
		description: "Unpause the music, equal to the `resume` command",
	},
	{
		name: "resume",
		description: "Resume the music, equal to the `unpause` command",
	},
	{
		name: "add",
		description: "Add a music link to the queue.",
		options: [
			{
				name: "platform",
				description: "The platform the link is from.",
				type: 3,
				required: true,
				choices: [
					{ name: "Spotify", value: "Spotify" },
					{ name: "SoundCloud", value: "SoundCloud" },
					{ name: "YouTube", value: "YouTube" },
				],
			},
			{
				name: "playlist",
				description: "Specify wether the url is for a playlist or not",
				type: 3,
				required: true,
				choices: [
					{ name: "True", value: "True" },
					{ name: "False", value: "False" },
				],
			},
			{
				name: "url",
				description: "The music link to add.",
				type: 3,
				required: true,
			},
		],
	},
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();
