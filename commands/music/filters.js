const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'filters',
  description: 'Apply or remove audio filters.',
  category: 'Music',
  async execute(message, args) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')]
      });
    }

    const availableFilters = [
      'bassboost',
      'echo',
      'karaoke',
      'nightcore',
      'vaporwave',
      'flanger',
      'reverse',
      'treble',
      'normalizer',
      'phaser'
    ];

    if (!args.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Current filters: ${queue.filters.length ? queue.filters.join(', ') : 'None'}`)]
      });
    }

    const filter = args[0].toLowerCase();
    if (availableFilters.includes(filter)) {
      const filters = queue.filters.includes(filter) ? queue.filters.filter(f => f !== filter) : [...queue.filters, filter];
      await queue.setFilter(filters);
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Filters updated: ${filters.length ? filters.join(', ') : 'None'}`)]
      });
    } else {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`Available filters: ${availableFilters.join(', ')}`)]
      });
    }
  },
};
