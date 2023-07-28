import music from "./music.js";
import info from "./info.js";
import misc from "./misc.js";
import leagueoflegends from "./leagueoflegends.js";
import nsfw from "./nsfw.js"
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
	filter: music.filterHandler,
	lyrics: music.lyrics,
	controls: music.controls,
};
commands.info = {
	ping: info.ping,
	help: info.help,
	botinfo: info.botinfo,
};
commands.misc = {
	serverinfo: misc.serverinfo,
	clear: misc.clear,
	cleardm: misc.cleardm,
	remindme: misc.remindme,
	coinflip: misc.coinflip,
	fact: misc.fact,
	avatar: misc.avatar,
};
commands.lol = {
	getMasteryPoints: leagueoflegends.getMasteryPoints,
	getTotalMasteryPoints: leagueoflegends.getTotalMasteryPoints,
};
commands.nsfw = {
	nsfw: nsfw.nsfw
}

export default commands;
