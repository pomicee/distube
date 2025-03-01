const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Display the current song queue.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue || !queue.songs.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music in the queue!')]
      });
    }

    const queueEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Current Song Queue')
      .setDescription(queue.songs.map((song, index) => `**${index + 1}**. ${song.name}`).join('\n')) 
      .setFooter({ text: `Total songs: ${queue.songs.length}` });

    return message.channel.send({ embeds: [queueEmbed] }); 
  },
};
