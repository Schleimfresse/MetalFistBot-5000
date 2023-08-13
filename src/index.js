import Discord from "discord.js";
const { ActivityType } = Discord;
import commands from "./commands/index.js";
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

	/*if (interaction.channel.type === 'DM' && interaction.author.bot) {
		  try {
			const messages = await message.channel.messages.fetch();
			await message.channel.bulkDelete(messages);
			message.reply(`Deleted ${amount} messages.`);
		  } catch (error) {
			console.error('Error while deleting messages:', error);
			message.reply('An error occurred while deleting messages.');
		  }
		}
	  }*/

	if (commandName === "clear-dms") {
		commands.misc.cleardm(interaction);
	}

	if (commandName === "ping") {
		commands.info.ping(interaction);
	}

	if (commandName === "help") {
		commands.info.help(interaction);
	}

	if (commandName === "remindme") {
		commands.misc.remindme(interaction);
	}

	if (commandName === "coinflip") {
		commands.misc.coinflip(interaction);
	}

	if (commandName === "fact") {
		commands.misc.fact(interaction);
	}

	if (commandName === "avatar") {
		commands.misc.avatar(interaction);
	}

	if (commandName === "shuffle") {
		commands.music.shuffle(interaction);
	}

	if (commandName === "jumb") {
		commands.music.jumb(interaction);
	}

	if (commandName === "lyrics") {
		commands.music.lyrics(interaction);
	}

	if (commandName === "filter") {
		commands.music.filter(interaction);
	}

	if (commandName === "skip") {
		commands.music.skip(interaction);
	}

	if (commandName === "queue") {
		commands.music.queue(interaction);
	}

	if (commandName === "controls") {
		commands.music.controls(interaction);
	}

	if (commandName === "nowplaying") {
		commands.music.nowplaying(interaction);
	}

	/*if (commandName === "seek") {
		commands.music.seek(interaction)
	}*/

	if (commandName === "botinfo") {
		commands.info.botinfo(interaction);
	}

	if (commandName === "serverinfo") {
		commands.misc.serverinfo(interaction);
	}

	if (commandName === "clear") {
		commands.misc.clear(interaction);
	}

	if (commandName === "play") {
		commands.music.add(interaction, false);
	}

	if (commandName === "play-next") {
		commands.music.add(interaction, true);
	}

	if (commandName === "leave") {
		commands.music.leave(interaction);
	}

	if (commandName === "pause") {
		commands.music.pause(interaction);
	}

	if (commandName === "unpause" || commandName === "resume") {
		commands.music.unpause(interaction);
	}

	if (commandName === "masterypoints") {
		commands.lol.getMasteryPoints(interaction);
	}

	if (commandName === "totalmasterypoints") {
		commands.lol.getTotalMasteryPoints(interaction);
	}

	if (commandName === "nsfw") {
		commands.nsfw.nsfw(interaction);
	}
});

client.login(config.TOKEN);
