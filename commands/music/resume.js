const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'resume',
  description: 'Resume the currently paused song.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')] 
      });
    }

    if (!queue.paused) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('The music is not paused!')] 
      });
    }

    await queue.resume();

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('Resumed the current song.')] 
    });
  },
};
