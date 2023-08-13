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
	},
	{
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
				description: "The amount of messages to be deleted",
				type: 4,
				required: true,
			},
		],
	},
	{
		name: "pause",
		description: "Pause the currently playing music",
	},
	{
		name: "unpause",
		description: "Unpause the music",
	},
	{
		name: "resume",
		description: "Resume the music, equal to the `unpause` command",
	},
	/*{
		name: "seek",
		description: "Go to a specific time in the track.",
		options: [
			{
				name: "seconds",
				description:
					"Where to go in the track. For example, if 10 seconds is entered, the track moves to the 10th second.",
				type: 3,
				required: true,
			},
		],
	},*/
	{
		name: "skip",
		description: "Skip the current track",
	},
	{
		name: "shuffle",
		description: "Shuffle the current queue",
	},
	{
		name: "controls",
		description: "Provides a menu with various commands for music playback",
	},
	{
		name: "remindme",
		description: "Schedules a reminder that reminds you when the time is up",
		options: [
			{
				name: "in",
				description: "In how many minutes you should be reminded, e.g. if you enter 5, you will be reminded in 5 minutes",
				type: 4,
				required: true,
			},
		],
	},
	{
		name: "nowplaying",
		description: "Show information about the current playing track",
	},
	{
		name: "fact",
		description: "Random facts",
	},
	{
		name: "coinflip",
		description: "Do a coin flip where the result can be heads or tails",
	},
	{
		name: "avatar",
		description: "Show your or someone else's avatar",
		options: [
			{
				name: "user",
				description: "The user of who the avatar is to be shown",
				type: 6,
				required: true,
			},
		],
	},
	{
		name: "lyrics",
		description: "Retrieves the lyrics of the currently playing song",
	},
	/*{
		name: "filter",
		description: "Select a filter for the music. The filter is active until it is changed",
		options: [
			{
				name: "filter",
				description: 'The filter to be selected',
				type: 3,
				required: true,
				choices: [
					{ name: "No filter", value: "nofilter" },
					{ name: "NightCore", value: "nightcore" },
					{ name: "Hardtekk", value: "hardtekk" },
				],
			},
		],
	},*/
	{
		name: "jumb",
		description: "Jump to a specific position in the queue.",
		options: [
			{
				name: "to",
				description: "The index of the track to jump to.",
				type: 4,
				required: true,
			},
		],
	},
	{
		name: "queue",
		description: "Show the current queue of the tracks",
		options: [
			{
				name: "page",
				description: "The platform the link is from.",
				type: 4,
				required: false,
			},
		],
	},
	{
		name: "play",
		description: "Add a song to the queue. Only YouTube is supported",
		options: [
			{
				
				name: "platform",
				description: "The music platform",
				type: 3,
				required: true,
				choices: [
					{ name: "YouTube", value: "yt" },
					{ name: "Spotify", value: "sp" },
				]
			},
			{
				name: "url",
				description: "The music link to add",
				type: 3,
				required: true,
			},
			{
				name: "playlist",
				description: "Specify if you want to add a playlist",
				type: 5,
				required: false,
			},
		],
	},
	{
		name: "play-next",
		description: "Adds a song to the queue and plays it after the currently playing song",
		options: [
			{
				name: "url",
				description: "The link of the audio recource",
				type: 3,
				required: true,
			},
			{
				name: "playlist",
				description: "Specify if you want to add a playlist",
				type: 5,
				required: false,
			},
		],
	},
	{
		name: "nsfw",
		description: "Dirty pictures and nsfw content",
		options: [
			{
				name: "type",
				description: "Specify the type",
				type: 3,
				required: true,
				choices: [
					{ name: "nude", value: "lewd" },
					{ name: "hentai", value: "hentai" },
					{ name: "lesbian", value: "lesbian" },
					{ name: "anal", value: "anal" },
					{ name: "boobs", value: "boobs" },
				],
			},
		],
	},
	{
		name: "clear-dms",
		description: "Delete the direct messages (DMs) that the bot has sent you",
	},
];

const rest = new REST({ version: "10" }).setToken(config.TOKEN);

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();
