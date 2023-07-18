import Discord from "discord.js";
import { createWriteStream } from "fs";
const platforms = ["Spotify", "SoundCloud", "YouTube"];
import fetch from "node-fetch";
const { Client, IntentsBitField, EmbedBuilder, AttachmentBuilder } = Discord;
import { Player } from "discord-player";
import { join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";
import dotenv from "dotenv";
import "@discord-player/extractor";
dotenv.config();
const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.GuildPresences,
	],
});

//const player = new Player(client);
//await player.extractors.loadDefault();
let player;
let connection;
let title;
const api_key = process.env.API_KEY;

const champions = [
	{ name: "Aatrox" },
	{ name: "Ahri" },
	{ name: "Akali" },
	{ name: "Akshan" },
	{ name: "Alistar" },
	{ name: "Amumu" },
	{ name: "Anivia" },
	{ name: "Annie" },
	{ name: "Aphelios" },
	{ name: "Ashe" },
	{ name: "Aurelion Sol" },
	{ name: "Azir" },
	{ name: "Bard" },
	{ name: "Bel'Veth" },
	{ name: "Blitzcrank" },
	{ name: "Brand" },
	{ name: "Braum" },
	{ name: "Caitlyn" },
	{ name: "Camille" },
	{ name: "Cassiopeia" },
	{ name: "Cho'Gath" },
	{ name: "Corki" },
	{ name: "Darius" },
	{ name: "Diana" },
	{ name: "Draven" },
	{ name: "Dr. Mundo" },
	{ name: "Ekko" },
	{ name: "Elise" },
	{ name: "Evelynn" },
	{ name: "Ezreal" },
	{ name: "Fiddlesticks" },
	{ name: "Fiora" },
	{ name: "Fizz" },
	{ name: "Galio" },
	{ name: "Gangplank" },
	{ name: "Garen" },
	{ name: "Gnar" },
	{ name: "Gragas" },
	{ name: "Graves" },
	{ name: "Gwen" },
	{ name: "Hecarim" },
	{ name: "Heimerdinger" },
	{ name: "Illaoi" },
	{ name: "Irelia" },
	{ name: "Ivern" },
	{ name: "Janna" },
	{ name: "Jarvan IV" },
	{ name: "Jax" },
	{ name: "Jayce" },
	{ name: "Jhin" },
	{ name: "Jinx" },
	{ name: "Kai'Sa" },
	{ name: "Kalista" },
	{ name: "Karma" },
	{ name: "Karthus" },
	{ name: "Kassadin" },
	{ name: "Katarina" },
	{ name: "Kayle" },
	{ name: "Kayn" },
	{ name: "Kennen" },
	{ name: "Kha'Zix" },
	{ name: "Kindred" },
	{ name: "Kled" },
	{ name: "Kog'Maw" },
	{ name: "K'Sante" },
	{ name: "LeBlanc" },
	{ name: "Lee Sin" },
	{ name: "Leona" },
	{ name: "Lillia" },
	{ name: "Lissandra" },
	{ name: "Lucian" },
	{ name: "Lulu" },
	{ name: "Lux" },
	{ name: "Malphite" },
	{ name: "Malzahar" },
	{ name: "Maokai" },
	{ name: "Master Yi" },
	{ name: "Milio" },
	{ name: "Miss Fortune" },
	{ name: "Wukong" },
	{ name: "Mordekaiser" },
	{ name: "Morgana" },
	{ name: "Nami" },
	{ name: "Nasus" },
	{ name: "Nautilus" },
	{ name: "Neeko" },
	{ name: "Nidalee" },
	{ name: "Nilah" },
	{ name: "Nocturne" },
	{ name: "Nunu & Willump" },
	{ name: "Olaf" },
	{ name: "Orianna" },
	{ name: "Ornn" },
	{ name: "Pantheon" },
	{ name: "Poppy" },
	{ name: "Pyke" },
	{ name: "Qiyana" },
	{ name: "Quinn" },
	{ name: "Rakan" },
	{ name: "Rammus" },
	{ name: "Rek'Sai" },
	{ name: "Rell" },
	{ name: "Renata Glasc" },
	{ name: "Renekton" },
	{ name: "Rengar" },
	{ name: "Riven" },
	{ name: "Rumble" },
	{ name: "Ryze" },
	{ name: "Samira" },
	{ name: "Sejuani" },
	{ name: "Senna" },
	{ name: "Seraphine" },
	{ name: "Sett" },
	{ name: "Shaco" },
	{ name: "Shen" },
	{ name: "Shyvana" },
	{ name: "Singed" },
	{ name: "Sion" },
	{ name: "Sivir" },
	{ name: "Skarner" },
	{ name: "Sona" },
	{ name: "Soraka" },
	{ name: "Swain" },
	{ name: "Sylas" },
	{ name: "Syndra" },
	{ name: "Tahm Kench" },
	{ name: "Taliyah" },
	{ name: "Talon" },
	{ name: "Taric" },
	{ name: "Teemo" },
	{ name: "Thresh" },
	{ name: "Tristana" },
	{ name: "Trundle" },
	{ name: "Tryndamere" },
	{ name: "Twisted Fate" },
	{ name: "Twitch" },
	{ name: "Udyr" },
	{ name: "Urgot" },
	{ name: "Varus" },
	{ name: "Vayne" },
	{ name: "Veigar" },
	{ name: "Vel'Koz" },
	{ name: "Vex" },
	{ name: "Vi" },
	{ name: "Viego" },
	{ name: "Viktor" },
	{ name: "Vladimir" },
	{ name: "Volibear" },
	{ name: "Warwick" },
	{ name: "Xayah" },
	{ name: "Xerath" },
	{ name: "Xin Zhao" },
	{ name: "Yasuo" },
	{ name: "Yone" },
	{ name: "Yorick" },
	{ name: "Yuumi" },
	{ name: "Zac" },
	{ name: "Zed" },
	{ name: "Zeri" },
	{ name: "Ziggs" },
	{ name: "Zilean" },
	{ name: "Zoe" },
	{ name: "Zyra" },
];

