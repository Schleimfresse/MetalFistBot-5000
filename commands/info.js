import { EmbedBuilder } from "discord.js";
import config from "../config/config.js";
const client = config.CLIENT;

function help(interaction) {
	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000", iconURL: botAvatar })
		.setTitle("Help")
		.setThumbnail(botAvatar)
		.addFields({
			name: "🎶 Music",
			value: "`/play`, `/shuffle`, `/leave`, `/stop`, `/pause`, `/unpause`, `/resume`, `/nowplaying`, `/skip`, `/queue`, `/seek`, `/jumb`, `/lyrics`, `/filter`",
		})
		.addFields({ name: "💫 Various", value: "`/serverinfo`, `/userinfo`, `/clear`, `/remindme`, `/coinflip`, `/fact`, `/clear-dms`" })
		.addFields({ name: "ℹ️ Info", value: "`/help`, `/ping`, `/botinfo`" })
		.addFields({ name: "🕹 Games", value: "`/masterypoints`, `/totalmasterypoints`" })
		.addFields({ name: "❤️ Nsfw", value: "`/nsfw`, `options: nude, hentai, lesbian, anal, boobs`" })
		.setTimestamp(interaction.createdAt)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.reply({ embeds: [Embed] });
}

async function ping(interaction) {
	const sentTimestamp = Date.now();
	await interaction.reply("Pinging...");
	const ping = Date.now() - sentTimestamp;
	await interaction.editReply(`Pong! Latency: \`${ping}ms\``);
}

function botinfo(interaction) {
	const guild = interaction.guild;
	if (!guild.available) {
		interaction.reply("Unable to retrieve server information.");
		return;
	}
	const botAvatar = client.user.displayAvatarURL();
	const creationDate = client.user.createdAt;
	const formattedCreationDate = creationDate.toLocaleString("en-US", {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000", iconURL: botAvatar })
		.setTitle("Information about me")
		.setThumbnail(botAvatar)
		.addFields(
			{ name: "Name", value: "MetalFistBot 5000", inline: true },
			{ name: "Version", value: "1.4.0", inline: true },
			{
				name: "Developer",
				value: "schleimfresse \n [GitHub](https://github.com/Schleimfresse/MetalFistBot-5000)",
				inline: true,
			},
			{ name: "Command Prefix", value: "MetalFistBot uses SlashCommands (/)", inline: true },
			{ name: "Creation Date", value: formattedCreationDate, inline: true },
			{
				name: "Source Code",
				value: "[GitHub](https://github.com/Schleimfresse/MetalFistBot-5000)",
				inline: true,
			}
		)
		.setTimestamp(interaction.createdAt)
		.setFooter({ text: `Requested by ${interaction.user.username}` });

	interaction.reply({ embeds: [Embed] });
}
export default { help, ping, botinfo };
