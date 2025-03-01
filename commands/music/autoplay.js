const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'autoplay',
  description: 'Toggle the autoplay feature.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')]
      });
    }

    const autoplayEnabled = queue.autoplay;
    await queue.setAutoplay(!autoplayEnabled);

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Autoplay has been ${autoplayEnabled ? 'disabled' : 'enabled'}.`)]
    });
  },
};
