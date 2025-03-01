const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'skip',
  description: 'Skip the currently playing song.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')] 
      });
    }

    await queue.skip();

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('Skipped the current song.')] 
    });
  },
};
