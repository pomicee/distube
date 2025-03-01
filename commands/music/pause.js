const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'pause',
  description: 'Pause the currently playing song.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')] 
      });
    }

    if (queue.paused) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('The music is already paused!')]
      });
    }

    await queue.pause();

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('Paused the current song.')]
    });
  },
};
