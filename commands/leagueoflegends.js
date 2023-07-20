import champions from "../data/champions.js";
import fetch from "node-fetch";
import config from "../config/config.js";
import { EmbedBuilder } from "discord.js";
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
		const MasteryPoints = data.championPoints;1
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

export default { getMasteryPoints, getTotalMasteryPoints };
