import config from "../config/config.js";
const client = config.CLIENT;
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle } from "discord.js";
import Genius from "genius-lyrics";
import play from "play-dl";
import { path } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import ytpl from "ytpl";
ffmpeg.setFfmpegPath(path);
import { Readable, PassThrough } from "stream";
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
let filter = "nofilter";
let queue = [];
let timeoutID;
const itemsPerPage = 15;

async function getAccessToken() {
	const url = "https://accounts.spotify.com/api/token";
	const auth = Buffer.from(`${config.SP_CLIENTID}:${config.SP_CLIENT_SECRET}`).toString("base64");
	const requestBody = new URLSearchParams();
	requestBody.append("grant_type", "client_credentials");
	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
		},
		body: requestBody,
	});
	const data = await response.json();
	return data.access_token;
}
const accessToken = await getAccessToken();
/*await play.setToken({
	spotify: {
		client_id: config.SP_CLIENTID,
		client_secret: config.SP_CLIENT_SECRET,
		refresh_token: undefined,
		market: "DE",
	},
});*/

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
				if (connection !== undefined) {
					interaction.channel.send({
						content: "The queue has finished, I will automatically disconnect in **5 minutes**",
					});
					timeoutID = setTimeout(() => {
						connection.disconnect();
					}, 300000);
					player = undefined;
					isPlaying = false;
				}
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
	}); //await applyFilter(track.audioStream, interaction);

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

