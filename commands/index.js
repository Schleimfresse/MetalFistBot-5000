import music from "./music.js";
import info from "./info.js";
import misc from "./misc.js";
import leagueoflegends from "./leagueoflegends.js";
let commands = {};

commands.music = {
	add: music.addMusic,
	leave: music.leave,
	stop: music.stop,
	pause: music.pause,
	unpause: music.unpause,
};
commands.info = {
	ping: info.ping,
	help: info.help,
	botinfo: info.botinfo,
};
commands.misc = {
	serverinfo: misc.serverinfo,
	clear: misc.clear,
};
commands.lol = {
	getMasteryPoints: leagueoflegends.getMasteryPoints,
	getTotalMasteryPoints: leagueoflegends.getTotalMasteryPoints,
};

export default commands;