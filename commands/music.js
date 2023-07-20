import config from "../config/config.js";
const client = config.CLIENT;
import { EmbedBuilder } from "discord.js";
import play from "play-dl";
const platforms = ["Spotify", "SoundCloud", "YouTube"];
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	StreamType,
	NoSubscriberBehavior,
} from "@discordjs/voice";
let player;
let connection;
let title;

async function addMusic(interaction, client) {
	const { options } = interaction;
	interaction.deferReply();
	const platform = options.getString("platform");
	const url = options.getString("url");
	const playlist_boolean = options.getString("playlist");

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

	try {
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		let player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});
		connection.subscribe(player);

		let stream = await play.stream(url, { quality: 2 });
		let yt_info = await play.video_info(url);

		let resource = createAudioResource(stream.stream, {
			inputType: stream.type,
		});

		player.play(resource);

		title = yt_info.video_details.title;
		const thumbnailURL = yt_info.video_details.thumbnails[0].url;
		const botAvatar = client.user.displayAvatarURL();
		const videoLengthSeconds = parseInt(yt_info.video_details.durationInSec);
		const hours = Math.floor(videoLengthSeconds / 3600);
		const minutes = Math.floor((videoLengthSeconds % 3600) / 60);
		const seconds = videoLengthSeconds % 60;
		console;
		const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | Music", iconURL: botAvatar })
			.setTitle(title)
			.setURL(yt_info.video_details.url)
			.setThumbnail(thumbnailURL)
			.addFields(
				{ name: "Duration", value: formattedDuration, inline: true },
				{ name: "Requested by", value: interaction.user.username, inline: true }
			)
			.setTimestamp(interaction.createdTimestamp);

		interaction.editReply({ embeds: [Embed] });
	} catch (error) {
		console.error(error);
		interaction.editReply("An error occurred while trying to play the music.");
	}
}

function leave(interaction) {
	console.log(interaction);
	const guild = interaction.guild;
	const bot = guild.members.cache.get(client.user.id);

	if (!bot.voice.channel) {
		interaction.reply("I'm not even in a voice channel dumb ass");
		return;
	}
	player.stop();
	connection.destroy();
	interaction.reply("Music stopped, I have left the voice channel!");
}

function stop(interaction) {
	const guild = interaction.guild;
	const bot = guild.members.cache.get(client.user.id);

	if (!bot.voice.channel) {
		interaction.reply("I'm not even in a voice channel dumb ass");
		return;
	}

	player.stop();
	interaction.reply("Music stopped!");
}

function pause(interaction) {
	if (!player.pause()) {
		interaction.reply(`Cannot pause already paused track!`);
		return;
	}
	player.pause(interaction);
	interaction.reply(`Paused, the current track \`${title}\``);
}

function unpause(interaction) {
	if (!player.unpause()) {
		interaction.reply(`Cannot unpause already playing track!`);
		return;
	}
	player.unpause(interaction);
	interaction.reply(`Unpaused, resuming with the track \`${title}\``);
}

export default { addMusic, leave, stop, pause, unpause };
