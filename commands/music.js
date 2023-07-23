import config from "../config/config.js";
const client = config.CLIENT;
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle } from "discord.js";
import Genius from "genius-lyrics";
import play from "play-dl";
const platforms = ["Spotify", "SoundCloud", "YouTube"];
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	NoSubscriberBehavior,
	AudioPlayerStatus,
} from "@discordjs/voice";
const LyricClient = new Genius.Client(config.LYRICS_KEY);
let player;
let connection;
let resource;
let isPlaying = false;
let queue = [];
const itemsPerPage = 15;

async function playNextTrack() {
	const track = queue[0];
	const { interaction } = track;
	if (isPlaying) return;
	isPlaying = true;
	try {
		player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play,
			},
		});

		const handleTrackEnd = async () => {
			queue.shift();
			if (queue.length === 0) {
				connection.destroy();
				return;
			}

			await playTrack(queue[0]);
		};

		player.on(AudioPlayerStatus.Idle, handleTrackEnd);

		connection.subscribe(player);

		await playTrack(track);
	} catch (error) {
		console.error(error);
		interaction.editReply("An error occurred while trying to play the music.");
	}
}

async function playTrack(track, skip) {
	const { interaction } = track;
	if (track.audioStream === null) {
		const stream = await play.stream(track.url, { quality: 2 });
		track.audioStream = stream;
	}

	resource = createAudioResource(track.audioStream.stream, {
		inputType: track.audioStream.type,
	});

	player.play(resource);

	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Music", iconURL: botAvatar })
		.setTitle(track.title)
		.setURL(track.url)
		.setThumbnail(track.thumbnail)
		.addFields(
			{ name: "Duration", value: track.duration, inline: true },
			{ name: "Requested by", value: track.user, inline: true }
		)
		.setTimestamp(interaction.createdTimestamp);

	if (skip === undefined) {
		interaction.channel.send({ embeds: [Embed], content: "Now playing" });
	} else {
		skip.reply({ embeds: [Embed], content: "Now playing" });
	}

	// Buffer the next track by downloading it entirely
	if (queue.length > 1) {
		const nextTrack = queue[1];

		try {
			queue[1].audioStream = await play.stream(nextTrack.url, { quality: 2 });
		} catch (error) {
			interaction.editReply("Error streaming the audio data");
			return;
		}
	}
}

function formatDuration(videoLengthSeconds) {
	const hours = Math.floor(videoLengthSeconds / 3600);
	const minutes = Math.floor((videoLengthSeconds % 3600) / 60);
	const seconds = videoLengthSeconds % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;
}

async function addMusic(interaction) {
	await interaction.deferReply();
	const { options } = interaction;
	const platform = options.getString("platform");
	const url = options.getString("url");
	const playlist_boolean = options.getBoolean("playlist");

	const channel = interaction.member.voice.channel;

	if (!channel) {
		return interaction.editReply("You must be in a voice channel to use this command.");
	}

	if (!channel.joinable || !channel.speakable) {
		return interaction.editReply(" cannot join or speak in your voice channel.");
	}

	if (!platforms.includes(platform)) {
		return interaction.editReply("Invalid platform.");
	}

	connection = joinVoiceChannel({
		channelId: interaction.member.voice.channel.id,
		guildId: interaction.guild.id,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});

	if (playlist_boolean === true) {
		addPlaylistToQueue(url, interaction);
	} else {
		try {
			let yt_info;
			try {
				yt_info = await play.video_info(url);
			} catch {
				return interaction.editReply("Error fetching music data. Make sure you enter a valid link.");
			}
			const videoLengthSeconds = yt_info.video_details.durationInSec;

			const formattedDuration = formatDuration(videoLengthSeconds);

			const track = {
				title: yt_info.video_details.title,
				thumbnail: yt_info.video_details.thumbnails[0].url,
				artist: yt_info.video_details.channel.name,
				url: yt_info.video_details.url,
				duration: formattedDuration,
				unformattedDuration: videoLengthSeconds,
				user: interaction.user.username,
				interaction: interaction,
				audioStream: null,
			};

			queue.push(track);
			interaction.editReply(`Added to the queue: **${track.title}**, by ${track.user}`);
			if (!isPlaying) {
				playNextTrack();
			}
			if (queue[1]?.audioStream === null) {
				const nextTrack = queue[1];
				try {
					queue[1].audioStream = await play.stream(nextTrack.url, { quality: 2 });
				} catch (error) {
					interaction.editReply("Error streaming the audio data");
					return;
				}
			}
		} catch (error) {
			console.error(error);
			interaction.editReply("An error occurred while trying to play the music.");
		}
	}
}

