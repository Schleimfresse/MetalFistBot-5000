import music from "./music.js";
import info from "./info.js";
import misc from "./misc.js";
import leagueoflegends from "./leagueoflegends.js";
let commands = {};

commands.music = {
	add: music.addMusic,
	leave: music.leave,
	pause: music.pause,
	unpause: music.unpause,
	skip: music.skip,
	jumb: music.jump,
	shuffle: music.shuffle,
	nowplaying: music.nowplaying,
	queue: music.showqueue,
	//seek: music.seek,
	filter: music.filter,
	lyrics: music.lyrics,
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
