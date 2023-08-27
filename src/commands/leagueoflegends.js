import champions from "../data/champions.js";
import fetch from "node-fetch";
import config from "../config/config.js";
import { EmbedBuilder} from "discord.js";
const client = config.CLIENT;
const API_KEY = config.API_KEY;

const getPlayerInfo = async (region, summoner, API_KEY, interaction) => {
	try {
		const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
			summoner
		)}?api_key=${API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();
		if (data.status?.status_code === 404) {
			return interaction.reply("Summoner does not exist!");
		}
		return { id: data.id, profileIconId: data.profileIconId };
	} catch (error) {
		console.log(error);
		interaction.reply("Error retrieving summoner ID!");
	}
};

async function getMasteryPoints(interaction) {
	await interaction.deferReply();
	const { options } = interaction;
	const region = options.getString("region");
	const summoner = options.getString("summoner");
	const champ = options.getString("champion");
	const found = champions.find((element) => element.name === champ);
	if (!found) return interaction.reply(`Champion ${champ} does not exist!`);
	let formatedChampion = champ.replace(/['\s]/g, "");
	if (formatedChampion === "Wukong") {
		formatedChampion = "MonkeyKing";
	}
	if (formatedChampion === "Nunu & Willump") {
		formatedChampion = "Nunu";
	}
	const url = `http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion/${formatedChampion}.json`;
	const response = await fetch(url);
	const data = await response.json();
	const key = parseInt(data.data[formatedChampion].key);
	try {
		const player = await getPlayerInfo(region, summoner, API_KEY, interaction);
		const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${player.id}/by-champion/${key}?api_key=${API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();
		if (data.status?.status_code === 404)
			return interaction.editReply(`Summoner **${summoner}** has never played the champion **${champ}**`);
		const MasteryPoints = data.championPoints;
		1;
		const formattedMasteryPoints = MasteryPoints.toLocaleString("en-US");
		const formatedRegion = region.toLowerCase().replace(/\d+/g, "");
		const formatedSummonerName = summoner.replace(/ /g, "+");
		const botAvatar = client.user.displayAvatarURL();
		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | MasteryPoints", iconURL: botAvatar })
			.setTitle(summoner)
			.setURL(`https://www.leagueofgraphs.com/summoner/${formatedRegion}/${formatedSummonerName}`)
			.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${formatedChampion}.png`)
			.addFields({ name: `Mastery points on ${champ}`, value: `**${formattedMasteryPoints}**` })
			.setTimestamp(interaction.createdAt)
			.setFooter({ text: `Requested by ${interaction.user.username}` });
		interaction.editReply({ embeds: [Embed] });
	} catch (error) {
		console.log(error);
		interaction.editReply(`Error fetching data from Riot Games API!`);
	}
}

async function getTotalMasteryPoints(interaction) {
	await interaction.deferReply();
	const { options } = interaction;
	const region = options.getString("region");
	const summoner = options.getString("summoner");
	try {
		const player = await getPlayerInfo(region, summoner, API_KEY, interaction);
		const url = `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${player.id}?api_key=${API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();
		let TotalMasteryPoints = 0;
		for (let entry of data) {
			TotalMasteryPoints += entry.championPoints;
		}
		const botAvatar = client.user.displayAvatarURL();
		const formattedMasteryPoints = TotalMasteryPoints.toLocaleString("en-US");
		const formatedRegion = region.toLowerCase().replace(/\d+/g, "");
		const formatedSummonerName = summoner.replace(/ /g, "+");
		const Embed = new EmbedBuilder()
			.setColor(0xffcc00)
			.setAuthor({ name: "MetalFistBot 5000 | TotalMasteryPoints", iconURL: botAvatar })
			.setTitle(summoner)
			.setURL(`https://www.leagueofgraphs.com/summoner/${formatedRegion}/${formatedSummonerName}`)
			.setThumbnail(
				`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${player.profileIconId}.png`
			)
			.addFields({ name: `Total mastery points`, value: `**${formattedMasteryPoints}**` })
			.setTimestamp(interaction.createdAt)
			.setFooter({ text: `Requested by ${interaction.user.username}` });
		interaction.editReply({ embeds: [Embed] });
	} catch (error) {
		console.log(error);
		interaction.editReply(`Error fetching data from Riot Games API!`);
	}
}

const getToken = async (client_id) => {
	const client_secret = config.TWITCH_CLIENT_SECRET;
	const response = await fetch("https://id.twitch.tv/oauth2/token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: client_id,
			client_secret: client_secret,
			grant_type: "client_credentials",
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	});

	const data = await response.json();
	return data.access_token;
};

const convertThumbnailUrl = (url, width, height) => {
	return url.replace("{width}", width).replace("{height}", height);
};

async function lolstreams(interaction) {
	await interaction.deferReply();
	const client_id = config.TWITCH_CLIENT_ID;
	const access_token = await getToken(client_id);
	console.log(access_token);
	const url = `https://api.twitch.tv/helix/streams?game_id=21779&first=10`;
	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Client-ID": client_id,
			Authorization: `Bearer ${access_token}`,
		},
	});
	const data_raw = await response.json();
	const data = data_raw.data;
	const botAvatar = client.user.displayAvatarURL();
	let embed_array = [];
	for (let i = 0; i < data.length; i++) {
		const Embed = new EmbedBuilder();
		Embed.setColor(0xffcc00);
		if (i === 0) {
			Embed.setAuthor({ name: "MetalFistBot 5000 | Streams", iconURL: botAvatar });
		}
		if (i === data.length - 1) {
			Embed.setTimestamp(interaction.createdAt);
			Embed.setFooter({ text: `Requested by ${interaction.user.username}` });
		}
		if (data[i].language === "en") {
			data[i].language = "gb";
		}
		if (data[i].language === "ko") {
			data[i].language = "kr";
		}
		if (data[i].language === "ja") {
			data[i].language = "jp";
		}
		if (data[i].language === "zh") {
			data[i].language = "cn";
		}

		const thumbnailWidth = 300;
		const thumbnailHeight = 160;
		const thumbnail = convertThumbnailUrl(data[i].thumbnail_url, thumbnailWidth, thumbnailHeight);
		Embed.setTitle(`${data[i].user_name} (:flag_${data[i].language}:)`);
		Embed.setURL(`https://twitch.tv/${data[i].user_login}`);
		Embed.setDescription(`Viewer: ${data[i].viewer_count}\n`);
		Embed.setImage(thumbnail);
		embed_array = [...embed_array, Embed];
	}
	interaction.editReply({ embeds: embed_array });
}

export default { getMasteryPoints, getTotalMasteryPoints, lolstreams };