const sendResponse = (interaction, content) => {
	interaction.reply(content);
};

const getSummonerId = async (region, summoner, api_key, interaction) => {
	try {
		const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
			summoner
		)}?api_key=${api_key}`;
		const response = await fetch(url);
		const data = await response.json();
		if (data.status.status_code === 404) {
			return sendResponse(interaction, `Summoner does not exist!`);
		}
		return data.id;
	} catch (error) {
		console.log(error);
		sendResponse(interaction, `Error retrieving summoner ID!`);
	}
};

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const { commandName, options } = interaction;
	if (commandName === "ping") {
		const sentTimestamp = Date.now();
		await interaction.reply("Pinging...");
		const ping = Date.now() - sentTimestamp;
		await interaction.editReply(`Pong! Latency: \`${ping}ms\``);
	}

	if (commandName === "help") {
	}

	if (commandName === "info") {
		
	}

	if (commandName === "serverinfo") {
		const guild = interaction.guild;
		if (!guild.available) {
			interaction.reply("Unable to retrieve server information.");
			return;
		}
		const serverIconURL = guild.iconURL({ dynamic: true, size: 4096 });
		const botAvatar = client.user.displayAvatarURL();
		const owner = await client.users.fetch(guild.ownerId);
		async function fetchMemberPresence() {
			const fetchedMembers = await guild.members.fetch({ withPresences: true });

			const onlineBotMembers = fetchedMembers.filter((member) => {
				const presenceStatus = member.presence?.status;
				return (
					member.user.bot === true &&
					(presenceStatus === "online" || presenceStatus === "idle" || presenceStatus === "dnd")
				);
			});

			const onlineTotalMembers = fetchedMembers.filter((member) => {
				const presenceStatus = member.presence?.status;
				return presenceStatus === "online" || presenceStatus === "idle" || presenceStatus === "dnd";
			});

			return { onlineBotMembers, onlineTotalMembers };
		}

		const { onlineBotMembers, onlineTotalMembers } = await fetchMemberPresence();

		const emojiCount = guild.emojis.cache.size;

		function convertVerificationLevelToString(level) {
			switch (level) {
				case 0:
					return "none";
				case 1:
					return "low";
				case 2:
					return "medium";
				case 3:
					return "high";
				case 4:
					return "highest";
				default:
					return "unknown";
			}
		}

		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | Serverinfo", iconURL: botAvatar })
			.setTitle(guild.name)
			.setThumbnail(serverIconURL)
			.addFields(
				{ name: "Owner", value: owner.username + `\n ${owner}`, inline: true },
				{ name: "Member", value: guild.memberCount.toString(), inline: true },
				{ name: "Server ID", value: guild.id, inline: true },
				{
					name: "Verification level",
					value: convertVerificationLevelToString(guild.verificationLevel),
					inline: true,
				},
				{ name: "Channels", value: guild.channels.cache.size.toString(), inline: true },
				{
					name: "Online",
					value: `${onlineTotalMembers.size.toString()} (${onlineBotMembers.size.toString()} bots)`,
					inline: true,
				},
				{ name: "Roles", value: guild.roles.cache.size.toString(), inline: true },
				{ name: "Emojis", value: emojiCount.toString(), inline: true },
				{ name: "System channel", value: guild.systemChannel.toString(), inline: true }
			)
			.setTimestamp(guild.createdAt)
			.setFooter({ text: "Server created on" });

		interaction.reply({ embeds: [Embed] });
	}

	if (commandName === "clear") {
		const amount = options.getString("amount");
		if (isNaN(amount)) return sendResponse(interaction, "Enter a valid value (number)");
		try {
			const fetched = await interaction.channel.messages.fetch({ limit: amount });
			const deletableMessages = fetched.filter(
				(message) => Date.now() - message.createdTimestamp < 1209600000
			);

			if (fetched.size === 0) {
				return sendResponse(interaction, "No messages found to delete.");
			}

			interaction.channel.bulkDelete(deletableMessages).then((messages) => {
				const deleteCount = messages.size;
				const notDeletedCount = amount - deleteCount;
				if (notDeletedCount === 0) {
					return sendResponse(interaction, `Deleted ${deleteCount} messages.`);
				}
				sendResponse(
					interaction,
					`${deleteCount} messages deleted. ${notDeletedCount} messages could not be deleted as they are older than 14 days.`
				);
			});
		} catch (err) {
			if (err.code === 50034) {
				sendResponse(interaction, "Messages cannot be deleted as they are older than 14 days.");
			} else {
				sendResponse(interaction, "An error occurred while deleting messages.");
			}
		}
	}

	if (commandName === "add") {
		interaction.deferReply("Processing data...");
		const platform = options.getString("platform");
		const link = options.getString("link");

		if (!platforms.includes(platform)) {
			return sendResponse(interaction, "Invalid platform.");
		}

		const channel = interaction.member.voice.channel;

		if (!channel) {
			return sendResponse(interaction, "You must be in a voice channel to use this command.");
		}

		if (!channel.joinable || !channel.speakable) {
			return sendResponse(interaction, "I cannot join or speak in your voice channel.");
		}

		connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		try {
			player = createAudioPlayer();
			connection.subscribe(player);
			const stream = ytdl(link, {
				filter: "audioonly",
			});
			const info = await ytdl.getInfo(link);
			title = info.videoDetails.title;
			const outputFilePath = `src/${title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")}.mp3`;
			const outputStream = createWriteStream(outputFilePath);

			await new Promise((resolve, reject) => {
				stream.pipe(outputStream);

				stream.on("end", () => {
					console.log("Stream download finished");
					resolve();
				});

				stream.on("error", (error) => {
					console.error("Error occurred during stream download:", error);
					reject(error);
				});

				stream.on("data", (chunk) => {
					console.log("DATA:", chunk);
				});

				outputStream.on("error", (error) => {
					console.error("Error occurred during write stream:", error);
					reject(error);
				});
			});

			const resource = createAudioResource(outputFilePath, {
				buffer: 5 * 1024 * 1024,
			});

			player.play(resource);

			const thumbnailURL = info.videoDetails.thumbnails[0].url;
			const botAvatar = client.user.displayAvatarURL();

			const videoLengthSeconds = parseInt(info.videoDetails.lengthSeconds);
			const hours = Math.floor(videoLengthSeconds / 3600);
			const minutes = Math.floor((videoLengthSeconds % 3600) / 60);
			const seconds = videoLengthSeconds % 60;

			const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

			const Embed = new EmbedBuilder()
				.setColor(0xffcc00)
				.setAuthor({ name: "MetalFistBot 5000 | Music", iconURL: botAvatar })
				.setTitle(title)
				.setURL(info.videoDetails.video_url)
				.setThumbnail(thumbnailURL)
				.addFields(
					{ name: "Duration", value: formattedDuration, inline: true },
					{ name: "Requested by", value: interaction.user.username, inline: true }
				)
				.setTimestamp(interaction.createdTimestamp);

			interaction.editReply({ embeds: [Embed]});
		} catch (error) {
			console.error(error);
			sendResponse(interaction, "An error occurred while trying to play the music.");
		}
	}

	if (commandName === "leave") {
		const guild = interaction.guild;
		const bot = guild.members.cache.get(client.user.id);

		if (!bot.voice.channel) {
			sendResponse(interaction, "I'm not even in a voice channel dumb ass");
			return;
		}
		player.stop();
		connection.destroy();
		sendResponse(interaction, "Music stopped, I have left the voice channel!");
	}

	if (commandName === "stop") {
		const guild = interaction.guild;
		const bot = guild.members.cache.get(client.user.id);

		if (!bot.voice.channel) {
			sendResponse(interaction, "I'm not even in a voice channel dumb ass");
			return;
		}

		player.stop();
		sendResponse(interaction, "Music stopped!");
	}

	if (commandName === "pause") {
		if (!player.pause()) {
			sendResponse(interaction, `Cannot pause already paused track!`);
			return;
		}
		player.pause();
		sendResponse(interaction, `Paused, the current track \`${title}\``);
	}
	if (commandName === "unpause" || commandName === "resume") {
		if (!player.unpause()) {
			sendResponse(interaction, `Cannot unpause already playing track!`);
			return;
		}
		player.unpause();
		sendResponse(interaction, `Unpaused, resuming with the track \`${title}\``);
	}
	if (commandName === "masterypoints") {
		const region = options.getString("region");
		const summoner = options.getString("summoner");
		const champ = options.getString("champion");
		const found = champions.find((element) => element.name === champ);
		if (!found) return sendResponse(interaction, `Champion ${champ} does not exist!`);
		const url = `http://ddragon.leagueoflegends.com/cdn/13.13.1/data/en_US/champion/${champ}.json`;
		const response = await fetch(url);
		const data = await response.json();
		const key = parseInt(data.data[champ].key);
		console.log(key);

		const getMasteryPoints = async () => {
			try {
				const summonerId = await getSummonerId(region, summoner, api_key, interaction);
				console.log(summonerId);
				const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${api_key}`;
				const response = await fetch(url);
				const data = await response.json();
				const FindChamp = data.find((e) => {
					return e.championId == key;
				});
				if (FindChamp === undefined) {
					sendResponse(interaction, `Summoner **${summoner}** never played the champion **${champ}**`);
				}
				const MasteryPoints = FindChamp.championPoints;
				const formattedMasteryPoints = MasteryPoints.toLocaleString("en-US");
				sendResponse(
					interaction,
					`Summoner **${summoner}** has a total of **${formattedMasteryPoints}** mastery points on **${champ}**`
				);
			} catch (error) {
				console.log(error);
				sendResponse(interaction, `Error retrieving mastery points!`);
			}
		};

		getMasteryPoints();
	}

	if (commandName === "totalmasterypoints") {
		const region = options.getString("region");
		const summoner = options.getString("summoner");

		const getMasteryPoints = async () => {
			try {
				const summonerId = await getSummonerId(region, summoner, api_key, interaction);
				console.log(summonerId);
				const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${api_key}`;
				const response = await fetch(url);
				const data = await response.json();
				console.log(data);
				let TotalMasteryPoints = 0;
				for (let entry of data) {
					TotalMasteryPoints += entry.championPoints;
				}
				const formattedMasteryPoints = TotalMasteryPoints.toLocaleString("en-US");
				sendResponse(
					interaction,
					`Summoner ${summoner} has a total of ${formattedMasteryPoints} mastery points.`
				);
			} catch (error) {
				console.log(error);
				sendResponse(interaction, `Error retrieving mastery points!`);
			}
		};

		getMasteryPoints();
	}
});

client.login(process.env.BOT_TOKEN);
