const { Client } = require('discord.js');
require('dotenv').config();

// In the following list add any roles (IDs) if you want members with it to have priority. The first roles will have the highes priority, and the final ones, the lowest.
priorityRoles = [];
timesPrioritized = 0; // DO NOT CHANGE
prefix = 'v!' // The prefix you want to use for your bot.
previousUser = '' // DO NOT CHANGE

async function nextSpeakerByOrder(members) {
	const member = await members.filter(m => m.voice.requestToSpeakTimestamp && m.voice.suppress).sort((m1, m2) => m1.voice.requestToSpeakTimestamp - m2.voice.requestToSpeakTimestamp).first();
	if (!member) return null;
	return member;
}

async function nextSpeaker(members) {
	if (timesPrioritized === 3) {
		timesPrioritized = 0;
		const next = await nextSpeakerByOrder(members);
		if (!next) return null;
		return next;
	}

	for (const role of priorityRoles) {
		console.log(`Checking for priority ${role}`);

		const membersFiltered = await members.filter(m => m.roles.cache.has(role) && m.voice.requestToSpeakTimestamp);
		if (membersFiltered.size === 0) continue;

		const member = await nextSpeakerByOrder(membersFiltered);
		timesPrioritized ++;
		return member;
	}

	const next = await nextSpeakerByOrder(members);
	if (!next) return null;
	return next;

}

const client = new Client({
	intents: 643
});

client.on('message', async (msg) => {
	if (msg.author.bot) return;
	if (!msg.member.permissions.has('MOVE_MEMBERS')) return;

	if (!msg.content.startsWith(prefix)) return;
	const args = msg.content.trim().split(/ +/g);
	if (args[0] === prefix) return;
	const command = args.shift().slice(prefix.length);
	if (!command) return;

	if (!msg.member.voice.channelID || msg.member.voice.channel.type !== 'stage')
		return msg.channel.send('You are not on a stage channel.');

	if (command === 'start') {
		const member = await nextSpeaker(msg.member.voice.channel.members);
		if (!member)
			return msg.channel.send('No users with hands risen.');

		member.voice.setSuppressed(false);
		previousUser = member.user.id;
		return msg.channel.send('Member moved.');
	}

	if (command === 'next') {
		// Remove currently speaking user.
		(await msg.guild.members.fetch(previousUser)).voice.setSuppressed(true);

		const member = await nextSpeaker(msg.member.voice.channel.members);
		if (!member)
			return msg.channel.send('No users with hands risen.');

		member.voice.setSuppressed(false);
		
		previousUser = member.id;
		return msg.channel.send('Member moved.');
	}
});

client.login(process.env.TOKEN);