async function addPlaylistToQueue(url, interaction) {
	try {
		const playlist = await ytpl(url);

		for (const video of playlist.items) {
			const track = {
				title: video.title,
				artist: yt_info.video_details.channel.name,
				thumbnail: video.bestThumbnail.url,
				url: video.shortUrl,
				duration: formatDuration(video.durationSec),
				unformattedDuration: video.durationSec,
				user: interaction.user.username,
				interaction: interaction,
				audioStream: null,
			};
			queue.push(track);
		}

		interaction.editReply(`Added to the queue: **${playlist.title}**, by ${interaction.user.username}`);
		playNextTrack();
	} catch (error) {
		interaction.editReply("Error adding playlist to queue");
	}
}

async function skip(interaction) {
	if (!connection || !connection.state.subscription) {
		return interaction.reply("I'm not currently connected to a voice channel.");
	}

	if (queue.length === 1) {
		return interaction.reply("There are no tracks in the queue to skip.");
	}
	queue.shift();
	isPlaying = false;
	playTrack(queue[0], interaction);
}

function jump(interaction) {
	let index = interaction.options.getInteger("to");

	if (!connection || !connection.state.subscription) {
		return interaction.reply("I'm not currently connected to a voice channel.");
	}

	if (queue.length === 1) {
		return interaction.reply("There are no tracks in the queue to jumb to");
	}

	if (index >= 2 && index < queue.length) {
		const arrayIndex = --index;
		playTrack(queue[arrayIndex], interaction);
		queue.splice(0, arrayIndex);
	} else {
		return interaction.reply(`I cannot jump to the position ${index}`);
	}
}

function shuffle(interaction) {
	function shuffleQueue() {
		const currentTrack = queue.shift();
		for (let i = queue.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[queue[i], queue[j]] = [queue[j], queue[i]];
		}
		queue.unshift(currentTrack);
	}
	shuffleQueue();
	interaction.reply("I shuffled the queue, you can use `/queue` to look at the new queue.");
}

function queueComponents() {
	const previousButton = new ButtonBuilder()
		.setLabel("Previous page")
		.setStyle(ButtonStyle.Primary)
		.setCustomId("previous-page");
	const nextButton = new ButtonBuilder()
		.setLabel("Next page")
		.setStyle(ButtonStyle.Primary)
		.setCustomId("next-page");

	const buttonRow = new ActionRowBuilder().addComponents(previousButton, nextButton);
	return buttonRow;
}

async function showqueue(interaction) {
	await interaction.deferReply();
	let currentPage = interaction.options.getInteger("page");
	if (currentPage === null) currentPage = 1;
	let totalPages = Math.ceil(queue.length / itemsPerPage);
	let startIndex = (currentPage - 1) * itemsPerPage;
	let endIndex = currentPage * itemsPerPage;
	let queuePage = queue.slice(startIndex, endIndex);
	const botAvatar = client.user.avatarURL();

	if (queue.length === 0) {
		return await interaction.editReply("Queue is empty, add some songs to the queue!");
	}
	if (queuePage.length === 0) {
		return await interaction.editReply("This page of the queue does not exist!");
	}

	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Music queue", iconURL: botAvatar })
		.setTitle(`Queue (Page ${currentPage}/${totalPages})`)
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` })
		.addFields({ name: "Now Playing", value: `[1] ${queue[0].title}` });

	queuePage.forEach((track, index) => {
		Embed.addFields({ name: `[${startIndex + index + 1}]`, value: track.title });
	});

	const reply = await interaction.editReply({ embeds: [Embed], components: [queueComponents()] });

	const filter = (i) => i.user.id === interaction.user.id;

	const collector = reply.createMessageComponentCollector({
		ComponentType: ComponentType.Button,
		filter,
		time: 60000,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.customId === "previous-page") {
			if (currentPage === 1)
				return await interaction.reply("You are already on the first page of the queue!");
			await interaction.deferUpdate();
			currentPage--;
			return sendQueuePage(interaction);
		}

		if (interaction.customId === "next-page") {
			if (currentPage === totalPages)
				return await interaction.reply("You are already on the last page of the queue!");
			await interaction.deferUpdate();
			currentPage++;
			return sendQueuePage(interaction);
		}
	});

	async function sendQueuePage(interaction) {
		totalPages = Math.ceil(queue.length / itemsPerPage);
		startIndex = (currentPage - 1) * itemsPerPage;
		endIndex = currentPage * itemsPerPage;
		queuePage = queue.slice(startIndex, endIndex);

		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | Music queue", iconURL: botAvatar })
			.setTitle(`Queue (Page ${currentPage}/${totalPages})`)
			.setTimestamp(interaction.createdTimestamp)
			.setFooter({ text: `Requested by ${interaction.user.username}` })
			.addFields({ name: "Now Playing", value: `[1] ${queue[0].title}` });

		queuePage.forEach((track, index) => {
			Embed.addFields({ name: `[${startIndex + index + 1}]`, value: track.title });
		});
		await interaction.editReply({ embeds: [Embed] });
	}
}

/*function seek(interaction) {
	console.log(player);
	if (player.state?.status !== AudioPlayerStatus.Playing)
		return interaction.reply("No music is played at the moment");
	const timeInSeconds = interaction.options.getString("seconds");
	const seekTime = timeInSeconds * 1000;

	player.pause();

	const resource = player.state.resource;
	resource.playStream.seek(seekTime);

	player.unpause()
	interaction.reply(`Fast forwarded to ${timeInSeconds} seconds in the track`);
}*/

function nowplaying(interaction) {
	if (player.state?.status !== AudioPlayerStatus.Playing)
		return interaction.reply("No music is played at the moment");
	if (!connection || !connection.state.subscription) {
		return interaction.reply("I'm not currently connected to a voice channel.");
	}

	const { url, title, thumbnail, unformattedDuration, user, audioStream } = queue[0];
	console.log(audioStream);
	const currentTime = resource.playbackDuration;
	const totalDuration = unformattedDuration * 1000;
	const progressPercentage = (currentTime / totalDuration) * 100;

	function generateProgressBar(progress) {
		const totalUnits = 20;
		const filledUnits = Math.round((progress / 100) * totalUnits);
		const progressBar = "█".repeat(filledUnits) + "░".repeat(totalUnits - filledUnits);
		return progressBar;
	}

	const formatTime = (time) => {
		const totalSeconds = Math.floor(time / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};

	const progressBar = generateProgressBar(progressPercentage);
	const currentTimeFormatted = formatTime(currentTime);
	const totalDurationFormatted = formatTime(totalDuration);
	const botAvatar = client.user.displayAvatarURL();

	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | NowPlaying", iconURL: botAvatar })
		.setTitle(title)
		.setURL(url)
		.setThumbnail(thumbnail)
		.addFields(
			{ name: "Duration", value: `${progressBar} ${currentTimeFormatted} / ${totalDurationFormatted}` },
			{ name: "Requested by", value: user }
		)
		.setTimestamp(interaction.createdTimestamp);

	interaction.reply({ embeds: [Embed], content: "Currently playing" });
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
	queue = [];
	connection.destroy();
	interaction.reply("Music stopped, I have left the voice channel!");
}

function pause(interaction) {
	if (!player.pause()) {
		interaction.reply(`Cannot pause already paused track!`);
		return;
	}
	player.pause(interaction);
	interaction.reply(`Paused, the current track \`${queue[0].title}\``);
}

