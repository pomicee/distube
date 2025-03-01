const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'stop',
  description: 'Stop the currently playing song and clear the queue.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')]
      });
    }

    await queue.stop();

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('Stopped the music and cleared the queue.')] 
    });
  },
};
