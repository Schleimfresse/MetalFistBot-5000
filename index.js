import Discord from "discord.js";
const { ActivityType } = Discord;
import commands from "./commands/index.js";
import "@discord-player/extractor";
import config from "./config/config.js";
const client = config.CLIENT;

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setPresence({
		activities: [{ name: "on minions and grabbing ADCs", type: ActivityType.Watching }],
		status: "idle",
	});
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const { commandName } = interaction;
	if (commandName === "ping") {
		commands.info.ping(interaction);
	}

	if (commandName === "help") {
		commands.info.help(interaction);
	}

	if (commandName === "shuffle") {
	}

	if (commandName === "queue") {
	}

	if (commandName === "nowplaying") {
	}

	if (commandName === "botinfo") {
		commands.info.botinfo(interaction);
	}

	if (commandName === "serverinfo") {
		commands.misc.serverinfo(interaction)
	}

	if (commandName === "clear") {
		commands.misc.clear(interaction)
	}

	if (commandName === "add") {
		commands.music.add(interaction, client);
	}

	if (commandName === "leave") {
		commands.music.leave(interaction);
	}

	if (commandName === "stop") {
		commands.music.stop(interaction);
	}

	if (commandName === "pause") {
		commands.music.pause(interaction);
	}

	if (commandName === "unpause" || commandName === "resume") {
		commands.music.unpause(interaction);
	}

	if (commandName === "masterypoints") {
		commands.lol.getMasteryPoints(interaction)
	}

	if (commandName === "totalmasterypoints") {
		commands.lol.getTotalMasteryPoints(interaction)
	}
});

client.login(config.TOKEN);