function unpause(interaction) {
	if (!player.unpause()) {
		interaction.reply(`Cannot unpause already playing track!`);
		return;
	}
	player.unpause(interaction);
	interaction.reply(`Unpaused, resuming with the track \`${queue[0].title}\``);
}

async function fetchLyrics() {
	let lyrics = null;
	try {
		const modifiedArtist = queue[0].artist.replace(" - Topic", "");
		const modifiedTitle = queue[0].title
			.replace(queue[0].artist, "")
			.replace("(official video)", "")
			.replace("-", "");
		const SearchQuery = `${modifiedArtist} ${modifiedTitle}`;
		console.log("modified Title:", SearchQuery);
		const searches = await LyricClient.songs.search(SearchQuery);
		const firstSong = searches[0];
		lyrics = await firstSong.lyrics();
		if (!lyrics) {
			lyrics = `No lyrics found for ${queue[0].title}.`;
		}
	} catch (error) {
		console.log(error);
		lyrics = `No lyrics found for ${queue[0].title}.`;
	}
	return lyrics;
}

async function lyrics(interaction) {
	await interaction.deferReply();
	if (player.state?.status !== AudioPlayerStatus.Playing)
		return interaction.reply(
			"I can't retrieve any lyric data because there is no music playing at the moment."
		);

	const lyrics = await fetchLyrics();

	const chunkSize = 4000;
	const chunks = lyrics.match(new RegExp(`[\\s\\S]{1,${chunkSize}}`, "g")) || [];
	const botAvatar = client.user.displayAvatarURL();

	const Embeds = chunks.map((chunk, index) => {
		if (index === 0) {
			return new EmbedBuilder()
				.setColor(0xffcc00)
				.setAuthor({ name: "MetalFistBot 5000 | Lyrics", iconURL: botAvatar })
				.setTitle(`Lyrics for ${queue[0].title}`)
				.setURL(queue[0].url)
				.setDescription(chunk)
				.setThumbnail(queue[0].thumbnail)
				.setFooter({ text: `Requested by ${interaction.user.username}` })
				.setTimestamp(interaction.createdTimestamp);
		}
		return new EmbedBuilder().setColor(0xffcc00).setDescription(chunk);
	});

	if (Embeds.length > 10) {
		return interaction.editReply({ content: "Lyrics are to long!" });
	}

	interaction.editReply({ embeds: Embeds });
}

function filter(interaction) {}

export default {
	addMusic,
	leave,
	pause,
	unpause,
	skip,
	jump,
	nowplaying,
	showqueue,
	shuffle,
	filter,
	lyrics, /*seek*/
	
};