async function addMusic(interaction, next) {
	clearTimeout(timeoutID);
	timeoutID = undefined;
	await interaction.deferReply();
	const { options } = interaction;
	const url = options.getString("url");
	const platform = options.getString("platform");
	const playlist_boolean = options.getBoolean("playlist");

	const channel = interaction.member.voice.channel;

	if (!channel) {
		return interaction.editReply("You must be in a voice channel to use this command.");
	}

	if (!channel.joinable || !channel.speakable) {
		return interaction.editReply(" cannot join or speak in your voice channel.");
	}

	connection = joinVoiceChannel({
		channelId: interaction.member.voice.channel.id,
		guildId: interaction.guild.id,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});

	if (playlist_boolean === true) {
		addPlaylistToQueue(url, interaction, next);
	} else {
		try {
			let info;
			try {
				if (platform == "yt") {
					info = await play.video_info(url);
				}
				if (platform == "sp") {
					if (playlist_boolean === true) {
						return interaction.editReply(
							"This is not supported at the moment!"
						);
					}
					console.log(config.SP_CLIENT_SECRET);
					const res = await fetch(`https://api.spotify.com/v1/tracks/39QPkdRbgK5YUcSHWTkkbQ?market=DE`, {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});
					if (!res.ok) {
						throw new Error(`Failed to fetch data from Spotify API. Status: ${res.status}`);
					}

					const data = await res.json();

					try {
						let searched = await play.search(`${data.name}`, {
							limit: 1,
						});
						info = await play.video_info(searched[0].url);
					} catch {
						return interaction.editReply(
							"Error fetching music data, the requested Spotify track could not be found on YouTube"
						);
					}
				}
			} catch (err) {
				console.log(err);
				return interaction.editReply("Error fetching music data. Make sure you enter a valid link.");
			}
			const videoLengthSeconds = info.video_details.durationInSec;

			const formattedDuration = formatDuration(videoLengthSeconds);

			const track = {
				title: info.video_details.title,
				thumbnail: info.video_details.thumbnails[0].url,
				artist: info.video_details.channel.name,
				url: info.video_details.url,
				duration: formattedDuration,
				unformattedDuration: videoLengthSeconds,
				user: interaction.user.username,
				interaction: interaction,
				audioStream: null,
			};
			if (next) {
				interaction.editReply(`**${track.title}** has been queued up as the next track, by ${track.user}`);
				queue.splice(2, 0, track);
			} else {
				queue.push(track);
				interaction.editReply(`**${track.title}** was added to the queue, by ${track.user}`);
			}
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

async function addPlaylistToQueue(url, interaction, next) {
	try {
		const playlist = await ytpl(url);
		const pl_array = [];
		for (const video of playlist.items) {
			const track = {
				title: video.title,
				artist: video.author.name,
				thumbnail: video.bestThumbnail.url,
				url: video.shortUrl,
				duration: formatDuration(video.durationSec),
				unformattedDuration: video.durationSec,
				user: interaction.user.username,
				interaction: interaction,
				audioStream: null,
			};
			pl_array.push(track);
		}
		if (next) {
			queue.splice(2, 0, ...pl_array);
		} else {
			if (queue.length === 0) {
				console.log(queue);
				queue = pl_array;
			} else {
				queue.concat(pl_array);
			}
			console.log(queue);
		}

		interaction.editReply(`Added to the queue: **${playlist.title}**, by ${interaction.user.username}`);
		playNextTrack();
	} catch (error) {
		console.log(error);
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
		const SearchQuery = queue[0].title
			.replace(
				/(\(official video\)|Official video| -|\(TECHNO\)|\(HARDSTYLE\)|HARDSTYLE|Techno|\(Remix\)|\(Hardstyle\))/gi,
				""
			)
			.trim();
		console.log("modified Title:", SearchQuery);
		const searches = await LyricClient.songs.search(SearchQuery);
		const firstSong = searches[0];
		if (!firstSong) {
			lyrics = `No lyrics found for ${queue[0].title}.`;
		} else {
			lyrics = await firstSong.lyrics();
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

function filterHandler(interaction) {
	const filter_option = interaction.options.getString("filter");
	if (filter_option === filter) {
		return interaction.reply({ content: "The filter you wanted to select is already active" });
	}
	if (filter_option === "nightcore") {
		interaction.reply({ content: "Successfully set the filter to `NightCore`" });
		filter = "nightcore";
	}
	if (filter_option === "hardtekk") {
		interaction.reply({ content: "Successfully set the filter to `Nightcore`" });
		filter = "hardtekk";
	}
	if (filter_option === "nofilter") {
		interaction.reply({ content: "Successfully reset current filter, no filters are now active" });
		filter = "nofilter";
	}
}

async function applyFilter(audio, interaction) {
	const type = audio.type;
	const stream = audio.stream;
	const filterSettings = ["asetrate=44100*1.25,aresample=44100,atempo=1.25"];
	try {
		if (filter === "nightcore") {
			const readableStream = Readable.from(stream._readableState.buffer);
			console.log(readableStream);
			const ffmpegCommand = ffmpeg().input(readableStream);
			ffmpegCommand.audioFilter(filterSettings[0]);
			ffmpegCommand.toFormat("mp3");
			ffmpegCommand.on("error", (err, stdout, stderr) => {
				console.error("ffmpeg error:", err.message);
				console.error("ffmpeg stdout:", stdout);
				console.error("ffmpeg stderr:", stderr);
			});
			const modifiedAudioStream = ffmpegCommand.pipe({
				stream: true,
				end: true,
			});
			const modifiedAudioStream_readable = Readable.from(modifiedAudioStream);
			console.log("MODIFIED AUDIO STREAM", modifiedAudioStream_readable);

			return createAudioResource(modifiedAudioStream_readable, {
				inputType: type,
			});
		} else {
			return createAudioResource(stream, {
				inputType: type,
			});
		}
	} catch (err) {
		console.log(err);
		interaction.channel.send({ content: `Could not apply \`${filter}\`` });
		return createAudioResource(stream, {
			inputType: type,
		});
	}
}

function controls(interaction) {
	const shuffleButton = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji("🔀").setCustomId("4");
	const pauseButton = new ButtonBuilder().setEmoji("⏸️").setStyle(ButtonStyle.Primary).setCustomId("2");
	const playButton = new ButtonBuilder().setEmoji("▶️").setStyle(ButtonStyle.Primary).setCustomId("3");
	const nextButton = new ButtonBuilder().setEmoji("⏭️").setStyle(ButtonStyle.Primary).setCustomId("1");
	const buttonRow = new ActionRowBuilder().addComponents(pauseButton, playButton, nextButton, shuffleButton);
	const botAvatar = client.user.avatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Music controls", iconURL: botAvatar })
		.setTitle("Controls")
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });

	const reply = interaction.reply({ embeds: [Embed], components: [buttonRow] });
}

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
	filterHandler,
	controls,
	lyrics /*seek*/,
};
