import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle } from "discord.js";
import config from "../config/config.js";
const client = config.CLIENT;

async function nsfw(interaction) {
	const yesBtn = new ButtonBuilder().setLabel("Confirm").setStyle(ButtonStyle.Primary).setCustomId("yes");
	const cancelBtn = new ButtonBuilder().setLabel("Cancel").setStyle(ButtonStyle.Danger).setCustomId("cancel");
	const buttonRow = new ActionRowBuilder().addComponents(yesBtn, cancelBtn);
	const botAvatar = client.user.avatarURL();
	const Embed = new EmbedBuilder()
		.setColor(0xffcc00)
		.setAuthor({ name: "MetalFistBot 5000 | Nsfw", iconURL: botAvatar })
		.setTitle("Are you sure")
		.setDescription("If you really want to see nsfw content confirm with the button")
		.setTimestamp(interaction.createdTimestamp)
		.setFooter({ text: `Requested by ${interaction.user.username}` });

	const reply = await interaction.reply({ embeds: [Embed], components: [buttonRow] });

	const filter = (i) => i.user.id === interaction.user.id;

	const collector = reply.createMessageComponentCollector({
		ComponentType: ComponentType.Button,
		filter,
		time: 60000,
	});

	collector.on("collect", async (i) => {
		if (i.customId === "yes") {
			const image_url = await fetchNsfw(interaction)
            collector.stop();
			const botAvatar = client.user.avatarURL();
			const Embed = new EmbedBuilder()
				.setColor(0xffcc00)
				.setAuthor({ name: `MetalFistBot 5000 | Nsfw`, iconURL: botAvatar })
				.setImage(image_url)
				.setTimestamp(i.createdTimestamp);

			await i.user.send({ embeds: [Embed] });
		}

		if (i.customId === "cancel") {
            collector.stop();
			await i.reply("Interaction has been cancelled!");
		}
	});
}

async function fetchNsfw(interaction) {
	const type = interaction.options.getString("type");
	const url = `http://api.nekos.fun:8080/api/${type}`;
	const response = await fetch(url);
	const json = await response.json();
	return json.image;
}

export default { nsfw };
