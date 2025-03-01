const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'volume',
  description: 'Get or set the volume of the music.',
  category: 'Music',
  async execute(message, args) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')] 
      });
    }

    if (!args.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Current volume: **${queue.volume}**`)] 
      });
    }

    const volume = parseInt(args[0]);

    if (isNaN(volume) || volume < 0 || volume > 100) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('Please provide a valid volume between 0 and 100.')] 
      });
    }

    await queue.setVolume(volume);

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Volume set to **${volume}**.`)] 
    });
  },
};
