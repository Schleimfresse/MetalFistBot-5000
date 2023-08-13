import { EmbedBuilder } from "discord.js";
import config from "../config/config.js";
const client = config.CLIENT;

async function serverinfo(interaction) {
	const guild = interaction.guild;
	if (!guild.available) return interaction.reply("Unable to retrieve server information. Beep boop");

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

async function clear(interaction) {
	const amount = interaction.options.getInteger("amount");
	if (isNaN(amount)) return interaction.reply('"Enter a valid value (number)"');
	try {
		const fetched = await interaction.channel.messages.fetch({ limit: amount });
		const deletableMessages = fetched.filter((message) => Date.now() - message.createdTimestamp < 1209600000);

		if (fetched.size === 0) {
			return interaction.reply("No messages found to delete.");
		}

		interaction.channel.bulkDelete(deletableMessages).then((messages) => {
			const deleteCount = messages.size;
			const notDeletedCount = amount - deleteCount;
			if (notDeletedCount === 0) {
				return interaction.reply(
					`Deleting ${deleteCount} messages. This can take some time, Beep Beep Beep...`
				);
			}
			interaction.reply(
				`${deleteCount} messages deleted. ${notDeletedCount} messages could not be deleted as they are older than 14 days.`
			);
		});
	} catch (err) {
		if (err.code === 50034) {
			interaction.reply("Messages cannot be deleted as they are older than 14 days.");
		}
		if (err.code === 50035) {
			interaction.reply(
				"I am not powerful enough, Beep Boob, to delete more than 100 messages – use a lower amount."
			);
		} else {
			console.log(err);
			interaction.reply("An error occurred while deleting messages.");
		}
	}
}

function cleardm(interaction) {

}

function remindme(interaction) {
	const value = interaction.options.getInteger("in");
	const valueInMS = value * 60000;
	let plural = "s";
	if (value === 1) {
		plural = "";
	}
	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Remindme", iconURL: botAvatar })
		.setTitle(`I have created a reminder for you in **${value} minute${plural}**`)
		.setFields({
			name: "Info",
			value: "However, note that if you have muted the channel, you will not be notified",
		})
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.reply({ embeds: [Embed] });

	setTimeout(() => {
		interaction.channel.send(`Hey ${interaction.user.toString()}, your timer has finished`);
	}, valueInMS);
}

function coinflip(interaction) {
	const result = Math.random() < 0.5 ? "Heads" : "Tails";
	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Coinflip", iconURL: botAvatar })
		.setTitle(`The result is ${result}`)
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.reply({ embeds: [Embed] });
}

async function fact(interaction) {
	const response = await fetch("https://nekos.life/api/v2/fact");
	const json = await response.json();
	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Fact", iconURL: botAvatar })
		.setTitle(`Do you know that...`)
		.setDescription(json.fact)
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.reply({ embeds: [Embed] });
}

async function avatar(interaction) {
	const user = interaction.options.getUser("user");
	const userAvatar = user.displayAvatarURL({ dynamic: true, size: 2048 });
	const botAvatar = client.user.displayAvatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Avatar", iconURL: botAvatar })
		.setTitle(`Here is ${user.username}'s avatar`)
		.setImage(userAvatar)
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });
	interaction.reply({ embeds: [Embed] });
}
export default { serverinfo, clear, cleardm, remindme, coinflip, fact, avatar };
