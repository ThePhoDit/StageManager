const mongoose = require('mongoose');
const { Client } = require('discord.js');
require('dotenv').config();

priorityRoles = ['807641956922425344'];
timesPrioritized = 0;
prefix = 'v!'
previousUser = ''

async function nextSpeakerByOrder(members) {
	const member = await members.filter(m => m.voice.requestToSpeakTimestamp).sort((m1, m2) => m2.requestToSpeakTimestamp - m1.requestToSpeakTimestamp).first();
	if (!member) return null;
	return member;
}

async function nextSpeaker(members) {
	/* if (timesPrioritized === 3) {
		timesPrioritized = 0;
		const next = await nextSpeakerByOrder(members);
		if (!next) return null;
		return next;
	}

	for (const role of priorityRoles) {
		console.log(`Checking for priority ${role}`);

		const membersFiltered = await members.filter(m => m.roles.cache.has(role));
		console.log(membersFiltered)
		if (!membersFiltered) continue;

		const member = await nextSpeakerByOrder(membersFiltered);
		timesPrioritized ++;
		return member;
	} */

	const next = await nextSpeakerByOrder(members);
	console.log(next)
	if (!next) return null;
	return next;

}

/* mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const stage = mongoose.model('Stage', {
	guildID: String,
	userID: String,
	channelID: String,
	priority: Number,
	requestedAt: Number,
}); */

const client = new Client({
	intents: 643
});

// IGUAL NO HACE FALTA DB, HACER SORT CON DISCORD
// Hago un filter para los roles y un sort con los timestamps
/* client.on('voiceStateUpdate', async (oldSate, newSate) => {
	console.log(oldSate.requestToSpeakTimestamp, newSate.requestToSpeakTimestamp);
	if (oldSate.requestToSpeakTimestamp === newSate.requestToSpeakTimestamp) return;

	const inDB = await stage.findOne({ guildID: newSate.guild.id, userID: newSate.id, channelID: newSate.channelID}).exec();
	if (!inDB && newSate.requestToSpeakTimestamp !== null) {
		new stage({
			guildID: newSate.guild.id,
			userID: newSate.id,
			channelID: newSate.channelID
		})
	}
}); */

client.on('message', async (msg) => {
	if (msg.author.bot) return;
	if (!msg.member.permissions.has('MOVE_MEMBERS')) return;
	console.log(1);
	if (!msg.member.voice.channelID || msg.member.voice.channel.type !== 'stage')
		return msg.channel.send('You are not on a stage channel.');
console.log(2);
	if (!msg.content.startsWith(prefix)) return;
console.log(3);
	const args = msg.content.trim().split(/ +/g);
	if (args[0] === prefix) return;
console.log(4);
	const command = args.shift().slice(prefix.length);
	if (!command) return;
console.log(5);
console.log(command)
	if (command === 'start') {
		console.log(17);
		const member = await nextSpeaker(msg.member.voice.channel.members);
		console.log(member);
		if (!member)
			return msg.channel.send('No users with hands risen.');

		member.voice.setSuppressed(false);
		previousUser = member.id;
		return msg.channel.send('Member moved.');
	}

	if (command === 'next') {
		console.log(23);
		const member = await nextSpeaker(msg.member.voice.channel.members);
		if (!member)
			return msg.channel.send('No users with hands risen.');

		member.voice.setSuppressed(false);
		msg.guild.members.fetch(previousUser).voice.setSuppressed(true);
		previousUser = member.id;
		return msg.channel.send('Member moved.');
	}
});

client.login(process.env.TOKEN);